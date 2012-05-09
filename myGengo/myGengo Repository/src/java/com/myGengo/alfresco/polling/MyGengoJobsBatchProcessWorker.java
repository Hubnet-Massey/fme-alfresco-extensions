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
import java.util.List;

import org.alfresco.repo.batch.BatchProcessor;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeRef;

import com.google.common.collect.Iterables;
import com.myGengo.alfresco.translate.MyGengoTranslationService;

/**
 * BatchProcessWorker to fetch updates for given MyGengoJobBatchEntry ({@link MyGengoJobBatchEntry})
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoJobsBatchProcessWorker extends BatchProcessor.BatchProcessWorkerAdaptor<MyGengoJobBatchEntry> {

	private MyGengoTranslationService translationService;
	private String runAsUser;

	public MyGengoJobsBatchProcessWorker(MyGengoTranslationService translationService, String runAsUser) {
		this.translationService = translationService;
		this.runAsUser = runAsUser;
	}
	

	@Override
	public void beforeProcess() throws Throwable
	{
	    AuthenticationUtil.pushAuthentication();
	}

	@Override
	public void process(MyGengoJobBatchEntry entry) throws Throwable {
		AuthenticationUtil.setFullyAuthenticatedUser(runAsUser);
	    Collection<NodeRef> jobRefs = entry.getJobRefs();
	    Iterable<List<NodeRef>> partition = Iterables.partition(jobRefs, 50);
	    for (List<NodeRef> partitionJobs : partition) {
	    	translationService.refreshTranslations(entry.getAccount(), partitionJobs);
		}
		
	}

	@Override
	public void afterProcess() throws Throwable
	{
	    AuthenticationUtil.popAuthentication();
	}

}
