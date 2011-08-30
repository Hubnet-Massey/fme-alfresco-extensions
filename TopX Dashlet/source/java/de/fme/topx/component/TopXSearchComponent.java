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

package de.fme.topx.component;

import java.io.IOException;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.policy.BehaviourFilter;
import org.alfresco.repo.transaction.RetryingTransactionHelper.RetryingTransactionCallback;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.MimetypeService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.LimitBy;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchParameters;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.google.common.base.Preconditions;

import de.fme.topx.constants.DataModel;
import de.fme.topx.model.Node;

/**
 * search component for the topx dashlet. Search is made via Lucene query to
 * search for all elements which have a hitCounter field.
 * 
 * @author jgoldhammer
 * 
 */
public class TopXSearchComponent {

	private final static Log LOG = LogFactory.getLog(TopXSearchComponent.class);

	// supporting repository services
	private NodeService nodeService;
	private SearchService searchService;
	private NamespaceService namespaceService;
	private TransactionService transactionService;
	private PermissionService permissionService;
	private PersonService personService;
	private ContentService contentService;
	private MimetypeService mimetypeService;

	private BehaviourFilter behaviourFilter;

	public void setBehaviourFilter(BehaviourFilter behaviourFilter) {
		this.behaviourFilter = behaviourFilter;
	}

	public void setMimetypeService(MimetypeService mimetypeService) {
		this.mimetypeService = mimetypeService;
	}

	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}

	public void setPersonService(PersonService personService) {
		this.personService = personService;
	}

	private SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	private Map<String, String> displayNamesByMimetype;

	public PermissionService getPermissionService() {
		return permissionService;
	}

	public TransactionService getTransactionService() {
		return transactionService;
	}

	public void setPermissionService(PermissionService permissionService) {
		this.permissionService = permissionService;
	}

	public void setTransactionService(TransactionService transactionService) {
		this.transactionService = transactionService;
	}

	/**
	 * @param nodeService
	 *            node service
	 */
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	private NodeService getNodeService() {
		return nodeService;
	}

	/**
	 * @param searchService
	 *            search service
	 */
	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

	private SearchService getSearchService() {
		return searchService;
	}

	/**
	 * @param namespaceService
	 *            namespace service
	 */
	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}

	private NamespaceService getNamespaceService() {
		return namespaceService;
	}

	public void init() {
		displayNamesByMimetype = mimetypeService.getDisplaysByMimetype();

	}

	/**
	 * Gets the current node primary parent reference
	 * 
	 * @return primary parent ref
	 */
	public String getPrimaryParent(NodeRef nodeRef) {
		Path primaryPath = getNodeService().getPath(nodeRef);
		Path.Element element = primaryPath.last();
		NodeRef parentRef = ((Path.ChildAssocElement) element).getRef().getParentRef();
		return parentRef.toString();
	}

	/**
	 * executes a lucene search via public service Searchservice. After
	 * finishing searches, the needed info are generated via nodeservice and
	 * contentservice and afterwards the nodes are sorted.
	 * 
	 * @param queryType
	 *            the type of the query- currently unused- for further
	 *            extensions like getting the most downloaded documents and the
	 *            most active documents
	 * @param maxItems
	 *            maxItems to fetch from lucene index
	 * @param parentId
	 *            the id of the folder which is used to restrict the search for
	 *            top documents.
	 * @return a list of Nodes which can be transformed to json.
	 * @throws IOException
	 */
	public List<Node> submitSearch(final String queryType, final String maxItems, final String parentId)
			throws IOException {

		Preconditions.checkNotNull(queryType);
		Preconditions.checkNotNull(maxItems);

		RetryingTransactionCallback<List<Node>> searchCallback = new RetryingTransactionCallback<List<Node>>() {
			public List<Node> execute() throws Throwable {
				SearchParameters searchParameters = createSearchParameters(queryType, maxItems, parentId);
				LOG.info("Searching with following parameters:" + searchParameters);
				ResultSet resultSet = null;
				List<Node> searchResults;
				try {

					resultSet = getSearchService().query(searchParameters);
					List<NodeRef> nodeRefs = resultSet.getNodeRefs();
					LOG.info("Search has found " + nodeRefs.size() + " nodes...");
					searchResults = new ArrayList<Node>(nodeRefs.size());
					for (NodeRef nodeRef : nodeRefs) {
						searchResults.add(createNode(nodeRef));
					}
				} finally {
					if (resultSet != null) {
						resultSet.close();
					}
				}
				LOG.info("Generated the node infos needed for the dashlet...");
				if (LOG.isDebugEnabled()) {
					LOG.debug("Search results:\n"+searchResults);
				}
				return searchResults;
			}

			/**
			 * creates the search config object
			 * 
			 * @param queryType
			 *            unused at the moment- extension for the future
			 * @param maxItems
			 *            the maximum number of items to fetch via search
			 * @param parentId
			 *            unused at the moment- extension for the future
			 * @return a search config object
			 */
			private SearchParameters createSearchParameters(final String queryType, final String maxItems,
					final String parentId) {
				SearchParameters searchParameters = new SearchParameters();

				searchParameters.addStore(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
				searchParameters.setLanguage(SearchService.LANGUAGE_LUCENE);
				searchParameters.setQuery(getQuery(queryType, parentId));
				searchParameters.setLimitBy(LimitBy.FINAL_SIZE);
				searchParameters.setLimit(Integer.valueOf(maxItems));
				searchParameters.addSort("@topx:hitcount", false);
				return searchParameters;
			}

			/**
			 * generates the query to search for. Currently only nodes with
			 * hitcounter value bigger than 3 are searched and returned.
			 * 
			 * @param queryType
			 * @param parentId
			 * @return the lucene query to search for.
			 */
			private String getQuery(String queryType, String parentId) {
				StringBuilder query = new StringBuilder();
				if (StringUtils.isNotBlank(parentId)) {
					String parentPath = getNodeService().getPath(new NodeRef(parentId)).toPrefixString(
							getNamespaceService());
					// parentPath = ISO9075.encode(parentPath);
					query.append("PATH:\"" + parentPath + "//*\" AND ");
				}
				// return only documents which have at least a hitcounter of 3.
				query.append("@topx\\:hitcount:[3 TO MAX]");
				return query.toString();
			}
		};

		try {
			return getTransactionService().getRetryingTransactionHelper().doInTransaction(searchCallback, true);
		} catch (Throwable e) {
			throw new IOException("Search failed", e);
		}
	}

	/**
	 * creates a node wrapper with the given nodeRef.
	 * 
	 * @param nodeRef
	 * @return a node object
	 */
	private Node createNode(NodeRef nodeRef) {
		Node newNode = new Node(nodeRef);
		newNode.setNodeRefId(nodeRef.getId());
		setNameAndTitle(nodeRef, newNode);
		setAuditDates(nodeRef, newNode);
		setModifier(nodeRef, newNode);
		setCreator(nodeRef, newNode);
		setHitcount(nodeRef, newNode);
		setPathAttributes(nodeRef, newNode);
		setContentAttributes(nodeRef, newNode);
		return newNode;
	}

	/**
	 * reads the mimetype and content size.
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setContentAttributes(NodeRef nodeRef, Node newNode) {
		// avoid triggering counting
		behaviourFilter.disableBehaviour(DataModel.TOPX_ASPECTNAME);

		ContentReader reader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);

		newNode.setContentSizeFormatted(FileUtils.byteCountToDisplaySize(reader.getSize()));
		String contentMimetype = reader.getMimetype();
		String displayMimetype = displayNamesByMimetype.get(contentMimetype);
		if (StringUtils.isNotBlank(displayMimetype)) {
			contentMimetype = displayMimetype;
		}

		newNode.setContentMimetype(contentMimetype);

		behaviourFilter.enableBehaviour(DataModel.TOPX_ASPECTNAME);
	}

	/**
	 * reads the display path, the sitename and sitepath for correct linking in
	 * ui
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setPathAttributes(NodeRef nodeRef, Node newNode) {
		Path path = getNodeService().getPath(nodeRef);
		String displayPath = path.toDisplayPath(nodeService, permissionService);
		newNode.setDisplayPath(displayPath);
		String pathCutted = StringUtils.substringAfter(StringUtils.substringAfter(displayPath, "/"), "/");
		if (pathCutted.startsWith("Sites/")) {
			String siteName = StringUtils.substringBetween(displayPath, "Sites/", "/");
			newNode.setSiteName(siteName);
			String documentPath = StringUtils.substringAfter(displayPath, "Sites/" + siteName + "/documentLibrary/");
			String sitePath = StringUtils.substringBeforeLast(documentPath, "/");
			newNode.setSitePath(sitePath);
		}

		String parentNodeRef = getPrimaryParent(nodeRef);
		newNode.setParentNodeRef(parentNodeRef);
	}

	/**
	 * reads the hitcounter.
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setHitcount(NodeRef nodeRef, Node newNode) {
		Integer hitCount = (Integer) getNodeService().getProperty(nodeRef,
				QName.resolveToQName(namespaceService, "topx:hitcount"));
		newNode.setHitCount(hitCount);
	}

	/**
	 * reads the creator uid and the formatted creator name (first and lastname)
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setCreator(NodeRef nodeRef, Node newNode) {
		String creator = (String) getNodeService().getProperty(nodeRef, ContentModel.PROP_CREATOR);
		newNode.setCreator(creator);

		NodeRef person = personService.getPerson(creator, false);
		Map<QName, Serializable> properties = nodeService.getProperties(person);
		newNode.setCreatorFormatted((String) properties.get(ContentModel.PROP_FIRSTNAME)
				+ (String) properties.get(ContentModel.PROP_LASTNAME));
	}

	/**
	 * reads the modify and creation date and formats it.
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setAuditDates(NodeRef nodeRef, Node newNode) {
		newNode.setModifyDate(formatter
				.format((Date) getNodeService().getProperty(nodeRef, ContentModel.PROP_MODIFIED)));
		newNode.setCreationDate(formatter.format((Date) getNodeService()
				.getProperty(nodeRef, ContentModel.PROP_CREATED)));
	}

	/**
	 * reads the document name and title and generates an abbreviated version of
	 * both.
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setNameAndTitle(NodeRef nodeRef, Node newNode) {
		newNode.setName((String) getNodeService().getProperty(nodeRef, ContentModel.PROP_NAME));
		newNode.setAbbreviatedName(StringUtils.abbreviate(
				(String) getNodeService().getProperty(nodeRef, ContentModel.PROP_NAME), 28));

		newNode.setTitle((String) getNodeService().getProperty(nodeRef, ContentModel.PROP_TITLE));

		newNode.setAbbreviatedTitle(StringUtils.abbreviate(
				(String) getNodeService().getProperty(nodeRef, ContentModel.PROP_TITLE), 28));
	}

	/**
	 * reads the modifier uid and the formatted creator name (first and
	 * lastname)
	 * 
	 * @param nodeRef
	 * @param newNode
	 */
	private void setModifier(NodeRef nodeRef, Node newNode) {
		String modifier = (String) getNodeService().getProperty(nodeRef, ContentModel.PROP_MODIFIER);
		newNode.setModifier(modifier);

		NodeRef person = personService.getPerson(modifier, false);
		Map<QName, Serializable> properties = nodeService.getProperties(person);
		newNode.setModifierFormatted((String) properties.get(ContentModel.PROP_FIRSTNAME)
				+ (String) properties.get(ContentModel.PROP_LASTNAME));
	}
}