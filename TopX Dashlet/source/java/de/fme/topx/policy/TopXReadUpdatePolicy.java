
package de.fme.topx.policy;

import java.util.HashSet;
import java.util.Set;

import net.sf.acegisecurity.providers.ProviderNotFoundException;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.repo.content.ContentServicePolicies;
import org.alfresco.repo.content.ContentServicePolicies.OnContentReadPolicy;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.repo.transaction.AlfrescoTransactionSupport;
import org.alfresco.repo.transaction.TransactionListener;
import org.alfresco.repo.transaction.TransactionListenerAdapter;
import org.alfresco.service.cmr.repository.InvalidNodeRefException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import de.fme.topx.component.TopXUpdateComponent;
import de.fme.topx.constants.DataModel;


/**
 * This class contains the behaviour behind the 'topx:countable' aspect.
 * <p>
 * Access to content readers and writers does not necessarily have to be done in
 * writable transactions. This aspect behaviour demonstrates how the hit count
 * incrementing is done after the transaction.
 * 
 * @author jens goldhammer
 * 
 *         template was the ContentHitsAspect from Roy Wetherall and Derek
 *         Hulley
 */
public class TopXReadUpdatePolicy implements ContentServicePolicies.OnContentReadPolicy{

	/** A key that keeps track of nodes that need read count increments */
	private static final String KEY_CONTENT_HITS_READS = TopXReadUpdatePolicy.class.getName() + ".reads";

	final static Log LOG = LogFactory.getLog(TopXReadUpdatePolicy.class);

	private PolicyComponent policyComponent;
	private TransactionListener transactionListener;
	private AuthenticationService authenticationService;
	TopXUpdateComponent updateComponent;

	public void setUpdateComponent(TopXUpdateComponent updateComponent) {
		this.updateComponent = updateComponent;
	}

	public void setAuthenticationService(AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}

	/**
	 * Default constructor for bean construction
	 */
	public TopXReadUpdatePolicy() {
		this.transactionListener = new TopXTransactionListener();
	}

	/**
	 * Sets the policy component
	 * 
	 * @param policyComponent
	 *            the policy component
	 */
	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}

	/**
	 * Spring init method used to register the policy behaviours
	 */
	public void init() {
		// Register the policy behaviours
		this.policyComponent.bindClassBehaviour(OnContentReadPolicy.QNAME, DataModel.TOPX_ASPECTNAME,
				new JavaBehaviour(this, "onContentRead", NotificationFrequency.TRANSACTION_COMMIT));
	}

	/**
	 * onContentRead policy behaviour.
	 * <p>
	 * This adds the node to the list of nodes that require read count incremets
	 * after the transaction completes.
	 * 
	 */
	public void onContentRead(NodeRef nodeRef) {
		boolean isSystemUser = true;
		try {
			isSystemUser = authenticationService.isCurrentUserTheSystemUser();
		} catch (ProviderNotFoundException e) {
			LOG.warn("internal code calls the policy " + "without any provider config", e);
		}

		if (!isSystemUser) {
			// Bind the listener to the transaction
			AlfrescoTransactionSupport.bindListener(transactionListener);
			// Get the set of nodes read
			@SuppressWarnings("unchecked")
			Set<NodeRef> readNodeRefs = (Set<NodeRef>) AlfrescoTransactionSupport.getResource(KEY_CONTENT_HITS_READS);

			if (readNodeRefs == null) {
				readNodeRefs = new HashSet<NodeRef>(5);
				AlfrescoTransactionSupport.bindResource(KEY_CONTENT_HITS_READS, readNodeRefs);
			}
			readNodeRefs.add(nodeRef);
		}
	}

	/**
	 * transaction listener for the topx policy. It
	 * 
	 * @author jgoldhammer
	 * 
	 */
	private class TopXTransactionListener extends TransactionListenerAdapter {

		/**
		 * (non-Javadoc)
		 * 
		 * @see org.alfresco.repo.transaction.TransactionListenerAdapter#afterCommit()
		 */
		@Override
		public void afterCommit() {

			// Get all the nodes that need their read counts incremented
			@SuppressWarnings("unchecked")
			Set<NodeRef> readNodeRefs = (Set<NodeRef>) AlfrescoTransactionSupport.getResource(KEY_CONTENT_HITS_READS);
			if (readNodeRefs != null) {
				for (NodeRef nodeRef : readNodeRefs) {
					try {
						updateNodeReadCount(nodeRef, authenticationService.getCurrentUserName());
					} catch (Throwable e) {
						throw new AlfrescoRuntimeException("Cannot update the read count for node" + nodeRef, e);
					}
				}
			}
		}

		private void updateNodeReadCount(NodeRef nodeRef, String userName) throws Throwable {
			try {
				Integer newCount = updateComponent.increaseHitcount(nodeRef, userName, DataModel.TOPX_COUNTER,
						DataModel.TOPX_DATE, DataModel.TOPX_USER);
				if (LOG.isDebugEnabled()) {
					LOG.debug("Incremented content read count on node: Node:" + nodeRef + " New Count: " + newCount);
				}
			} catch (InvalidNodeRefException e) {
				LOG.error("Unable to increment content read count on missing node: " + nodeRef, e);
				throw e;
			} catch (Throwable e) {
				LOG.error("Failed to increment content read count on node: " + nodeRef, e);
				throw e;
			}
		}

	}
}
