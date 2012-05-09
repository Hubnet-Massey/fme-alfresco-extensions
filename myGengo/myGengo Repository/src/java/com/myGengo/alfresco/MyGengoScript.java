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

package com.myGengo.alfresco;

import java.util.Collection;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.lang.StringUtils;

import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoAccountService;
import com.myGengo.alfresco.account.MyGengoServiceException;
import com.myGengo.alfresco.model.MyGengoModel;
import com.myGengo.alfresco.translate.MyGengoLanguagePair;
import com.myGengo.alfresco.translate.MyGengoQuote;
import com.myGengo.alfresco.translate.MyGengoTranslationService;
import com.mygengo.client.enums.Tier;
import com.mygengo.client.payloads.TranslationJob;

/**
 * 
 * Scripted myGeno service for executing actions using myGengos REST API
 * 
 * @author Jan Pfitzner
 *
 */
public class MyGengoScript extends BaseScopableProcessorExtension {
	
	private MyGengoAccountService accountService = null;
	private MyGengoTranslationService translationService = null;
	private ServiceRegistry serviceRegistry;

	/**
	 * fetches the account details for the given myGengo API keys
	 * 
	 * @param publicKey public API key
	 * @param privateKey private API Key
	 * @param appName application name
	 * @return the fetched account data
	 * @throws MyGengoServiceException if an error occurs
	 */
	public MyGengoAccount loadAccountInfo(final String publicKey,
			final String privateKey, final String appName) throws MyGengoServiceException {
		return accountService.loadAccountInfo(publicKey, privateKey, appName );
	}
	
	/**
	 * refreshes the account data of the specified site container
	 * 
	 * @param siteContainer myGengo site container
	 * @return the refreshed account data
	 * @throws MyGengoServiceException if an error occurs
	 */
	public MyGengoAccount refreshAccountInfo(ScriptNode siteContainer) throws MyGengoServiceException {
		return accountService.refreshAccountInfo(siteContainer.getNodeRef());
	}
	
	/**
	 * saves the given account data to the specified node {@link MyGengoModel#ASPECT_ACCOUNT}
	 * @param siteContainer
	 * @param account
	 * @throws MyGengoServiceException if an error occurs
	 */
	public void saveAccount(ScriptNode siteContainer, MyGengoAccount account) throws MyGengoServiceException{
		accountService.saveAccountInfo(siteContainer.getNodeRef(), account);
	}
	
	/**
	 * removes the myMengo account data on the specified site container
	 * 
	 * @param siteContainer myGengo site container
	 * @throws MyGengoServiceException if an error occurs
	 */
	public void removeAccountInfo(ScriptNode siteContainer) throws MyGengoServiceException {
		accountService.removeAccountInfo(siteContainer.getNodeRef());
	}
	
	/**
	 * gets the account data of the specified site container
	 * 
	 * @param siteContainer myGengo site container
	 * @return account data of the specified site container
	 * @throws MyGengoServiceException if an error occurs
	 */
	public MyGengoAccount getAccountInfo(ScriptNode siteContainer) throws MyGengoServiceException {
		return accountService.getAccountInfo(siteContainer.getNodeRef());
	}

	/**
	 * fetches the language pairs from myGengo service and saves them to the given site container node {@link MyGengoModel#PROP_LANGUAGES}  
	 * 
	 * @param siteContainer myGengo site container
	 * @return collection of language pairs
	 * @throws MyGengoServiceException if an error occurs
	 */
	public Collection<MyGengoLanguagePair> loadLanguages(ScriptNode siteContainer)  throws MyGengoServiceException {
		return translationService.refreshLanguagePairs(getAccountInfo(siteContainer), siteContainer.getNodeRef());
	}
	
	/**
	 * returns the language pairs of the given site container.
	 * 
	 * @param siteContainer myGengo site container
	 * @return collection of language pairs
	 * @throws MyGengoServiceException if an error occurs
	 */
	public Collection<MyGengoLanguagePair> getLanguages(ScriptNode siteContainer)  throws MyGengoServiceException {
		return translationService.getLanguagePairs(siteContainer.getNodeRef());
	}
	
	/**
	 * requests an official quote via myGengo REST API 
	 * 
	 * @param siteContainer myGengo site container
	 * @param slug title
	 * @param textToTranslate text that should be translated
	 * @param sourceLanguageCode language code of the given text (e.g. "en" for english)
	 * @param targetLanguageCode language code of the requested translation
	 * @param tier tier/level that should be used
	 * 
	 * @return the official quote
	 * @throws MyGengoServiceException if an error occurs
	 */
	public MyGengoQuote getQuote(ScriptNode siteContainer, String slug, String textToTranslate, String sourceLanguageCode, String targetLanguageCode, String tier) throws MyGengoServiceException{
		TranslationJob job = new TranslationJob(slug, textToTranslate, sourceLanguageCode, targetLanguageCode, Tier.valueOf(tier.toUpperCase()));
		return translationService.getQuote(getAccountInfo(siteContainer), job);
	}
	
	/**
	 * 
	 * requests a new myGengo translation job 
	 * 
	 * @param siteContainer myGengo site container
	 * @param slug title
	 * @param textToTranslate text that should be translated
	 * @param sourceLanguageCode  language code of the given text (e.g. "en" for english)
	 * @param targetLanguageCode language code of the requested translation
	 * @param tier tier/level that should be used
	 * @param comment initial commment (optional)
	 * @param autoApprove true if the translation shoudl be approved automatically
	 * @return the created translation job {@link MyGengoModel#TYPE_TRANSLATIONJOB}
	 * @throws MyGengoServiceException if an error occurs
	 */
	public ScriptNode orderTranslation(ScriptNode siteContainer, String slug, String textToTranslate, String sourceLanguageCode, String targetLanguageCode, String tier, String comment, boolean autoApprove) throws MyGengoServiceException{
		TranslationJob job = new TranslationJob(slug, textToTranslate, sourceLanguageCode, targetLanguageCode, Tier.valueOf(tier.toUpperCase()));
		if (StringUtils.isNotBlank(comment)){
			job.setComment(comment);
		}
		job.setAutoApprove(autoApprove);
		NodeRef nodeRef = translationService.orderTranslation(siteContainer.getNodeRef(), getAccountInfo(siteContainer), job);
		return new ScriptNode(nodeRef, serviceRegistry, getScope());
	}
	
	/**
	 * fetches updates for the given translation job incl. comments via myGengo API
	 * 
	 * @param job the translation job that should be refreshed
	 * @param siteContainer myGengo site container
	 * @throws MyGengoServiceException if an error occurs
	 */
	public void refreshJob(ScriptNode job, ScriptNode siteContainer) throws MyGengoServiceException {
		MyGengoAccount accountInfo = getAccountInfo(siteContainer);
		this.translationService.refreshTranslation(job.getNodeRef(), accountInfo);
		this.translationService.refreshTranslationComments(job.getNodeRef(), accountInfo);
		job.reset();
	}
	
	/**
	 * fetches updates for all translation jobs of the specified site container
	 *  
	 * @param siteContainer myGengo site container
	 * @param includeApproved true if also approved translations should be refreshed
	 * @throws MyGengoServiceException if an error occurs
	 */
	public void refreshJobs(ScriptNode siteContainer, boolean includeApproved) throws MyGengoServiceException {
		MyGengoAccount accountInfo = getAccountInfo(siteContainer);
		this.translationService.refreshTranslations(siteContainer.getNodeRef(), accountInfo, includeApproved);
	}
	
	/**
	 * cancel the specified translation job
	 * 
	 * @param job the translation job that should be canceled
	 * @param container myGengo site container
	 * @throws MyGengoServiceException if an error occurs
	 */
	public void cancelJob(ScriptNode job, ScriptNode container)throws MyGengoServiceException {
		MyGengoAccount accountInfo = getAccountInfo(container);
		this.translationService.cancelJob(job.getNodeRef(), accountInfo);
	}
	
	
	//-- Setter --//
	
	public void setAccountService(MyGengoAccountService accountService) {
		this.accountService = accountService;
	}
	
	public void setTranslationService(
			MyGengoTranslationService translationService) {
		this.translationService = translationService;
	}

	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
}
