/**
 * Copyright (C) 2012 fme AG.
 *
 * This file is part of the myGengo Alfresco integration implmented by fme AG (http://alfresco.fme.de).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.myGengo.alfresco.polling;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.alfresco.repo.batch.BatchProcessor;
import org.alfresco.repo.batch.BatchProcessor.BatchProcessWorker;
import org.alfresco.repo.lock.JobLockService;
import org.alfresco.repo.lock.LockAcquisitionException;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.transaction.RetryingTransactionHelper.RetryingTransactionCallback;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.google.common.collect.Iterables;
import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoAccountService;
import com.myGengo.alfresco.account.MyGengoServiceException;
import com.myGengo.alfresco.model.MyGengoModel;
import com.myGengo.alfresco.translate.MyGengoTranslationService;
import com.myGengo.alfresco.utils.MyGengoUtils;

/**
 * Alfresco background job the fetch myGengo translation jobs updates &amp; comments periodically 
 * 
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoPollingJob implements Job{

	/** The logger. */
    private static final Log logger = LogFactory.getLog(MyGengoPollingJob.class);

	private static final String MY_GENGO_SITE_CONTAINER = "myGengo";
	private MyGengoTranslationService translationService;
	private MyGengoAccountService accountService;

	private String runAsUser;
	private TransactionService transactionService;
	private JobLockService jobLockService;
	private NodeService nodeService;
	private SiteService siteService;

	
	public void execute(JobExecutionContext context) throws JobExecutionException
    {
		execute();
    }
	
	
	public void execute() throws JobExecutionException {
		String lock = null;
		try {
			logger.info("getting lock");
			lock = jobLockService.getLock(MyGengoTranslationService.LOCK_QNAME, MyGengoTranslationService.LOCK_TTL, 0, 1);
			jobLockService.refreshLock(lock, MyGengoTranslationService.LOCK_QNAME, MyGengoTranslationService.LOCK_TTL, new JobLockService.JobLockRefreshCallback() {
				
				public void lockReleased() {
					logger.info("lock released");
				}
				
				public boolean isActive() {
					return true;
				}
			});
			
			final Map<MyGengoAccount, Collection<NodeRef>> myGengoJobs = getMyGengoJobs();

			final ConcurrentHashMap<NodeRef, MyGengoAccount> accountMap = new ConcurrentHashMap<NodeRef, MyGengoAccount>(20);
			
			// fetch comment updates. 10 worker threads & batchsize of 5
	        BatchProcessWorker<NodeRef> commentWorker = new MyGengoCommentBatchProcessWorker(accountMap, nodeService, accountService, translationService, runAsUser);
			BatchProcessor<NodeRef> batchProcessor = new BatchProcessor<NodeRef>(
                    "MyGengoRefreshTranslationComments",
                    transactionService.getRetryingTransactionHelper(),
                    MyGengoUtils.getTranslationCommentsProvider(Iterables.concat(myGengoJobs.values())),
                    10, 5,
                    null, logger, 5);
            batchProcessor.process(commentWorker, true);
            
            //fetch translation job updates. 10 worker threads & batch size of 1
            BatchProcessWorker<MyGengoJobBatchEntry> jobWorker = new MyGengoJobsBatchProcessWorker(translationService, runAsUser);
            BatchProcessor<MyGengoJobBatchEntry> jobPatchProcessor = new BatchProcessor<MyGengoJobBatchEntry>(
                    "MyGengoRefreshTranslations",
                    transactionService.getRetryingTransactionHelper(),
                    MyGengoUtils.getTranslationsProvider(myGengoJobs),
                    10, 1,
                    null, logger, 5);
            jobPatchProcessor.process(jobWorker, true);
            
		}
		catch (LockAcquisitionException e)
        {
            // Don't proceed with the sync if it is running on another node
           logger.warn("MyGengoPollingJob already running in another thread. Execute aborted");
           return;
        } finally {
        	try{
        		jobLockService.releaseLock(lock, MyGengoTranslationService.LOCK_QNAME);
        	}catch (Exception e) {
				logger.warn("releasing lock failed", e);
			}
        }

	}

	private Map<MyGengoAccount, Collection<NodeRef>> getMyGengoJobs() {
		final Map<MyGengoAccount, Collection<NodeRef>> myGengoJobs = new HashMap<MyGengoAccount, Collection<NodeRef>>();
		
		AuthenticationUtil.runAs(new AuthenticationUtil.RunAsWork<Void>() {
			public Void doWork() {
				executeWithinTransaction();
				return null;
			}

			private void executeWithinTransaction() {
				transactionService.getRetryingTransactionHelper()
						.doInTransaction(
								new RetryingTransactionCallback<Void>() {
									public Void execute() throws Exception {
										for (NodeRef myGengoContainerRef : getMyGengoContainers()) {
											Set<NodeRef> jobRefs = Collections.emptySet();
											MyGengoAccount accountInfo;
											try{
												accountInfo = accountService.refreshAccountInfo(myGengoContainerRef);
											}catch (MyGengoServiceException e) {
												logger.error("unable to refresh account info", e);
												return null;
											}
											jobRefs = MyGengoUtils.getMyGengoJobs(myGengoContainerRef, nodeService);
											myGengoJobs.put(accountInfo, jobRefs);
										}
										return null;
									}
								});
			}
		}, runAsUser);
		return myGengoJobs;
	}

	private Set<NodeRef> getMyGengoContainers() {
		Set<NodeRef> myGengoContainers = new HashSet<NodeRef>();
		List<SiteInfo> sites = siteService.listSites(null, null);
		for (SiteInfo site : sites) {
			// check if Site has an myGengo Container
			if (siteService.hasContainer(site.getShortName(),
					MY_GENGO_SITE_CONTAINER)) {
				NodeRef myGengoContainer = siteService.getContainer(
						site.getShortName(), MY_GENGO_SITE_CONTAINER);
				if (nodeService.hasAspect(myGengoContainer,
						MyGengoModel.ASPECT_ACCOUNT)) {
					myGengoContainers.add(myGengoContainer);
				}
			}
		}
		return myGengoContainers;
	}

	
	public void setTranslationService(
			MyGengoTranslationService translationService) {
		this.translationService = translationService;
	}

	public void setAccountService(MyGengoAccountService accountService) {
		this.accountService = accountService;
	}
	
	public void setTransactionService(TransactionService transactionService) {
		this.transactionService = transactionService;
	}
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	public void setSiteService(SiteService siteService) {
		this.siteService = siteService;
	}
	public void setJobLockService(JobLockService jobLockService) {
		this.jobLockService = jobLockService;
	}
	public void setRunAsUser(String runAsUser) {
		this.runAsUser = runAsUser;
	}

}