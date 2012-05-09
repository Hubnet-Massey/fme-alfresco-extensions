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

package com.myGengo.alfresco.form;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ForumModel;
import org.alfresco.repo.forms.FieldDefinition;
import org.alfresco.repo.forms.Form;
import org.alfresco.repo.forms.FormData;
import org.alfresco.repo.forms.FormData.FieldData;
import org.alfresco.repo.forms.PropertyFieldDefinition;
import org.alfresco.repo.forms.processor.AbstractFilter;
import org.alfresco.repo.forms.processor.Filter;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.InvalidNodeRefException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.namespace.NamespacePrefixResolver;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.account.MyGengoAccountService;
import com.myGengo.alfresco.account.MyGengoServiceException;
import com.myGengo.alfresco.model.MyGengoModel;
import com.myGengo.alfresco.translate.MyGengoLanguage;
import com.myGengo.alfresco.translate.MyGengoTranslationService;
import com.myGengo.alfresco.utils.MyGengoUtils;

/**
 * FormFilter for myGengo translation jobs {@link MyGengoModel#TYPE_TRANSLATIONJOB}
 * 
 * @author Jan Pfitzner (fme AG)
 *
 * @param <ItemType>
 * @param <PersistType>
 */
public class MyGengoFormFilter<ItemType, PersistType> extends AbstractFilter<ItemType, PersistType> implements
        Filter<ItemType, PersistType> {

    private static final String PROP_MY_GENGO_JOB_CREDITS = "prop_myGengo_jobCredits";
	private static final String PROP_MY_GENGO_TRANSLATION_PREVIEW = "prop_myGengo_translationPreview";
	private static final String PROP_MY_GENGO_TRANSLATION = "prop_myGengo_translation";
	private static final String PROP_MY_GENGO_TARGET_LANGUAGE = "prop_myGengo_targetLanguage";
	private static final String PROP_MY_GENGO_SOURCE_LANGUAGE = "prop_myGengo_sourceLanguage";
	private static final String PROP_MY_GENGO_REJECT_REQUEUE = "prop_myGengo_rejectRequeue";
	private static final String PROP_MY_GENGO_REJECT_REASON = "prop_myGengo_rejectReason";
	private static final String PROP_MY_GENGO_RATING = "prop_myGengo_rating";
	private static final Log LOGGER = LogFactory.getLog(MyGengoFormFilter.class);
    
    private NodeService nodeService;
    private ContentService contentService;
    private MyGengoTranslationService translationService;
    private MyGengoAccountService accountService;
	private NamespacePrefixResolver namespaceService;

    @Override
    public void afterGenerate(ItemType item, List<String> fields, List<String> forcedFields, Form form,
            Map<String, Object> context) {
        if (item instanceof NodeRef)
        {
            final NodeRef nodeRef = (NodeRef) item;
            if (nodeService.exists(nodeRef) && nodeService.getType(nodeRef).equals(MyGengoModel.TYPE_TRANSLATIONJOB)){
	            final NodeRef parentRef = this.nodeService.getPrimaryParent(nodeRef).getParentRef();
	            try {
	            	Map<String, MyGengoLanguage> languages = this.translationService.getLanguages(parentRef);
	            	replaceLanguageValue(form, languages, PROP_MY_GENGO_SOURCE_LANGUAGE);
	            	replaceLanguageValue(form, languages, PROP_MY_GENGO_TARGET_LANGUAGE);
	            	boolean translationPresent = false;
	            	if (form.dataExists(PROP_MY_GENGO_TRANSLATION)){
	            		translationPresent = StringUtils.isNotBlank((String)form.getFormData().getFieldData(PROP_MY_GENGO_TRANSLATION).getValue());
	            	}
	            	if (form.dataExists(PROP_MY_GENGO_TRANSLATION_PREVIEW)){
	            		if (translationPresent 
	            				&&!"reviewable".equalsIgnoreCase((String)nodeService.getProperty(nodeRef, MyGengoModel.PROP_STATUS))
	            				&& !"revising".equalsIgnoreCase((String)nodeService.getProperty(nodeRef, MyGengoModel.PROP_STATUS))
	            				&& !"held".equalsIgnoreCase((String)nodeService.getProperty(nodeRef, MyGengoModel.PROP_STATUS))){
	            			List<FieldDefinition> oldDefinitions = form.getFieldDefinitions();
	            			List<FieldDefinition> newDefinitions = new ArrayList<FieldDefinition>(oldDefinitions.size() - 1);
	            			for (FieldDefinition fieldDefinition : oldDefinitions) {
								if (!fieldDefinition.getDataKeyName().equalsIgnoreCase(PROP_MY_GENGO_TRANSLATION_PREVIEW)){
									newDefinitions.add(fieldDefinition);
								}
							}
	            			form.setFieldDefinitions(newDefinitions);
	            		}else{
	            			StringBuffer urlBuffer = new StringBuffer(nodeRef.toString().replace(":/", ""));
	            			urlBuffer.append("/content;").append(MyGengoModel.PROP_TRANSLATIONPREVIEW.toPrefixString(namespaceService));
	            			form.getFormData().addFieldData(PROP_MY_GENGO_TRANSLATION_PREVIEW, urlBuffer.toString(), true);
	            		}
	            	}
	            	if (form.dataExists(PROP_MY_GENGO_JOB_CREDITS)){
	            		StringBuffer credits = new StringBuffer((String)form.getFormData().getFieldData(PROP_MY_GENGO_JOB_CREDITS).getValue());
	            		credits.append(" (").append(nodeService.getProperty(nodeRef, MyGengoModel.PROP_UNITCOUNT)).append(" ")
	            			.append(nodeService.getProperty(nodeRef, MyGengoModel.PROP_UNITTYPE)).append("s)");
	            		form.getFormData().addFieldData(PROP_MY_GENGO_JOB_CREDITS, credits.toString(), true);
	            	}
	            	if (form.dataExists(PROP_MY_GENGO_REJECT_REQUEUE)){
	            		//set true if requeue is false and vice versa
	            		form.getFormData().addFieldData(PROP_MY_GENGO_REJECT_REQUEUE, !(Boolean)form.getFormData().getFieldData(PROP_MY_GENGO_REJECT_REQUEUE).getValue(), true);
	            	}
	            	if (forcedFields != null && forcedFields.contains(MyGengoModel.PROP_RATING.toPrefixString(namespaceService))&& nodeService.getProperty(nodeRef, MyGengoModel.PROP_RATING) == null){
	            		List<FieldDefinition> fieldDefinitions = form.getFieldDefinitions();
	            		for (FieldDefinition fieldDefinition : fieldDefinitions) {
							if (fieldDefinition.getDataKeyName().equalsIgnoreCase(PROP_MY_GENGO_RATING)){
								form.getFormData().addFieldData(PROP_MY_GENGO_RATING,fieldDefinition.getDefaultValue(), true);
							}
						}
	            	}
	            	if (forcedFields != null && forcedFields.contains(MyGengoModel.PROP_REJECTREASON.toPrefixString(namespaceService))&& nodeService.getProperty(nodeRef, MyGengoModel.PROP_REJECTREASON) == null){
	            		List<FieldDefinition> fieldDefinitions = form.getFieldDefinitions();
	            		for (FieldDefinition fieldDefinition : fieldDefinitions) {
	            			if (fieldDefinition.getDataKeyName().equalsIgnoreCase(PROP_MY_GENGO_REJECT_REASON)){
	            				form.getFormData().addFieldData(PROP_MY_GENGO_REJECT_REASON,fieldDefinition.getDefaultValue(), true);
	            			}
	            		}
	            	}
	            	if (forcedFields != null && forcedFields.contains(MyGengoModel.PROP_REJECTREQUEUE.toPrefixString(namespaceService))&& nodeService.getProperty(nodeRef, MyGengoModel.PROP_REJECTREQUEUE) == null){
	            		List<FieldDefinition> fieldDefinitions = form.getFieldDefinitions();
	            		for (FieldDefinition fieldDefinition : fieldDefinitions) {
	            			if (fieldDefinition.getDataKeyName().equalsIgnoreCase(PROP_MY_GENGO_REJECT_REQUEUE)){
	            				form.getFormData().addFieldData(PROP_MY_GENGO_REJECT_REQUEUE,fieldDefinition.getDefaultValue(), true);
	            			}
	            		}
	            	}
	            	
	            } catch (MyGengoServiceException e) {
					LOGGER.error("failed to resolve language");
				}
            }
        }
    }

	private void replaceLanguageValue(Form form,
			Map<String, MyGengoLanguage> languages,String fieldName) {
		if (form.dataExists(fieldName)){
			FieldData fieldData = form.getFormData().getFieldData(fieldName);
			String langCode = (String) fieldData.getValue();
			if (languages.containsKey(langCode)){
				form.getFormData().addFieldData(fieldName, languages.get(langCode).getLanguage(), true);
			}
		}
	}

    @Override
    public void afterPersist(ItemType item, FormData data, PersistType persistedObject) {
        LOGGER.debug("afterPersist");
        final NodeRef nodeRef;
        if (persistedObject instanceof NodeRef) {
            nodeRef = (NodeRef) persistedObject;
            
        }else{
            return;
        }
        if (nodeService.exists(nodeRef) && nodeService.getType(nodeRef).equals(MyGengoModel.TYPE_TRANSLATIONJOB)){
	        Set<String> fieldNames = data.getFieldNames();
	        for (String fieldName : fieldNames) {
	            if (fieldName.equalsIgnoreCase("fm_discussable")){
	                FieldData newCommentData = data.getFieldData(fieldName);
	                String comment = newCommentData.getValue().toString();
	                if (StringUtils.isNotEmpty( comment)){
		                if (LOGGER.isDebugEnabled()){
		                    LOGGER.debug("fm:discussable field found with value: "+ comment);
		                }
		                MyGengoUtils.addComment(nodeRef, comment,nodeService, contentService);
		                try {
							MyGengoAccount accountInfo = this.accountService.getAccountInfo(nodeService.getPrimaryParent(nodeRef).getParentRef());
							this.translationService.addJobComment(nodeRef, comment, accountInfo);
						} catch (InvalidNodeRefException e) {
							LOGGER.error("posting comment to mygengo failed", e);
							throw new AlfrescoRuntimeException("posting comment to mygengo failed", e);
						} catch (MyGengoServiceException e) {
							LOGGER.error("posting comment to mygengo failed", e);
							throw new AlfrescoRuntimeException("posting comment to mygengo failed", e);
						}
		                ;
	                }
	            }
	        }
        }
    }

	

    @Override
    public void beforeGenerate(ItemType item, List<String> fields, List<String> forcedFields, Form form,
            Map<String, Object> context) {
        if (item instanceof NodeRef){
            NodeRef nodeRef = (NodeRef) item;
            if (nodeService.getType(nodeRef)== MyGengoModel.TYPE_TRANSLATIONJOB && nodeRef.getStoreRef().equals(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE)){
                final FieldDefinition discussableFieldDef = new PropertyFieldDefinition("fm_discussable", "discussion");
                discussableFieldDef.setDataKeyName("prop_fm_discussable");
                discussableFieldDef.setProtectedField(true);
                discussableFieldDef.setLabel("Comments");
                LOGGER.debug("... generating field definition " + discussableFieldDef);
                form.addFieldDefinition(discussableFieldDef);
                NodeRef commentsFolder = MyGengoUtils.getCommentsFolder(nodeRef, nodeService);
                int commentCount = 0;
                if (commentsFolder != null){
                    Set<QName> types = new HashSet<QName>(1, 1.0f);
                    types.add(ForumModel.TYPE_POST);
                    commentCount = nodeService.getChildAssocs(commentsFolder, types).size();
                }
                form.addData("prop_fm_discussable", commentCount);
                
            }

        }
    }

    @Override
    public void beforePersist(ItemType item, FormData data) {
        // nothing to do
    }

    /**
     * @param nodeService the nodeService to set
     */
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    
    /**
     * @param contentService the contentService to set
     */
    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }
    
    public void setTranslationService(
			MyGengoTranslationService translationService) {
		this.translationService = translationService;
	}
    
    public void setAccountService(MyGengoAccountService accountService) {
		this.accountService = accountService;
	}
    
    public void setNamespaceService(NamespacePrefixResolver namespaceService) {
		this.namespaceService = namespaceService;
	}

    
}
