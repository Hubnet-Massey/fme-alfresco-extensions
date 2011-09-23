/*
 * Copyright (C) 2011 fme AG
 * 
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.fme.alfresco.bootstrap;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.transaction.RetryingTransactionHelper;
import org.alfresco.repo.transaction.RetryingTransactionHelper.RetryingTransactionCallback;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.ScriptService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.NamespaceService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

/**
 * Implements a bootstrap bean that runs a list of scripts from the classpath
 * against the Alfresco Repository to allow bootstrap coded being coded in
 * javascript.
 * 
 * @author Florian Maul (fme AG)
 */
public class ScriptBootstrap {

	private static Log logger = LogFactory.getLog(ScriptBootstrap.class);

	private List<String> scriptResources;
	private PersonService personService;
	private AuthenticationService authenticationService;
	private NodeService nodeService;
	private ScriptService scriptService;
	private SearchService searchService;
	private NamespaceService namespaceService;
	private RetryingTransactionHelper retryingTransactionHelper;
	private String companyHomePath;
	private StoreRef storeRef;
	private String runAsUser;

	private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

	/**
	 * Init method that is called from Spring when the application context is
	 * initialized.
	 */
	public void init() {

		logger.debug("Script Bootstrap starting.");

		for (String locationPattern : scriptResources) {

			for (Resource res : resolveLocations(locationPattern)) {
				logger.info("Running bootstrap script " + getScriptName(res));
				executeScriptAsSystemUser(res);
			}

		}

		logger.debug("Script Bootstrap ended.");
	}

	private Resource[] resolveLocations(String locationPattern) {
		try {
			return resolver.getResources(locationPattern);
		} catch (IOException e) {
			throw new AlfrescoRuntimeException(
					"Error resolving script location pattern '"
							+ locationPattern + "'");
		}
	}

	private String getScriptName(Resource res) {
		try {
			return res.getURI().toString();
		} catch (IOException e) {
			throw new AlfrescoRuntimeException(
					"Error reading script resource.", e);
		}

	}

	private void executeScriptAsSystemUser(final Resource res) {
		AuthenticationUtil.runAs(new RunAsWork<Void>() {
			@Override
			public Void doWork() throws Exception {
				executeScriptInTransaction(res);
				return null;
			}

		}, runAsUser);
	}

	private void executeScriptInTransaction(final Resource res) {
		retryingTransactionHelper.doInTransaction(
				new RetryingTransactionCallback<Void>() {
					@Override
					public Void execute() throws Throwable {
						executeScript(res);
						return null;
					}
				}, false, true);
	}

	private void executeScript(Resource res) {

		// get the references we need to build the default scripting data-model
		String userName = authenticationService.getCurrentUserName();
		NodeRef personRef = personService.getPerson(userName);
		NodeRef homeSpaceRef = (NodeRef) nodeService.getProperty(personRef,
				ContentModel.PROP_HOMEFOLDER);

		// All node references point to company home
		NodeRef companyHomeRef = getCompanyHome();
		NodeRef spaceRef = companyHomeRef;
		NodeRef documentRef = companyHomeRef;
		NodeRef scriptRef = null;

		// the default scripting model provides access to well known objects and
		// searching facilities - it also provides basic
		// create/update/delete/copy/move services
		Map<String, Object> model = scriptService.buildDefaultModel(personRef,
				companyHomeRef, homeSpaceRef, scriptRef, documentRef, spaceRef);

		// execute the script at the specified script location
		scriptService.executeScript(new ResourceScriptLocation(res), model);
	}

	/**
	 * Gets the company home node
	 * 
	 * @return the company home node ref
	 */
	private NodeRef getCompanyHome() {
		NodeRef companyHomeRef;

		List<NodeRef> refs = searchService.selectNodes(
				nodeService.getRootNode(storeRef), companyHomePath, null,
				namespaceService, false);
		if (refs.size() != 1) {
			throw new IllegalStateException("Invalid company home path: "
					+ companyHomePath + " - found: " + refs.size());
		}
		companyHomeRef = refs.get(0);

		return companyHomeRef;
	}

	public void setScriptResources(List<String> scriptResources) {
		this.scriptResources = scriptResources;
	}

	public void setAuthenticationService(
			AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}

	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}

	public void setPersonService(PersonService personService) {
		this.personService = personService;
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}

	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

	public void setRetryingTransactionHelper(
			RetryingTransactionHelper retryingTransactionHelper) {
		this.retryingTransactionHelper = retryingTransactionHelper;
	}

	public void setStoreUrl(String storeUrl) {
		this.storeRef = new StoreRef(storeUrl);
	}

	public void setCompanyHomePath(String companyHomePath) {
		this.companyHomePath = companyHomePath;
	}

	public void setRunAsUser(String runAsUser) {
		this.runAsUser = runAsUser;
	}

}
