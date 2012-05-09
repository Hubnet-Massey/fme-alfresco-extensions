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

import java.util.concurrent.ConcurrentHashMap;

import org.alfresco.repo.batch.BatchProcessor;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;

import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoAccountService;
import com.myGengo.alfresco.translate.MyGengoTranslationService;

/**
 * BatchProcessWorker to fetch new comments from myGengo
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoCommentBatchProcessWorker extends
			BatchProcessor.BatchProcessWorkerAdaptor<NodeRef> {
		private final ConcurrentHashMap<NodeRef, MyGengoAccount> accountMap;
		private NodeService nodeService;
		private MyGengoAccountService accountService;
		private MyGengoTranslationService translationService;
		private String runAsUser;

		public MyGengoCommentBatchProcessWorker(
				ConcurrentHashMap<NodeRef, MyGengoAccount> accountMap, NodeService nodeService, 
				MyGengoAccountService accountService, MyGengoTranslationService translationService, String runAsUser) {
			this.accountMap = accountMap;
			this.nodeService = nodeService;
			this.accountService = accountService;
			this.translationService = translationService;
			this.runAsUser = runAsUser;
		}

		@Override
		public void beforeProcess() throws Throwable
		{
		    AuthenticationUtil.pushAuthentication();
		}

		public void process(NodeRef nodeRef) throws Throwable
		{
		    AuthenticationUtil.setFullyAuthenticatedUser(runAsUser);
		    if (nodeService.exists(nodeRef))
		    {
				NodeRef container = nodeService.getPrimaryParent(nodeRef).getParentRef();
				MyGengoAccount accountInfo;
				if (accountMap.containsKey(container)){
					accountInfo = accountMap.get(container);
				}else{
					accountInfo = accountService.getAccountInfo(container);
					accountMap.put(container, accountInfo);
				}
		        translationService.refreshTranslationComments(nodeRef, accountInfo);
		    }
		}

		@Override
		public void afterProcess() throws Throwable
		{
		    AuthenticationUtil.popAuthentication();
		}
	}