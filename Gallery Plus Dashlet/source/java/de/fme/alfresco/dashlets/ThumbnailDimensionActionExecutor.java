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
package de.fme.alfresco.dashlets;

import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.ParameterDefinitionImpl;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.repo.thumbnail.CreateThumbnailActionExecuter;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.action.ParameterDefinition;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.thumbnail.ThumbnailService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Implements an action that creates thumbnail and reads the metadata of that
 * thumbnail with a meta data extractor afterwards. It is used by the Gallery
 * Plus dashlet to have the exact dimensions of the thumbnail.
 * 
 * @author Florian Maul (fme AG)
 */
public class ThumbnailDimensionActionExecutor extends
		ActionExecuterAbstractBase {

	private static Log logger = LogFactory
			.getLog(ThumbnailDimensionActionExecutor.class);

	public static String NAME = "galleryPlusThumbnailDimensionAction";

	/**
	 * Action parameter, the name of the thumbnail.
	 */
	public static String PARAM_THUMBNAIL_NAME = "thumbnailName";

	private ThumbnailService thumbnailService;

	private ActionService actionService;

	public void setThumbnailService(ThumbnailService thumbnailService) {
		this.thumbnailService = thumbnailService;
	}

	public void setActionService(ActionService actionService) {
		this.actionService = actionService;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.alfresco.repo.action.ParameterizedItemAbstractBase#
	 * addParameterDefinitions(java.util.List)
	 */
	@Override
	protected void addParameterDefinitions(List<ParameterDefinition> paramList) {
		paramList.add(new ParameterDefinitionImpl(PARAM_THUMBNAIL_NAME,
				DataTypeDefinition.TEXT, false,
				getParamDisplayLabel(PARAM_THUMBNAIL_NAME)));
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.alfresco.repo.action.executer.ActionExecuterAbstractBase#executeImpl
	 * (org.alfresco.service.cmr.action.Action,
	 * org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	protected void executeImpl(Action action, NodeRef nodeRef) {
		if (logger.isDebugEnabled()) {
			logger.debug("Executing ThumbnailDimensionAction for node "
					+ nodeRef);
		}

		String thumbnailName = getParameterValue(action, PARAM_THUMBNAIL_NAME,
				"galpThumb120");

		NodeRef thumb = generateThumbnail(nodeRef, thumbnailName);

		if (thumb != null) {
			if (logger.isDebugEnabled()) {
				logger.debug("Thumbnail found. Running metadata extraction for thumbnail.");
			}

			extractThumbnailDimensions(thumb);
		} else {
			logger.warn("Thumbnail not found for node " + nodeRef);
		}
	}

	/**
	 * Retrieves a String parameter from the Action by it's name.
	 * 
	 * @param action
	 *            The actions whose parameters are queried.
	 * @param parameterName
	 *            The name of the parameter to get.
	 * @param defaultValue
	 *            A default value that is returned if the parameter is not set.
	 * @return The value of the parameter as {@link String}.
	 */
	private String getParameterValue(Action action, String parameterName,
			String defaultValue) {
		String value = (String) action.getParameterValue(parameterName);
		if (value == null || value.length() == 0) {
			value = defaultValue;
		}
		return value;
	}

	/**
	 * Calls the meta data extractor action to extract the meta data for a
	 * thumbnail node.
	 * 
	 * @param thumb
	 *            The node of a thumbnail.
	 */
	private void extractThumbnailDimensions(NodeRef thumb) {
		Action extractAction = actionService.createAction("extract-metadata");
		actionService.executeAction(extractAction, thumb, false, false);
	}

	/**
	 * Generates a thumbnail for a given node.
	 * 
	 * @param nodeRef
	 *            The nodeRef pointing to a node in the repository.
	 * @param thumbnailName
	 *            The name of the thumbnail or rendition definition.
	 * @return The newly generated thumbnail node.
	 */
	private NodeRef generateThumbnail(NodeRef nodeRef, String thumbnailName) {
		if (logger.isDebugEnabled()) {
			logger.debug("creating thumbnail for node " + nodeRef);
		}

		Action thumbAction = actionService
				.createAction(CreateThumbnailActionExecuter.NAME);
		thumbAction.setParameterValue(
				CreateThumbnailActionExecuter.PARAM_THUMBANIL_NAME,
				thumbnailName);
		actionService.executeAction(thumbAction, nodeRef, false, false);

		NodeRef thumb = thumbnailService.getThumbnailByName(nodeRef,
				ContentModel.PROP_CONTENT, thumbnailName);
		return thumb;
	}
}
