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

package com.myGengo.alfresco.utils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.alfresco.model.ContentModel;
import org.alfresco.model.ForumModel;
import org.alfresco.repo.batch.BatchProcessWorkProvider;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.google.common.collect.Sets;
import com.myGengo.alfresco.account.MyGengoAccount;
import com.myGengo.alfresco.model.MyGengoModel;
import com.myGengo.alfresco.polling.MyGengoJobBatchEntry;

public class MyGengoUtils {
	private static final String COMMENTS_TOPIC_NAME = "Comments";
	private static final Log LOGGER = LogFactory.getLog(MyGengoUtils.class);

	public static void addComment(final NodeRef nodeRef, String comment, NodeService nodeService, ContentService contentService) {
		NodeRef commentsFolder = getOrCreateCommentsFolder(nodeRef, nodeService);
		String name = getUniqueChildName(commentsFolder, "comment", nodeService);
		ChildAssociationRef createdNode = nodeService.createNode(commentsFolder, ContentModel.ASSOC_CONTAINS, QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(name)), ForumModel.TYPE_POST);
		ContentWriter writer = contentService.getWriter(createdNode.getChildRef(), ContentModel.PROP_CONTENT, true);
		writer.setMimetype("text/html");
		writer.putContent(comment);
	}
	
	 private static NodeRef getOrCreateCommentsFolder(NodeRef nodeRef, NodeService nodeService) {
	        NodeRef commentsFolder = getCommentsFolder(nodeRef, nodeService);
	        if (commentsFolder == null){
	            commentsFolder = createCommentsFolder(nodeRef, nodeService);
	        }
	        return commentsFolder;
	    }
	    
	    public static NodeRef getCommentsFolder(NodeRef nodeRef, NodeService nodeService) {
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
	    
	    public static Set<NodeRef> getMyGengoJobs(NodeRef myGengoContainerRef, NodeService nodeService) {
	    	return getMyGengoJobs(myGengoContainerRef, nodeService, false);
	    }
	    public static Set<NodeRef> getMyGengoJobs(NodeRef myGengoContainerRef, NodeService nodeService, boolean includeApproved) {
			Set<QName> myGengoType = new HashSet<QName>(1, 1.0f);
			myGengoType.add(MyGengoModel.TYPE_TRANSLATIONJOB);
			List<ChildAssociationRef> childAssocs = nodeService.getChildAssocs(myGengoContainerRef, myGengoType);
			Set<NodeRef> jobRefs = new HashSet<NodeRef>(childAssocs.size(),1.0f);
			for (ChildAssociationRef childAssociationRef : childAssocs) {
				NodeRef nodeRef = childAssociationRef.getChildRef();
				if (!nodeService.hasAspect(nodeRef, MyGengoModel.ASPECT_APPROVED)){
					jobRefs.add(nodeRef);
				}else{
					LOGGER.debug("Ingnoring approved translation job: " + nodeRef.toString());
				}
			}
			return jobRefs;
		}
	    
	    public static BatchProcessWorkProvider<NodeRef> getTranslationCommentsProvider(final Iterable<NodeRef> nodeRefs)
	    {
	        return new BatchProcessWorkProvider<NodeRef>()
	        {
	            private boolean done;
	           
	            public synchronized int getTotalEstimatedWorkSize()
	            {
	                return 0;
	            }
	            public synchronized Collection<NodeRef> getNextWork()
	            {
	                if (done)
	                {
	                	// if our set was returned before then return an empty list to notify the batch processor/worker that we don't have any more nodes...
	                    return Collections.emptyList();
	                }
	                else
	                {
	                    done = true;
	                    return Sets.newHashSet(nodeRefs);
	                }
	            }
	        };
	    }
	    
	    public static BatchProcessWorkProvider<MyGengoJobBatchEntry> getTranslationsProvider(final Map<MyGengoAccount, Collection<NodeRef>> myGengoJobs) {
	    	return new  BatchProcessWorkProvider<MyGengoJobBatchEntry>()
	        {
	    		private boolean done;
	            public synchronized int getTotalEstimatedWorkSize()
	            {
	                return myGengoJobs.size();
	            }
	            public synchronized Collection<MyGengoJobBatchEntry> getNextWork()
	            {
	                if (done)
	                {
	                	// if our set was returned before then return an empty list to notify the batch processor/worker that we don't have any more nodes...
	                    return Collections.emptyList();
	                }
	                else
	                {
	                    done = true;
	                    Collection<MyGengoJobBatchEntry> entries = new ArrayList<MyGengoJobBatchEntry>(getTotalEstimatedWorkSize());
	                    Set<MyGengoAccount> accounts = myGengoJobs.keySet();
	                    for (MyGengoAccount myGengoAccount : accounts) {
							MyGengoJobBatchEntry entry = new MyGengoJobBatchEntry(myGengoAccount, myGengoJobs.get(myGengoAccount));
	                    	entries.add(entry);
						}
	                    return entries;
	                }
	            }
	        };
		}

	    
	    private static NodeRef createCommentsFolder(NodeRef nodeRef, NodeService nodeService){
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
	    
	    private static String getUniqueChildName(NodeRef parentRef, String prefix, NodeService nodeService){       
	        String name = prefix + "-" + System.currentTimeMillis();

	        // check that no child for the given name exists
	        String finalName = name + "_" + Math.floor(Math.random() * 1000);
	        int count = 0;
	        while (nodeService.getChildByName(parentRef, ContentModel.ASSOC_CONTAINS, finalName) != null || count > 100)
	        {
	           finalName = name + "_" + Math.floor(Math.random() * 1000);
	           ++count;
	        }
	        return finalName;
	    }

		
	    
}