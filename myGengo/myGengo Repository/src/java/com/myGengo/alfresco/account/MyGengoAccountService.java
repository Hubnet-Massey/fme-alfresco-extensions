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

import org.alfresco.service.cmr.repository.NodeRef;

/**
 * 
 * declares service API to handle &amp; manage the myGengo accounts 
 * 
 * @author Jan Pfitzner, fme AG (www.fme.de)
 *
 */
public interface MyGengoAccountService {
	
	
	/**
	 * fetches the account details for the given myGengo API keys
	 * 
	 * @param publicKey public API key
	 * @param privateKey private API Key
	 * @param appName application name
	 * @return the fetched account data
	 * @throws MyGengoServiceException if an error occurs
	 */
	public MyGengoAccount loadAccountInfo(String publicKey, String privateKey, String appName) throws MyGengoServiceException;
	
	/**
	 * refreshed the MyGengoAccount data of the specified site container using myGengo REST API
	 * 
	 * @param containerRef NoedRef of site container where the account data should be saved
	 * 
	 * @return the refreshed MyGengoAcount data
	 * @throws MyGengoServiceException if an exception occurs
	 */
	public MyGengoAccount refreshAccountInfo(NodeRef containerRef) throws MyGengoServiceException;
	
	/**
	 * gets the MyGengoAccount data of the specified site container
	 * 
	 * @param containerRef NodeRef of site container where the account data should be saved
	 * @return the  MyGengoAcount data
	 */
	public MyGengoAccount getAccountInfo(NodeRef containerRef);
	
	/**
	 * saves the given MyGengoAccount to the specified container NodeRef
	 * 
	 * @param containerRef NodeRef of site container where the account data should be saved
	 * @param myGengoAccount myGengoAccount data to save
	 * @throws MyGengoServiceException if an exception occurs
	 */
	public void saveAccountInfo(NodeRef containerRef, MyGengoAccount myGengoAccount) throws MyGengoServiceException;
	
	/**
	 * removes the MyGengoAccount data from the specified site container
	 * @param containerRef NodeRef of site container where the account data should be removed
	 * @throws MyGengoServiceException if an exception occurs
	 */
	public void removeAccountInfo(NodeRef containerRef) throws MyGengoServiceException;

}
