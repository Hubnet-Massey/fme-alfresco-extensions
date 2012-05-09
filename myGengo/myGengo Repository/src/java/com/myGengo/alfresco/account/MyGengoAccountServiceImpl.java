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

package com.myGengo.alfresco.account;


import java.io.Serializable;
import java.util.Date;
import java.util.Map;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;

import com.google.gdata.util.common.base.Preconditions;
import com.myGengo.alfresco.model.MyGengoModel;
import com.mygengo.client.MyGengoClient;

/**
 * @author Jan Pfitzner, fme AG (www.fme.de)
 *
 */
public class MyGengoAccountServiceImpl implements MyGengoAccountService {
	
	/**
     * Logger instance.
     */
	private static final Log LOGGER = LogFactory.getLog(MyGengoAccountServiceImpl.class);
	
	private NodeService nodeService = null;
	private boolean useSandbox = false;

	 /**
     * {@inheritDoc}
     */
	@Override
	public MyGengoAccount loadAccountInfo(final String publicKey,
			final String privateKey, final String appName) throws MyGengoServiceException {
		
		Preconditions.checkNotNull(privateKey);
		Preconditions.checkNotNull(publicKey);
		
		MyGengoClient client = new MyGengoClient(publicKey, privateKey, useSandbox);
		MyGengoAccount account = new MyGengoAccount();
		account.setPrivateKey(privateKey);
		account.setPublicKey(publicKey);
		account.setApplicationName(appName);
		try {
			JSONObject response = client.getAccountBalance(); //{ "opstat" : "ok", "response" : { "credits": "25.32" } }
			if (response.has("response")){
				JSONObject responseBody = response.getJSONObject("response");
				account.setCredits(responseBody.getString("credits"));
			}
			response = client.getAccountStats();//{ "opstat" : "ok", "response" : { "credits_spent" : "1023.31", "user_since" : 1234089500 } }
			if (response.has("response")){
				JSONObject responseBody = response.getJSONObject("response");
				account.setCreditsSpent(responseBody.getString("credits_spent"));
				account.setUserSince(new Date(1000 * responseBody.getLong("user_since")));
			}
		} catch (Throwable e) {
			LOGGER.error(e);
			throw new MyGengoServiceException("loading Account Info failed",e);
		}
		return account;
	}

	/**
	 * @see MyGengoAccountService#refreshAccountInfo(NodeRef)
	 */
	@Override
	public MyGengoAccount refreshAccountInfo(final NodeRef containerRef) throws MyGengoServiceException{
		MyGengoAccount myGengoAccount = getAccountInfo(containerRef);
		myGengoAccount = loadAccountInfo(myGengoAccount.getPublicKey(), myGengoAccount.getPrivateKey(), myGengoAccount.getApplicationName());
		saveAccountInfo(containerRef, myGengoAccount);
		return myGengoAccount;
	}

	 /**
     * {@inheritDoc}
     */
	@Override
	public void removeAccountInfo(final NodeRef containerRef) throws MyGengoServiceException {
		Preconditions.checkNotNull(containerRef);
		Preconditions.checkArgument(this.nodeService.exists(containerRef),"NodeRef %s doesn't exist", containerRef.toString());
		try{
			this.nodeService.removeAspect(containerRef, MyGengoModel.ASPECT_ACCOUNT);
		}
		catch (Throwable e) {
			LOGGER.error(e);
			throw new MyGengoServiceException("removing Account Info failed",e);
		}
	}
	
	 /**
     * {@inheritDoc}
     */
	@Override
	public MyGengoAccount getAccountInfo(final NodeRef containerRef) {
		Preconditions.checkNotNull(containerRef);
		Preconditions.checkArgument(this.nodeService.exists(containerRef),"NodeRef %s doesn't exist", containerRef.toString());
		Preconditions.checkState(this.nodeService.hasAspect(containerRef, MyGengoModel.ASPECT_ACCOUNT), "nodeRef %s doesn't have aspect myGengo:account", containerRef.toString());
		Map<QName, Serializable> properties = this.nodeService.getProperties(containerRef);
		return new MyGengoAccount(properties);
	}

	/**
     * {@inheritDoc}
     */
	@Override
	public void saveAccountInfo(final NodeRef containerRef, final MyGengoAccount myGengoAccount) throws MyGengoServiceException{
		Preconditions.checkNotNull(containerRef);
		Preconditions.checkArgument(this.nodeService.exists(containerRef),"NodeRef %s doesn't exist", containerRef.toString());
		Map<QName, Serializable> properties = myGengoAccount.getProperties();
		if (!this.nodeService.hasAspect(containerRef, MyGengoModel.ASPECT_ACCOUNT)){
			this.nodeService.addAspect(containerRef, MyGengoModel.ASPECT_ACCOUNT, properties);
		}else{
			this.nodeService.addProperties(containerRef, properties);
		}
		
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	
	public void setUseSandbox(boolean useSandbox) {
		this.useSandbox = useSandbox;
	}

	
}
