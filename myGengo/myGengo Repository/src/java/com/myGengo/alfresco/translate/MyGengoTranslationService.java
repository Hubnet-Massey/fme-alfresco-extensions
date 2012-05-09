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

package com.myGengo.alfresco.translate;

import java.util.Collection;
import java.util.Map;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;

import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoServiceException;
import com.myGengo.alfresco.model.MyGengoModel;
import com.mygengo.client.payloads.TranslationJob;

public interface MyGengoTranslationService {
	
	 /** The name of the lock used to ensure that a synchronize does not run on more than one node at the same time. */
    public static final QName LOCK_QNAME = QName.createQName(NamespaceService.SYSTEM_MODEL_1_0_URI,
            "MyGengoPollingJob");

    /** The time this lock will persist for in the database (now only 1 minutes but refreshed at regular intervals). */
    public static final long LOCK_TTL = 1000 * 60 * 1;

    /**
     * fetches the language pairs from myGengo service and saves them to the given site container node {@link MyGengoModel#PROP_LANGUAGES}
     * 
     * @param account myGengo account
     * @param nodeRef nodeRef of siteContainer
     * @return collection of language pairs
     * @throws MyGengoServiceException if an error occurs
     */
	Collection<MyGengoLanguagePair> refreshLanguagePairs(MyGengoAccount account, NodeRef nodeRef) throws MyGengoServiceException;
	
	/**
	 * returns the language pairs of the given site container.
	 * 
	 * @param nodeRef nodeRef of siteContainer
	 * @return collection of language pairs
	 * @throws MyGengoServiceException
	 */
	Collection<MyGengoLanguagePair> getLanguagePairs(NodeRef nodeRef) throws MyGengoServiceException;
	
	/**
	 * requests an official quote via myGengo API
	 *  
	 * @param account myGengo account
	 * @param job translation job
	 * @return
	 * @throws MyGengoServiceException if an error occurs
	 */
	MyGengoQuote getQuote(MyGengoAccount account, TranslationJob job) throws MyGengoServiceException;

	/**
	 * requests a new myGengo translation job
	 * 
	 * @param containerRef nodeRef of site container
	 * @param accountInfo myGengo account
	 * @param job translation job
	 * @return nodeRef of the created translation job
	 * 
	 * @throws MyGengoServiceException  if an error occurs
	 */
	NodeRef orderTranslation(NodeRef containerRef, MyGengoAccount accountInfo, TranslationJob job) throws MyGengoServiceException;
	
	/**
	 * fetches &amp; saves updates for the given translation job via myGengo API
	 * 
	 * @param jobRef nodeRef of translation job
	 * @param accountInfo myGengo account
	 * @throws MyGengoServiceException  if an error occurs
	 */
	void refreshTranslation(NodeRef jobRef, MyGengoAccount accountInfo) throws MyGengoServiceException;
	
	/**
	 * fetches &amp; saves updates for all translation jobs of the specified site container 
	 * 
	 * @param containerRef nodeRef of site container
	 * @param accountInfo myGengo account
	 * @param includeApproved true if approved jobs should also be refreshed
	 * @throws MyGengoServiceException  if an error occurs
	 */
	void refreshTranslations(NodeRef containerRef, MyGengoAccount accountInfo, boolean includeApproved) throws MyGengoServiceException;
	
	/**
	 * fetches &amp; saves new comments for the given translation job via myGengo API
	 * 
	 * @param jobRef nodeRef of translation job
	 * @param accountInfo myGengo account
	 * @throws MyGengoServiceException  if an error occurs
	 */
	void refreshTranslationComments(NodeRef jobRef, MyGengoAccount accountInfo) throws MyGengoServiceException;

	/**
	 * returns the language pairs of the given site container.
	 * 
	 * @param containerRef nodeRef of site container
	 * @return collection of language pairs
	 * @throws MyGengoServiceException if an error occurs
	 */
	Map<String,MyGengoLanguage> getLanguages(NodeRef containerRef) throws MyGengoServiceException;
	
	/**
	 * adds a new comment to the specified translation job
	 * 
	 * @param jobRef nodeRef of translation job
	 * @param comment commment to add
	 * @param accountInfo myGengo account
	 * @throws MyGengoServiceException if an error occurs
	 */
	void addJobComment(NodeRef jobRef, String comment, MyGengoAccount accountInfo) throws MyGengoServiceException;
	
	/**
	 * approves the given translation job
	 * 
	 * @param jobRef nodeRef of translation job
	 * @param feedbackTranslator feedback comment to the translator
	 * @param feedbackMyGengo feedback comment to myGengo service
	 * @param rating rating (1 to 5 stars)
	 * @param feedbackIsPublic true if the feedback i public
	 * @param accountInfo myGengo account 
	 * @throws MyGengoServiceException if an error occurs
	 */
	void approveTranslation(NodeRef jobRef, String feedbackTranslator, String feedbackMyGengo, int rating, boolean feedbackIsPublic, MyGengoAccount accountInfo) throws MyGengoServiceException;
	
	/**
	 * revises the given translation job
	 * 
	 * @param jobRef nodeRef of translation job
	 * @param reviseComment revise comment
	 * @param accountInfo myGengo account
	 * @throws MyGengoServiceException if an error occurs
	 */
	void reviseTranslation(NodeRef jobRef, String reviseComment, MyGengoAccount accountInfo) throws MyGengoServiceException;

	/**
	 * cancels and deletes the given translation job
	 *  
	 * @param jobRef nodeRef of translation job
	 * @param accountInfo myGengo account
	 * @throws MyGengoServiceException if an error occurs
	 */
	void cancelJob(NodeRef jobRef, MyGengoAccount accountInfo) throws MyGengoServiceException;

	/**
	 * rejects the given translation job
	 * 
	 * @param jobRef nodeRef of translation job
	 * @param rejectComment reject comment
	 * @param rejectReason reject reason
	 * @param captcha captcha user input
	 * @param requeue true if the job should be requeued, false if it should be canceled &amp; refunded
	 * @param accountInfo myGengo account
	 * 
	 * @throws MyGengoServiceException if an error occurs
	 */
	void rejectTranslation(NodeRef jobRef, String rejectComment, String rejectReason, String captcha, boolean requeue,	MyGengoAccount accountInfo) throws MyGengoServiceException;

	/**
	 * fetches &amp; saves the specified translation jobs
	 * 
	 * @param accountInfo myGengo account
	 * @param jobRefs collection of nodeRefs of translation jobs
	 * @throws MyGengoServiceException if an error occurs
	 */
	void refreshTranslations(MyGengoAccount accountInfo, Collection<NodeRef> jobRefs)throws MyGengoServiceException;
}

