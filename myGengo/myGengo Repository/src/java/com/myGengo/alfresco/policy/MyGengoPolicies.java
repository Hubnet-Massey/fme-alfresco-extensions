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

package com.myGengo.alfresco.policy;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.repo.node.NodeServicePolicies.OnAddAspectPolicy;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoAccountService;
import com.myGengo.alfresco.model.MyGengoModel;
import com.myGengo.alfresco.translate.MyGengoTranslationService;
import com.myGengo.alfresco.utils.MyGengoUtils;

/**
 * 
 * OnAddAspectPolicy executed  if one of the following aspects is added to a translation job:
 * 
 * {@link MyGengoModel#ASPECT_APPROVED}
 * {@link MyGengoModel#ASPECT_REJECTED}
 * {@link MyGengoModel#ASPECT_REVISED}
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoPolicies implements OnAddAspectPolicy{
	
	private static final Log LOGGER = LogFactory.getLog(MyGengoPolicies.class);

	private PolicyComponent policyComponent;
	private NodeService nodeService;
	private ContentService contentService;
	private MyGengoTranslationService translationService;
	private MyGengoAccountService accountService;
	
	private Behaviour onAddAspectBehavior;
	
	public void init() {
		 this.onAddAspectBehavior = new JavaBehaviour(this, OnAddAspectPolicy.QNAME.getLocalName(),
	                NotificationFrequency.TRANSACTION_COMMIT);
		 policyComponent.bindClassBehaviour(OnAddAspectPolicy.QNAME, MyGengoModel.ASPECT_APPROVED, this.onAddAspectBehavior);
		 policyComponent.bindClassBehaviour(OnAddAspectPolicy.QNAME, MyGengoModel.ASPECT_REVISED, this.onAddAspectBehavior);
		 policyComponent.bindClassBehaviour(OnAddAspectPolicy.QNAME, MyGengoModel.ASPECT_REJECTED, this.onAddAspectBehavior);
	}

	/**
	 * if myGengo:approved is added: remove myGengo:revised &amp; myGengo:rejected aspect and execute {@link MyGengoTranslationService#approveTranslation(NodeRef, String, String, int, boolean, MyGengoAccount)}
	 * if myGengo:revised is added: remove my myGengo:rejected aspect and execute {@link MyGengoTranslationService#reviseTranslation(NodeRef, String, MyGengoAccount)}
	 * if myGengo:rejected is added: remove my myGengo:revised aspect and execute {@link MyGengoTranslationService#rejectTranslation(NodeRef, String, String, String, boolean, MyGengoAccount)}
	 */
	@Override
	public void onAddAspect(NodeRef nodeRef, QName aspectTypeQName) {
		try {
			if (nodeRef.getStoreRef().equals(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE)){
				MyGengoAccount accountInfo = this.accountService.getAccountInfo(nodeService.getPrimaryParent(nodeRef).getParentRef());
				if (aspectTypeQName.equals(MyGengoModel.ASPECT_APPROVED)){
					//remove revised or reject aspect if given
					nodeService.removeAspect(nodeRef, MyGengoModel.ASPECT_REJECTED);
					nodeService.removeAspect(nodeRef, MyGengoModel.ASPECT_REVISED);
					String feedbackMyGengo = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_MYGENGOFEEDBACK);
					String feedbackTranslator = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_TRANSLATORFEEDBACK);
					Integer rating = (Integer) nodeService.getProperty(nodeRef, MyGengoModel.PROP_RATING);
					Boolean feedbackIsPublic = (Boolean) nodeService.getProperty(nodeRef, MyGengoModel.PROP_FEEDBACKPUBLIC);
					this.translationService.approveTranslation(nodeRef, feedbackTranslator, feedbackMyGengo, rating, feedbackIsPublic, accountInfo);
				}
				else if (aspectTypeQName.equals(MyGengoModel.ASPECT_REVISED)){
					nodeService.removeAspect(nodeRef, MyGengoModel.ASPECT_REJECTED);
					String revisionComment = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_REVISECOMMENT);
					MyGengoUtils.addComment(nodeRef, revisionComment, nodeService, contentService);
					this.translationService.reviseTranslation(nodeRef, revisionComment, accountInfo);
				}
				else if (aspectTypeQName.equals(MyGengoModel.ASPECT_REJECTED)){
					nodeService.removeAspect(nodeRef, MyGengoModel.ASPECT_REVISED);
					String rejectComment = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_REJECTCOMMENT);
					String rejectReason = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_REJECTREASON);
					String captcha = (String) nodeService.getProperty(nodeRef, MyGengoModel.PROP_REJECTCAPTCHA);
					boolean requeue = (Boolean) nodeService.getProperty(nodeRef, MyGengoModel.PROP_REJECTREQUEUE);
					MyGengoUtils.addComment(nodeRef, rejectComment, nodeService, contentService);
					this.translationService.rejectTranslation(nodeRef, rejectComment, rejectReason, captcha, requeue, accountInfo);
				}
			}
		} catch (Exception e) {
			LOGGER.error("adding approved aspect failed", e);
			throw new AlfrescoRuntimeException("adding approved aspect failed", e);
		} 
	}

	public void setAccountService(MyGengoAccountService accountService) {
		this.accountService = accountService;
	}
	public void setTranslationService(
			MyGengoTranslationService translationService) {
		this.translationService = translationService;
	}
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}
	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}
}
