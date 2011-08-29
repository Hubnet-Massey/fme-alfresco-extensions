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

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.NotSupportedException;
import javax.transaction.RollbackException;
import javax.transaction.SystemException;
import javax.transaction.UserTransaction;

import org.alfresco.repo.policy.BehaviourFilter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.apache.commons.lang.time.DateUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * update component which updates the topx countable aspect for a node.
 * 
 * @author jgoldhammer
 * 
 */
public class TopXUpdateComponent {

	private final static Log LOG = LogFactory.getLog(TopXUpdateComponent.class);

	private NodeService nodeService;
	private BehaviourFilter filter;
	private TransactionService transactionService;

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setFilter(BehaviourFilter filter) {
		this.filter = filter;
	}

	public void setTransactionService(TransactionService transactionService) {
		this.transactionService = transactionService;
	}

	/**
	 * increase the hitcount for the given noderef by using the aspect
	 * <code>topx:countable</code>. Does not fire events for other behaviours.
	 * Using admin use to increment because not everybody has
	 * 
	 * @param nodeRef
	 * @param userName
	 *            current user who reads or updates the document.
	 * @param counterUserProperty
	 * @throws SystemException
	 * @throws NotSupportedException
	 * @throws HeuristicRollbackException
	 * @throws HeuristicMixedException
	 * @throws RollbackException
	 * @throws IllegalStateException
	 * @throws SecurityException
	 */
	@SuppressWarnings("unchecked")
	public Integer increaseHitcount(final NodeRef nodeRef, final String userName, final QName counterProperty,
			final QName counterDateProperty, final QName counterUserProperty) throws NotSupportedException,
			SystemException, SecurityException, IllegalStateException, RollbackException, HeuristicMixedException,
			HeuristicRollbackException {
		UserTransaction transaction = transactionService.getNonPropagatingUserTransaction(false);
		transaction.begin();

		try {
			Preconditions.checkNotNull(nodeRef, "Passed noderef should not be null");
			Preconditions.checkArgument(nodeService.exists(nodeRef), "Node[" + nodeRef
					+ "] must exist in the repository");
			filter.disableAllBehaviours();
			Map<QName, Serializable> newProperties = Maps.newHashMap();
			Integer counter = (Integer) nodeService.getProperty(nodeRef, counterProperty);
			if (counter == null) {
				counter = setHitCountProperties(nodeRef, counterProperty, counterDateProperty, counterUserProperty,
						newProperties, 1, userName);
			} else {
				boolean shouldCount = true;
				Map<QName, Serializable> properties = nodeService.getProperties(nodeRef);
				Serializable usersValue = properties.get(counterUserProperty);

				List<String> users;
				if (!(usersValue instanceof List)) {
					users = Lists.newArrayList((String) usersValue);
				} else {
					users = (List<String>) usersValue;
				}

				if (users != null) {
					int userIndex = users.indexOf(userName);
					if (userIndex != -1) {
						List<Date> counterDates = (List<Date>) properties.get(counterDateProperty);
						Date lastUserReadDate = counterDates.get(userIndex);
						// only count one download for a
						// document of
						// a user per day
						if (DateUtils.isSameDay(lastUserReadDate, new Date())) {
							shouldCount = false;
							LOG.info("User " + userName + " already downloads/updates document " + nodeRef
									+ " today. Skip counting.");
						}
					}
				}
				if (shouldCount) {
					counter = setHitCountProperties(nodeRef, counterProperty, counterDateProperty, counterUserProperty,
							newProperties, counter, userName);
				}

			}
			transaction.commit();
			LOG.info("Commiting transaction for Node " + nodeRef);
			return counter;
		} finally {
			filter.enableAllBehaviours();
			if (transaction.getStatus() == javax.transaction.Status.STATUS_ACTIVE) {
				transaction.rollback();
				LOG.warn("Had to rollback the transaction for Node " + nodeRef);
			}

		}
	}

	/**
	 * increases the counter, adds the username and the current date to the
	 * properties of the given noderef.
	 * 
	 * @param nodeRef
	 * @param counterProperty
	 * @param counterDateProperty
	 * @param newProperties
	 * @param counter
	 * @return
	 */
	private int setHitCountProperties(final NodeRef nodeRef, final QName counterProperty,
			final QName counterDateProperty, final QName counterUserProperty, Map<QName, Serializable> newProperties,
			int counter, String userName) {
		newProperties.put(counterDateProperty, new Date());
		newProperties.put(counterUserProperty, userName);
		newProperties.put(counterProperty, ++counter);
		nodeService.addProperties(nodeRef, newProperties);
		LOG.info("Increased count of nodeRef [" + nodeRef + "] to " + counter + " for user " + userName);
		return counter;
	}

}
