/*
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
package de.fme.alfresco.dashlets;

import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.NodeServicePolicies;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.thumbnail.ThumbnailService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Implements a behavior for the Album-aspect defined in the Gallery Plus data
 * model. It is used to automatically generate thumbnails for all images in a
 * folder that has the album aspect associated with it.
 * 
 * @author Florian Maul (fme AG).
 */
public class AlbumAspect implements NodeServicePolicies.OnCreateNodePolicy,
		NodeServicePolicies.OnAddAspectPolicy {

	private static Log logger = LogFactory.getLog(AlbumAspect.class);

	private NodeService nodeService;

	private ThumbnailService thumbnailService;

	private PolicyComponent policyComponent;

	private ActionService actionService;

	private List<String> thumbnailNames;

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setThumbnailService(ThumbnailService thumbnailService) {
		this.thumbnailService = thumbnailService;
	}

	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}

	public void setActionService(ActionService actionService) {
		this.actionService = actionService;
	}

	public void setThumbnailNames(List<String> thumbnailNames) {
		this.thumbnailNames = thumbnailNames;
	}

	public void init() {

		logger.debug("Adding ClassBehaviour OnAddAspectPolicy for aspect galp:album");
		policyComponent.bindClassBehaviour(
				NodeServicePolicies.OnAddAspectPolicy.QNAME,
				GalleryPlusModel.ASPECT_ALBUM, new JavaBehaviour(this,
						"onAddAspect"));

		logger.debug("Adding ClassBehaviour OnCreateNode for aspect galp:album");
		policyComponent.bindClassBehaviour(
				NodeServicePolicies.OnCreateNodePolicy.QNAME,
				ContentModel.TYPE_CONTENT, new JavaBehaviour(this,
						"onCreateNode"));
	}

	@Override
	public void onAddAspect(NodeRef nodeRef, QName aspectTypeQName) {
		if (logger.isDebugEnabled()) {
			logger.debug("onAddAspect called for node " + nodeRef);
		}

		List<ChildAssociationRef> children = nodeService
				.getChildAssocs(nodeRef);
		for (ChildAssociationRef childAssociationRef : children) {
			NodeRef child = childAssociationRef.getChildRef();

			for (String thumbnailName : thumbnailNames) {
				final NodeRef thumb = thumbnailService.getThumbnailByName(
						child, ContentModel.PROP_CONTENT, thumbnailName);

				if (thumb == null) {
					createThumbnail(child, thumbnailName);
				}
			}
		}
	}

	private void createThumbnail(NodeRef nodeRef, String thumbnailName) {
		if (logger.isDebugEnabled()) {
			logger.debug("Running action to create thumbnail for node "
					+ nodeRef);
		}
		Action dimensionAction = actionService
				.createAction(ThumbnailDimensionActionExecutor.NAME);
		dimensionAction.setParameterValue(
				ThumbnailDimensionActionExecutor.PARAM_THUMBNAIL_NAME,
				thumbnailName);
		actionService.executeAction(dimensionAction, nodeRef, false, true);
	}

	@Override
	public void onCreateNode(ChildAssociationRef childAssocRef) {
		NodeRef parentNode = childAssocRef.getParentRef();
		if (nodeService.hasAspect(parentNode, GalleryPlusModel.ASPECT_ALBUM)) {
			for (String thumbnailName : thumbnailNames) {
				createThumbnail(childAssocRef.getChildRef(), thumbnailName);
			}
		}
	}

}
