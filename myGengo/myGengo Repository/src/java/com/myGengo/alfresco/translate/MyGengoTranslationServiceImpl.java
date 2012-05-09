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

import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.ImageIO;

import org.alfresco.model.ContentModel;
import org.alfresco.model.ForumModel;
import org.alfresco.repo.batch.BatchProcessor;
import org.alfresco.repo.batch.BatchProcessor.BatchProcessWorker;
import org.alfresco.repo.lock.JobLockService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.alfresco.service.transaction.TransactionService;
import org.alfresco.util.GUID;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import com.google.common.collect.Lists;
import com.google.gdata.util.common.html.HtmlToText;
import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoAccountService;
import com.myGengo.alfresco.account.MyGengoServiceException;
import com.myGengo.alfresco.model.MyGengoModel;
import com.myGengo.alfresco.polling.MyGengoCommentBatchProcessWorker;
import com.myGengo.alfresco.polling.MyGengoJobBatchEntry;
import com.myGengo.alfresco.polling.MyGengoJobsBatchProcessWorker;
import com.myGengo.alfresco.utils.MyGengoUtils;
import com.mygengo.client.MyGengoClient;
import com.mygengo.client.enums.Rating;
import com.mygengo.client.enums.RejectReason;
import com.mygengo.client.enums.Tier;
import com.mygengo.client.exceptions.ErrorResponseException;
import com.mygengo.client.payloads.Payloads;
import com.mygengo.client.payloads.TranslationJob;

public class MyGengoTranslationServiceImpl implements MyGengoTranslationService {
	private static final String COMMENTS_TOPIC_NAME = "Comments";
	
	/**
     * Logger instance.
     */
	private static final Log LOGGER = LogFactory.getLog(MyGengoTranslationServiceImpl.class);
	
	private boolean useSandbox = false;
	private NodeService nodeService = null;
	private ContentService contentService = null;
	private MyGengoAccountService accountService;
	private TransactionService transactionService;
	private JobLockService jobLockService;
	
	
	@Override
	public Collection<MyGengoLanguagePair> refreshLanguagePairs(MyGengoAccount account, NodeRef nodeRef) throws MyGengoServiceException{
		MyGengoClient client = new MyGengoClient(account.getPublicKey(), account.getPrivateKey(), useSandbox);
		Collection<MyGengoLanguagePair> languagePairs = new ArrayList<MyGengoLanguagePair>();
		Map<String, MyGengoLanguage> languages = getLanguages(account);
		try {
			for (String languageCode : languages.keySet()) {
				JSONObject response = client.getServiceLanguagePairs(languageCode); //http://mygengo.com/api/developer-docs/methods/translate-service-language-pairs-get/
				if (response.has("response")){
					if (LOGGER.isDebugEnabled()){
						 LOGGER.debug("refreshLanguagePairs: " + response.toString());
					}
					JSONArray languagePairsJson = response.getJSONArray("response");
					for (int i = 0; i < languagePairsJson.length(); i++) {
						JSONObject languagePairJson = languagePairsJson.getJSONObject(i);
						MyGengoLanguagePair languagePair = new MyGengoLanguagePair();
						languagePair.setSource(languages.get(languageCode));
						languagePair.setTarget(languages.get(languagePairJson.getString("lc_tgt")));
						languagePair.setTier(Tier.valueOf(languagePairJson.getString("tier").toUpperCase()));
						languagePair.setUnitPrice(languagePairJson.getString("unit_price"));
						if (languagePair.getTier() == Tier.PRO || languagePair.getTier() == Tier.STANDARD || languagePair.getTier() == Tier.ULTRA){
							languagePairs.add(languagePair);
						}
					}
				}
			}
			
			saveLanguagePairs(nodeRef, languagePairs);
			
		} catch (Throwable e) {
			LOGGER.error("loading LanguagePairs failed", e);
			throw new MyGengoServiceException("loading Language Pairs failed",e);
		}
		
		 
		return languagePairs;
	}

	@Override
	public Map<String,MyGengoLanguage> getLanguages(NodeRef nodeRef)
	throws MyGengoServiceException {
		Map<String, MyGengoLanguage> languages = new HashMap<String, MyGengoLanguage>();
		for (MyGengoLanguagePair myGengoLanguagePair : this.getLanguagePairs(nodeRef)) {
			MyGengoLanguage source = myGengoLanguagePair.getSource();
			if (!languages.containsKey(source.getLanguageCode())){
				languages.put(source.getLanguageCode(),source);
			}
			MyGengoLanguage target = myGengoLanguagePair.getTarget();
			if (!languages.containsKey(target.getLanguageCode())){
				languages.put(target.getLanguageCode(),target);
			}
		}
		return languages;
	}


	@Override
	public Collection<MyGengoLanguagePair> getLanguagePairs(NodeRef nodeRef) throws MyGengoServiceException {
		if (!nodeService.hasAspect(nodeRef, MyGengoModel.ASPECT_LANGUAGES)){
			return Collections.emptyList();
		}
		try {
			JSONArray languages= new JSONArray((String)nodeService.getProperty(nodeRef, MyGengoModel.PROP_LANGUAGES));
			int length = languages.length();
			Collection<MyGengoLanguagePair> languagePairs = new ArrayList<MyGengoLanguagePair>(length);
			for (int i = 0; i < length; i++) {
				MyGengoLanguagePair languagePair = new MyGengoLanguagePair( languages.getJSONObject(i));
				languagePairs.add(languagePair);
			}
			return languagePairs;
		} catch (Throwable e) {
			LOGGER.error("getting LanguagePairs failed", e);
			throw new MyGengoServiceException("getting LanguagePairs failed",e);
		}
	}
	
	
	@Override
	public MyGengoQuote getQuote(MyGengoAccount account, TranslationJob job)
			throws MyGengoServiceException {
		try{
			MyGengoClient myGengo = new MyGengoClient(account.getPublicKey(), account.getPrivateKey(), this.useSandbox);
			Payloads jobList = new Payloads(); 
			jobList.add(job);
			JSONObject response = myGengo.determineTranslationCost(jobList);
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()){
					 LOGGER.debug("getQuote: " + response.toString());
				}
				JSONArray jobs = response.getJSONObject("response").getJSONArray("jobs");
				JSONObject job1 = jobs.getJSONObject(0);
				return new MyGengoQuote(job1.getLong("unit_count"), job1.getDouble("credits"), job1.getLong("eta"));
				
			}else
			{
				throw new MyGengoServiceException("getting Quote failed");
			}
		}catch (Throwable e) {
			LOGGER.error("getting Quote failed", e);
			throw new MyGengoServiceException("getting Quote failed",e);
		}
	}
	
	public NodeRef orderTranslation(NodeRef parentRef, MyGengoAccount account, TranslationJob job)
	throws MyGengoServiceException{
		try{
			MyGengoClient myGengo = new MyGengoClient(account.getPublicKey(), account.getPrivateKey(), this.useSandbox);
			JSONObject response = myGengo.postTranslationJob(job);
			if (response.has("response")){
				 if (LOGGER.isDebugEnabled()){
					 LOGGER.debug("create job: " + response.toString());
				 }
				 Collection<MyGengoLanguagePair> languagePairs = getLanguagePairs(parentRef);
				 Map<QName, Serializable> jobProperties = getJobProperties(
						  response.getJSONObject("response").getJSONObject("job"), languagePairs);
				 String nodeName = GUID.generate();
				 jobProperties.put(ContentModel.PROP_NAME, nodeName);
				 NodeRef jobNodeRef =  this.nodeService.createNode(
	                        parentRef,
	                        ContentModel.ASSOC_CONTAINS,
	                        QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, 
	                        QName.createValidLocalName(nodeName)), MyGengoModel.TYPE_TRANSLATIONJOB, jobProperties).getChildRef();
				 
				 //add comment if provided
				 if (StringUtils.isNotBlank(job.getComment())){
					 NodeRef commentsFolder = getOrCreateCommentsFolder(jobNodeRef);
		                String name = GUID.generate();
		                ChildAssociationRef createdNode = nodeService.createNode(commentsFolder, ContentModel.ASSOC_CONTAINS, QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(name)), ForumModel.TYPE_POST);
		                ContentWriter writer = contentService.getWriter(createdNode.getChildRef(), ContentModel.PROP_CONTENT, true);
		                writer.setMimetype("text/plain");
		                writer.putContent(job.getComment());
				 }
				 
				 return jobNodeRef;
			}else
			{
				throw new MyGengoServiceException("orderTranslation failed");
			}
		}catch (ErrorResponseException e) {
			LOGGER.error("orderTranslation failed", e);
			if(e.getErrorCode() == ErrorResponseException.CREDITS_INSUFFICIENT){
				throw new MyGengoServiceException("insufficient credits",e);
			}else{
				throw new MyGengoServiceException("orderTranslation failed",e);
			}
		}catch (Throwable e) {
			LOGGER.error("orderTranslation failed", e);
			throw new MyGengoServiceException("orderTranslation failed",e);
		}
	}

	@Override
	public void cancelJob(NodeRef nodeRef, MyGengoAccount accountInfo)
			throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			Integer jobId = Integer.valueOf((String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_JOBID));
			JSONObject response = myGengo.deleteTranslationJob(jobId);
			if (response.has("response")){
				 if (LOGGER.isDebugEnabled()){
					 LOGGER.debug("delete job: " + response.toString());
				 }
				 this.nodeService.deleteNode(nodeRef);
			}
		} catch (Throwable e) {
			LOGGER.error("cancelJob failed", e);
			throw new MyGengoServiceException("cancelJob failed",e);
		}
		
	}
	@Override
	public void refreshTranslation(NodeRef nodeRef, MyGengoAccount accountInfo) throws MyGengoServiceException{
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			Integer jobId = Integer.valueOf((String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_JOBID));
			JSONObject response = myGengo.getTranslationJob(jobId);
			if (response.has("response")){
				 if (LOGGER.isDebugEnabled()){
					 LOGGER.debug("get job: " + response.toString());
				 }
				 Map<QName, Serializable> jobProperties = getJobProperties(
						 response.getJSONObject("response").getJSONObject("job"), Collections.<MyGengoLanguagePair>emptyList());
				 nodeService.addProperties(nodeRef, jobProperties);
				 if (StringUtils.isNotBlank((String)jobProperties.get(MyGengoModel.PROP_PREVIEWURL))){
						BufferedImage translationJobPreviewImage = myGengo.getTranslationJobPreviewImage(jobId);
						ContentWriter writer = contentService.getWriter(nodeRef, MyGengoModel.PROP_TRANSLATIONPREVIEW, true);
						writer.setMimetype("image/png");
						writer.setEncoding("UTF-8");
						OutputStream contentOutputStream = writer.getContentOutputStream();
						ImageIO.write(translationJobPreviewImage, "png", contentOutputStream);
						contentOutputStream.flush();
						contentOutputStream.close();
				 }
			
			}
		} catch (Throwable e) {
			LOGGER.error("refreshJob failed", e);
			throw new MyGengoServiceException("refreshJob failed",e);
		}
	}

	@Override
	public void refreshTranslationComments(NodeRef jobRef, MyGengoAccount accountInfo) throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			Integer jobId = Integer.valueOf((String) nodeService.getProperty(jobRef, MyGengoModel.PROP_JOBID));
			List<ChildAssociationRef> comments = getComments(jobRef);
			List<CommentData>  repoComments= new ArrayList<CommentData>(comments.size());
			for (ChildAssociationRef childAssociationRef : comments) {
				NodeRef commentRef = childAssociationRef.getChildRef();
				String contentString = contentService.getReader(commentRef, ContentModel.PROP_CONTENT).getContentString();
				//remove html tags because myGengo only uses text/plain comments
				contentString = HtmlToText.htmlToPlainText(StringUtils.trim(contentString));
				long timestamp = 0;
				if (nodeService.hasAspect(commentRef, MyGengoModel.ASPECT_COMMENT)){
					timestamp = (Long) nodeService.getProperty(commentRef, MyGengoModel.PROP_COMMENTMODIFIEDTIME);
				}
				repoComments.add(new CommentData(contentString, timestamp, commentRef));
			}
			
			JSONObject response = myGengo.getTranslationJobComments(jobId);
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("comment job: " + response.toString());
				}
				JSONArray jsonThread = response.getJSONObject("response").getJSONArray("thread");
				List<CommentData>  addComments = new ArrayList<CommentData>();
				for (int i = 0; i < jsonThread.length(); i++) {
					JSONObject jsonComment = jsonThread.getJSONObject(i);
					String commentText = jsonComment.getString("body");
					long timestamp = jsonComment.getLong("ctime");
					CommentData jsonCommentData = new CommentData(HtmlToText.htmlToPlainText(StringUtils.trim(commentText)), timestamp);
					boolean add = true;
					for (CommentData commentData : repoComments) {
						if (!commentData.equals(jsonCommentData)){
							//comment not in sync
							if (commentData.comment.equalsIgnoreCase(commentText)){
								//comment text known, timestamp needs to be updated
								Map<QName, Serializable> aspectProperties = new HashMap<QName, Serializable>(1, 1.0f);
								aspectProperties.put(MyGengoModel.PROP_COMMENTMODIFIEDTIME, timestamp);
								nodeService.addAspect(commentData.commentRef, MyGengoModel.ASPECT_COMMENT, aspectProperties );
								add = false;
							}
						}else{
							add = false;
						}
					}
					if (add){
						addComments.add(jsonCommentData);
					}
				}
				
				for (CommentData addComment : addComments) {
					// text & timestamp unknown
					NodeRef commentsFolder = getOrCreateCommentsFolder(jobRef);
	                String name = GUID.generate();
	                ChildAssociationRef createdNode = nodeService.createNode(commentsFolder, ContentModel.ASSOC_CONTAINS, QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(name)), ForumModel.TYPE_POST);
	                ContentWriter writer = contentService.getWriter(createdNode.getChildRef(), ContentModel.PROP_CONTENT, true);
	                writer.setMimetype("text/plain");
	                writer.putContent(addComment.comment);
	                Map<QName, Serializable> aspectProperties = new HashMap<QName, Serializable>(1, 1.0f);
					aspectProperties.put(MyGengoModel.PROP_COMMENTMODIFIEDTIME, addComment.timestamp);
					nodeService.addAspect(createdNode.getChildRef(), MyGengoModel.ASPECT_COMMENT, aspectProperties );
				}
			}
		} catch (Exception e) {
			LOGGER.error("refreshJobComments failed", e);
			throw new MyGengoServiceException("refreshJobComments failed", e);
		}
	}
	
	@Override
	public void addJobComment(NodeRef jobRef, String comment, MyGengoAccount accountInfo) throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			String jobId = (String) nodeService.getProperty(jobRef, MyGengoModel.PROP_JOBID);
			String commentAsText = HtmlToText.htmlToPlainText(StringUtils.trim(comment));
			JSONObject response = myGengo.postTranslationJobComment(Integer.valueOf(jobId), commentAsText);
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("comment job: " + response.toString());
				}
			}else{
				throw new MyGengoServiceException("adding comment failed");
			}
		} catch (Exception e) {
			LOGGER.error("adding comment failed", e);
			throw new MyGengoServiceException("refreshJobComments failed", e);
		}
	}
	
	@Override
	public void approveTranslation(NodeRef nodeRef, String feedbackTranslator,
			String feedbackMyGengo, int rating, boolean feedbackIsPublic, MyGengoAccount accountInfo) throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			String jobId = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_JOBID);
			JSONObject response = myGengo.approveTranslationJob(Integer.valueOf(jobId), Rating.getRating(rating), feedbackTranslator, feedbackMyGengo, feedbackIsPublic);
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("approve job: " + response.toString());
				}
				this.refreshTranslation(nodeRef, accountInfo);
			}else{
				throw new MyGengoServiceException("approving job failed");
			}
		} catch (Exception e) {
			LOGGER.error("approving job failed", e);
			throw new MyGengoServiceException("approving job failed", e);
		}
		
	}
	
	@Override
	public void reviseTranslation(NodeRef nodeRef, String reviseComment,
			MyGengoAccount accountInfo) throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			String jobId = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_JOBID);
			JSONObject response = myGengo.reviseTranslationJob(Integer.valueOf(jobId), reviseComment);
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("revise job: " + response.toString());
				}
				this.refreshTranslation(nodeRef, accountInfo);
			}else{
				throw new MyGengoServiceException("revise job failed");
			}
		} catch (Exception e) {
			LOGGER.error("revise failed", e);
			throw new MyGengoServiceException("revise failed", e);
		}
	}
	
	@Override
	public void rejectTranslation(NodeRef nodeRef, String rejectComment, String rejectReason, String captcha, boolean requeue,
			MyGengoAccount accountInfo) throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			String jobId = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_JOBID);
			JSONObject response = myGengo.rejectTranslationJob(Integer.valueOf(jobId), RejectReason.valueOf(rejectReason.toUpperCase()), rejectComment, captcha, requeue);
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("reject job: " + response.toString());
				}
				this.refreshTranslation(nodeRef, accountInfo);
			}else{
				throw new MyGengoServiceException("reject job failed");
			}
		} catch (Exception e) {
			LOGGER.error("reject failed", e);
			//refresh translation to fetch new captcha URL
			this.refreshTranslation(nodeRef, accountInfo);
			throw new MyGengoServiceException("reject failed", e);
		}
		
	}
	
	@Override
	public void refreshTranslations(NodeRef containerRef, MyGengoAccount accountInfo, boolean includeApproved) throws MyGengoServiceException {
		String lock = null;
		try{
			LOGGER.info("getting lock");
			lock = jobLockService.getLock(MyGengoTranslationService.LOCK_QNAME, MyGengoTranslationService.LOCK_TTL, 0, 1);
			jobLockService.refreshLock(lock, MyGengoTranslationService.LOCK_QNAME, MyGengoTranslationService.LOCK_TTL, new JobLockService.JobLockRefreshCallback() {
				
				public void lockReleased() {
					LOGGER.info("lock released");
				}
				
				public boolean isActive() {
					return true;
				}
			});
			Set<NodeRef> jobRefs = MyGengoUtils.getMyGengoJobs(containerRef, this.nodeService, includeApproved);
			final Map<MyGengoAccount, Collection<NodeRef>> myGengoJobs = new HashMap<MyGengoAccount, Collection<NodeRef>>(1, 1.0f);
			myGengoJobs.put(accountInfo, jobRefs);
			
			final ConcurrentHashMap<NodeRef, MyGengoAccount> accountMap = new ConcurrentHashMap<NodeRef, MyGengoAccount>(20);
			
	        BatchProcessWorker<NodeRef> worker = new MyGengoCommentBatchProcessWorker(accountMap, nodeService, accountService, this, AuthenticationUtil.getFullyAuthenticatedUser());
	        BatchProcessor<NodeRef> batchProcessor = new BatchProcessor<NodeRef>(
	                "MyGengoRefreshTranslationComments",
	                transactionService.getRetryingTransactionHelper(),
	                MyGengoUtils.getTranslationCommentsProvider(jobRefs),
	                10, 5,
	                null, LOGGER, 5);
	        batchProcessor.process(worker, true);
	        
	        BatchProcessWorker<MyGengoJobBatchEntry> jobWorker = new MyGengoJobsBatchProcessWorker(this, AuthenticationUtil.getFullyAuthenticatedUser());
	        BatchProcessor<MyGengoJobBatchEntry> jobPatchProcessor = new BatchProcessor<MyGengoJobBatchEntry>(
	                "MyGengoRefreshTranslations",
	                transactionService.getRetryingTransactionHelper(),
	                MyGengoUtils.getTranslationsProvider(myGengoJobs),
	                5, 1,
	                null, LOGGER, 1);
	        jobPatchProcessor.process(jobWorker, true);
		}finally{
			try{
        		jobLockService.releaseLock(lock, MyGengoTranslationService.LOCK_QNAME);
        	}catch (Exception e) {
				LOGGER.warn("releasing lock failed", e);
			}
		}
	}
	
	@Override
	public void refreshTranslations(MyGengoAccount accountInfo,
			Collection<NodeRef> jobRefs) throws MyGengoServiceException {
		MyGengoClient myGengo = new MyGengoClient(accountInfo.getPublicKey(), accountInfo.getPrivateKey(), this.useSandbox);
		try {
			Map<Integer, NodeRef> jobs = new HashMap<Integer, NodeRef>(jobRefs.size());
			for (NodeRef jobRef : jobRefs) {
				jobs.put(Integer.valueOf((String) nodeService.getProperty(jobRef, MyGengoModel.PROP_JOBID)), jobRef);
			}
			LOGGER.debug("trying to refresh jobs via REST..."+jobRefs.size());
			JSONObject response = myGengo.getTranslationJobs(Lists.newArrayList(jobs.keySet()));
			if (response.has("response")){
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("refresh jobs: " + response.toString());
				}
				JSONArray jsonJobs = response.getJSONObject("response").getJSONArray("jobs");
				for (int i = 0; i < jsonJobs.length(); i++){
					JSONObject jsonJob = jsonJobs.getJSONObject(i);
					Map<QName, Serializable> jobProperties = getJobProperties(
							jsonJob, Collections.<MyGengoLanguagePair>emptyList());
					Integer jobId = Integer.valueOf((String)jobProperties.get(MyGengoModel.PROP_JOBID));
					NodeRef jobRef = jobs.get(jobId);
					nodeService.addProperties(jobRef, jobProperties);
					 if (StringUtils.isNotBlank((String)jobProperties.get(MyGengoModel.PROP_PREVIEWURL))){
							BufferedImage translationJobPreviewImage = myGengo.getTranslationJobPreviewImage(jobId);
							ContentWriter writer = contentService.getWriter(jobRef, MyGengoModel.PROP_TRANSLATIONPREVIEW, true);
							writer.setMimetype("image/png");
							writer.setEncoding("UTF-8");
							OutputStream contentOutputStream = writer.getContentOutputStream();
							ImageIO.write(translationJobPreviewImage, "png", contentOutputStream);
							contentOutputStream.flush();
							contentOutputStream.close();
					 }
				}
			}else{
				throw new MyGengoServiceException("refresh jobs failed");
			}
		} catch (Exception e) {
			LOGGER.error("refresh jobs", e);
			throw new MyGengoServiceException("refresh jobs", e);
		}
		
	}
	
	private class CommentData{
		private final String comment;
		private final long timestamp;
		private NodeRef commentRef;
		public CommentData(String comment, long timestamp, NodeRef commentRef) {
			this.comment = comment;
			this.timestamp = timestamp;
			this.commentRef = commentRef;
		}
		public CommentData(String comment, long timestamp) {
			this.comment = comment;
			this.timestamp = timestamp;
		}
		
		/* (non-Javadoc)
		 * @see java.lang.Object#hashCode()
		 */
		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result + getOuterType().hashCode();
			result = prime * result
					+ ((comment == null) ? 0 : comment.hashCode());
			result = prime * result + (int) (timestamp ^ (timestamp >>> 32));
			return result;
		}
		/* (non-Javadoc)
		 * @see java.lang.Object#equals(java.lang.Object)
		 */
		@Override
		public boolean equals(Object obj) {
			if (this == obj) {
				return true;
			}
			if (obj == null) {
				return false;
			}
			if (!(obj instanceof CommentData)) {
				return false;
			}
			CommentData other = (CommentData) obj;
			if (!getOuterType().equals(other.getOuterType())) {
				return false;
			}
			if (comment == null) {
				if (other.comment != null) {
					return false;
				}
			} else if (!comment.equals(other.comment)) {
				return false;
			}
			if (timestamp != other.timestamp) {
				return false;
			}
			return true;
		}
		private MyGengoTranslationServiceImpl getOuterType() {
			return MyGengoTranslationServiceImpl.this;
		}
		
		
	}
	
	
	
	private Map<QName, Serializable> getJobProperties(JSONObject jsonJob,
			Collection<MyGengoLanguagePair> languagePairs) throws JSONException {
		Map<QName, Serializable> jobProperties = new HashMap<QName, Serializable>();
		String jobId = jsonJob.getString("job_id");
		jobProperties.put(MyGengoModel.PROP_JOBID, jobId);
		jobProperties.put(MyGengoModel.PROP_TEXT, jsonJob.getString("body_src"));
		final String sourceLang = jsonJob.getString("lc_src");
		final String targetLang = jsonJob.getString("lc_tgt");
		jobProperties.put(MyGengoModel.PROP_SOURCELANGUAGE, sourceLang);
		jobProperties.put(MyGengoModel.PROP_TARGETLANGUAGE, targetLang);
		String tier = jsonJob.getString("tier");
		//workaround: we sometimes get ultra_pro as tier where it should be ultra
		if ("ultra_pro".equalsIgnoreCase(tier)){
			tier = "ultra";
		}
		jobProperties.put(MyGengoModel.PROP_TIER, tier);
		if ( jsonJob.has("slug")){
			jobProperties.put(MyGengoModel.PROP_TITLE, jsonJob.getString("slug"));
		}
		jobProperties.put(MyGengoModel.PROP_STATUS, jsonJob.getString("status"));
		jobProperties.put(MyGengoModel.PROP_UNITCOUNT, jsonJob.getLong("unit_count"));
		jobProperties.put(MyGengoModel.PROP_JOBCREDITS, jsonJob.getString("credits"));
		jobProperties.put(MyGengoModel.PROP_ETA, jsonJob.getLong("eta"));
		jobProperties.put(MyGengoModel.PROP_MODIFIED, new Date());
		jobProperties.put(MyGengoModel.PROP_AUTOAPPROVE, MyGengoClient.MYGENGO_TRUE.equalsIgnoreCase(jsonJob.getString("auto_approve")));
		if(jsonJob.has("captcha_url")){
			jobProperties.put(MyGengoModel.PROP_CAPTCHAURL, jsonJob.getString("captcha_url"));
		}
		if(jsonJob.has("preview_url")){
			jobProperties.put(MyGengoModel.PROP_PREVIEWURL, jsonJob.getString("preview_url"));
		}
		if (jsonJob.has("body_tgt")){
			jobProperties.put(MyGengoModel.PROP_TRANSLATION, jsonJob.getString("body_tgt"));
		}

		for (MyGengoLanguagePair myGengoLanguagePair : languagePairs) {
			if (myGengoLanguagePair.getSource().getLanguageCode().equalsIgnoreCase(sourceLang) && myGengoLanguagePair.getTarget().getLanguageCode().equalsIgnoreCase(targetLang)){
				jobProperties.put(MyGengoModel.PROP_UNITTYPE, myGengoLanguagePair.getSource().getUnitType());
				break;
			}
		}
		return jobProperties;
	}
	private void saveLanguagePairs(NodeRef nodeRef, Collection<MyGengoLanguagePair> languagePairs) throws MyGengoServiceException{
		JSONStringer stringer = new JSONStringer();
		try {
			stringer.array();
			for (MyGengoLanguagePair languagePair : languagePairs) {
				stringer.value(languagePair);
			}
			stringer.endArray();
			String jsonString = stringer.toString();
			if (LOGGER.isDebugEnabled()){
				LOGGER.debug("writing JSON: " + jsonString);
			}
			if (nodeService.hasAspect(nodeRef, MyGengoModel.ASPECT_LANGUAGES)){
				nodeService.setProperty(nodeRef, MyGengoModel.PROP_LANGUAGES, jsonString);
			}else{
				Map<QName, Serializable> aspectProperties = new HashMap<QName, Serializable>();
				aspectProperties.put(MyGengoModel.PROP_LANGUAGES, jsonString);
				nodeService.addAspect(nodeRef, MyGengoModel.ASPECT_LANGUAGES, aspectProperties);
			}
			
		} catch (Throwable e) {
			LOGGER.error("saving LanguagePairs failed", e);
			throw new MyGengoServiceException("saving LanguagePairs failed",e);
		}
		
		
	}

	private Map<String, MyGengoLanguage> getLanguages(MyGengoAccount account) throws MyGengoServiceException{
		MyGengoClient client = new MyGengoClient(account.getPublicKey(), account.getPrivateKey(), useSandbox);
		Map<String, MyGengoLanguage> languages = new HashMap<String, MyGengoLanguage>();
		try {
			JSONObject response = client.getServiceLanguages(); //http://mygengo.com/api/developer-docs/methods/translate-service-languages-get/
			if (response.has("response")){
				JSONArray languagesJson = response.getJSONArray("response");
				for (int i = 0; i < languagesJson.length(); i++) {
					JSONObject languageJson = languagesJson.getJSONObject(i);
					MyGengoLanguage language = new MyGengoLanguage();
					language.setLanguage(languageJson.getString("language"));
					language.setLanguageCode(languageJson.getString("lc"));
					language.setLocalizedName(languageJson.getString("localized_name"));
					language.setUnitType(languageJson.getString("unit_type"));
					languages.put(language.getLanguageCode(), language);
				}
			}
			
		} catch (Throwable e) {
			LOGGER.error("loading Languages failed", e);
			throw new MyGengoServiceException("loading Languages failed",e);
		}
		return languages;
	}
	
	private List<ChildAssociationRef> getComments(NodeRef jobRef){
		  List<ChildAssociationRef> assocs = nodeService.getChildAssocs(jobRef, QName.createQName(NamespaceService.FORUMS_MODEL_1_0_URI, "discussion"), RegexQNamePattern.MATCH_ALL);
          if (assocs.size() != 0)
          {
              NodeRef forumFolder = assocs.get(0).getChildRef();
              List<ChildAssociationRef> topicsAssocs = nodeService.getChildAssocs(forumFolder,   ContentModel.ASSOC_CONTAINS,
                      QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, COMMENTS_TOPIC_NAME));
              
              if (topicsAssocs.size() != 0){
            	  NodeRef topic = topicsAssocs.get(0).getChildRef();
            	  Set<QName> postType = new HashSet<QName>(1, 1.0f);
            	  postType.add(ForumModel.TYPE_POST);
				return nodeService.getChildAssocs(topic, postType );
              }
          }
          return Collections.<ChildAssociationRef>emptyList();
	}
	
	public void setUseSandbox(boolean useSandbox) {
		this.useSandbox = useSandbox;
	}
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}
	public void setAccountService(MyGengoAccountService accountService) {
		this.accountService = accountService;
	}
	public void setTransactionService(TransactionService transactionService) {
		this.transactionService = transactionService;
	}
	public void setJobLockService(JobLockService jobLockService) {
		this.jobLockService = jobLockService;
	}

    protected NodeRef getOrCreateCommentsFolder(NodeRef nodeRef) {
        NodeRef commentsFolder = getCommentsFolder(nodeRef);
        if (commentsFolder == null){
            commentsFolder = createCommentsFolder(nodeRef);
        }
        return commentsFolder;
    }
    
    private NodeRef getCommentsFolder(NodeRef nodeRef) {
        NodeRef commentsFolder = null;
        
        Set<QName> types = new HashSet<QName>(1, 1.0f);
        types.add(ForumModel.TYPE_FORUM);
        List<ChildAssociationRef> childAssocs = nodeService.getChildAssocs(nodeRef, types);
        if (childAssocs.size() > 0){
            NodeRef discussionFolder = childAssocs.get(0).getChildRef();
            commentsFolder = nodeService.getChildByName(discussionFolder,ContentModel.ASSOC_CONTAINS, COMMENTS_TOPIC_NAME);
        }
        return commentsFolder;
    }
    
    private NodeRef createCommentsFolder(NodeRef nodeRef){
        NodeRef commentsFolder = null;
        nodeService.addAspect(nodeRef, QName.createQName(NamespaceService.FORUMS_MODEL_1_0_URI, "discussable"), null);
        List<ChildAssociationRef> assocs = nodeService.getChildAssocs(nodeRef, QName.createQName(NamespaceService.FORUMS_MODEL_1_0_URI, "discussion"), RegexQNamePattern.MATCH_ALL);
        if (assocs.size() != 0)
        {
            NodeRef forumFolder = assocs.get(0).getChildRef();
            
            Map<QName, Serializable> props = new HashMap<QName, Serializable>(1);
            props.put(ContentModel.PROP_NAME, COMMENTS_TOPIC_NAME);
            commentsFolder = nodeService.createNode(
                    forumFolder,
                    ContentModel.ASSOC_CONTAINS, 
                    QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, COMMENTS_TOPIC_NAME), 
                    QName.createQName(NamespaceService.FORUMS_MODEL_1_0_URI, "topic"),
                    props).getChildRef();
        }
        
        return commentsFolder;
    }
}
