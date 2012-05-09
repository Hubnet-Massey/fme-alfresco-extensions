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

/**
 * MyGengo list component.
 * 
 * @namespace MyGengo
 * @class MyGengo.JobList
 */
if (typeof MyGengo == "undefined") MyGengo={};

(function()
		{
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom,
	Event = YAHOO.util.Event,
	Element = YAHOO.util.Element,
	Bubbling = YAHOO.Bubbling;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML,
	$date = function $date(date, format) { return Alfresco.util.formatDate(Alfresco.util.fromISO8601(date), format); };

	/**
	 * MyGengo.JobList constructor.
	 * 
	 * @param {String} htmlId The HTML id of the parent element
	 * @return {MyGengo.JobList} The new  instance
	 * @constructor
	 */
	MyGengo.JobList = function(htmlId)
	{
		this.name = "MyGengo.CreateJob";
		this.id = htmlId;

		/* Register this component */
		Alfresco.util.ComponentManager.register(this);

		this.widgets = {};
		this.twisterIds = [];
		this.showingMoreActions = false;

		/* Load YUI Components */
		Alfresco.util.YUILoaderHelper.require(["button", "container", "datasource", "datatable", "json", "paginator", "history", "animation"], this.onComponentsLoaded, this);

		Bubbling.on("jobUpdated", this.onJobUpdated, this);
		Bubbling.on("refreshJobs", this.onRefreshAllJobs, this);
		return this;
	};
	/**
	 * Extend from Alfresco.component.Base
	 */
	YAHOO.extend(MyGengo.JobList, Alfresco.component.Base);


	/**
	 * Augment prototype with main class implementation, ensuring overwrite is enabled
	 */
	YAHOO.lang.augmentObject(MyGengo.JobList.prototype,
	{

		/**
		 * Object container for initialization options
		 *
		 * @property options
		 * @type object
		 */
		options:
		{
			/**
			 * Current siteId.
			 * 
			 * @property siteId
			 * @type string
			 */
			siteId: "",

			/**
			 * Role of current user.
			 * 
			 * @property userRole
			 * @type string
			 */
			userRole:"None",
			
			/**
			 * Available languages.
			 * 
			 * @property languages
			 * @type string
			 */
			languages: null,
			/**
			 * Number of max. Actions until show more menu is used
			 * 
			 * @property rowsPerPage
			 * @type int
			 */
			splitActionsAt: 4,

			/**
			 * Number of items per page
			 * 
			 * @property rowsPerPage
			 * @type int
			 */
			rowsPerPage: 10,
			/**
	          * Delay time value for "More Actions" popup, in milliseconds
	          *
	          * @property actionsPopupTimeout
	          * @type int
	          * @default 500
	          */
	         actionsPopupTimeout: 500,
			
		},
		
		/**
		 * Current actions menu being shown
		 * 
		 * @property currentActionsMenu
		 * @type object
		 * @default null
		 */
		currentActionsMenu: null,

		/**
		 * Whether "More Actions" pop-up is currently visible.
		 * 
		 * @property showingMoreActions
		 * @type boolean
		 * @default false
		 */
		showingMoreActions: null,

		/**
		 * Deferred actions menu element when showing "More Actions" pop-up.
		 * 
		 * @property deferredActionsMenu
		 * @type object
		 * @default null
		 */
		deferredActionsMenu: null,



		/**
		 * Fired by YUI when parent element is available for scripting.
		 * Component initialisation, including instantiation of YUI widgets and event listener binding.
		 *
		 * @method onReady
		 */
		onReady : function MyGengoJobList_onReady() {
			var columnDefinitions = [
			                         { key: "id", sortable: false, formatter: this.bind(this.renderCellDetails) },
			                         { key: "actions", sortable: false, formatter: this.bind(this.renderCellActions), width: 200 }
			];

			this.widgets.dataSource = new YAHOO.util.DataSource(Alfresco.constants.PROXY_URI + "api/mygengo/site/"
					+ Alfresco.constants.SITE + "/myGengo/jobs");
			this.widgets.dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
			this.widgets.dataSource.connXhrMode= 'queueRequests';
			this.widgets.dataSource.responseSchema = {
					resultsList: "jobs",
					metaFields:
					{
						totalRecords: "totalRecords"
					}
			};

			this.widgets.paginator = new YAHOO.widget.Paginator(
			{
				containers: [ this.id + "-paginator-top"],
				rowsPerPage: this.options.rowsPerPage,
				alwaysVisible : false,
				initialPage: 1,
				template: Alfresco.util.message("pagination.template"),
		        pageReportTemplate: Alfresco.util.message("pagination.template.page-report"),
		        previousPageLinkLabel: Alfresco.util.message("pagination.previousPageLinkLabel"),
		        nextPageLinkLabel: Alfresco.util.message("pagination.nextPageLinkLabel")
			});
			var oConfigs = {
					paginator: this.widgets.paginator,
					initialRequest: "",
					renderLoopSize: 32,
					MSG_EMPTY: this.msg("msg.myGengo-list.noJobs"),
					MSG_ERROR: Alfresco.util.message("message.datatable.error"),
					MSG_LOADING: Alfresco.util.message("message.datatable.loading")

			};
			this.widgets.dataTable = new YAHOO.widget.DataTable(this.id + "-jobs", columnDefinitions,
					this.widgets.dataSource, oConfigs);
			this.widgets.dataTable.showTableMessage(Alfresco.util.message("message.datatable.loading"), YAHOO.widget.DataTable.CLASS_LOADING);
			// Enable row highlighting (and making it possible to display hidden column content such as actions using css)
			this.widgets.dataTable.subscribe("rowMouseoverEvent", this.onEventHighlightRow, this, true);
	        this.widgets.dataTable.subscribe("rowMouseoutEvent", this.onEventUnhighlightRow, this, true);
	        var me = this;
	        this.widgets.dataTable.subscribe("renderEvent", function(a,b,c){
	        	for (var i=0; i < me.twisterIds.length; i++){
	        		MyGengo.util.createTwister(me.twisterIds[i]);
	        	}
	        	me.twisterIds = [];
	        	me.widgets.paginator.render();
	        });
	        this.widgets.dataTable.on('rowDblclickEvent',function(aArgs) {
	             var theTarget = aArgs.target;
	             var theRecord = this.getRecord(theTarget);
	             
	             me.onActionView(theRecord.getData());
	        });
	        
	        // Hook action events
	        var fnActionHandler = function MyGengoJobList_fnActionHandler(layer, args)
	        {
	        	var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
	        	if (owner !== null)
	        	{
	        		if (typeof me[owner.className] == "function")
	        		{
	        			args[1].stop = true;
	        			var asset = me.widgets.dataTable.getRecord(args[1].target.offsetParent).getData();
	        			me[owner.className].call(me, asset, owner);
	        		}
	        	}
	        	return true;
	        };
	        YAHOO.Bubbling.addDefaultAction("action-link", fnActionHandler);
	        YAHOO.Bubbling.addDefaultAction("show-more", fnActionHandler);
	        
			// Finally show the component body here to prevent UI artifacts on
			// YUI button decoration
			Dom.setStyle(this.id + "-body", "visibility", "visible");
		},
		
		/**
		 * renderCellDetails custom datacell formatter
		 *
		 * @method renderCellJobId
		 * @param elCell {object}
		 * @param oRecord {object}
		 * @param oColumn {object}
		 * @param oData {object|string}
		 */
		renderCellDetails: function MyGengoJobList_renderCellDetails(elCell, oRecord, oColumn, oData)
		{
			var record = oRecord.getData();
			var htmlTemplate = '\
				<div class="detail">\
					<h4 class="jobId"><img class="status-image" src="{status-image}"/>{label-id}: {id} - {slug}</h4>\
					<span class="item">{unitCount} <em>{unitType}(s)</em></span>\
					<span class="item"><em>{label-credits}:</em> {credits}</span>\
					<span class="item"><em>{label-ordered}:</em> {ordered}</span>\
					<span class="item"><em>{label-updated}:</em> {updated}</span>\
					<span class="item"><em>{label-eta}:</em> {eta}</span>\
				</div>\
				<div class="detail">\
					<span class="item"><em>{label-status}:</em><div class="status {status}">{status}</div></span>\
					<span class="item">{source} > {target}</span>\
					<span class="item"><em>{label-tier}:</em><img class="tier-image" src="{tier}"/></span>\
					<span class="item"><em>{label-comment}:</em> <div class="comments">{comment}</div></span>\
				</div>\
				<div class="jobtext">\
					<span id="{textTwisterId}"></span><span>{text}{translation}</span>\
				</div>';
			
			var now = new Date();
			var currentTimeMillis = now.getTime();
			var textTwisterId = this.id + "-twister-"+ record.id;
			var html = YAHOO.lang.substitute( htmlTemplate, {
				id: record.id,
				"label-id": this.msg("label.jobId"),
				slug: record.title,
				unitCount: record.unitCount,
				unitType: record.unitType,
				credits: record.credits,
				"label-credits": this.msg("label.credits"),
				ordered: $date(record.created, this.msg("date-format.mediumDate")) + " " + $date(record.created, this.msg("date-format.mediumTime")),
				"label-ordered": this.msg("label.ordered"),
				eta: MyGengo.util.eta(now, new Date(currentTimeMillis + (record.eta * 1000))),
				"label-eta": this.msg("label.eta"),
				"label-status": this.msg("label.status"),
				status: record.status,
				"status-image" : Alfresco.constants.URL_RESCONTEXT + "components/myGengo/images/status/" + record.status +".png",
				"language-image" : Alfresco.constants.URL_RESCONTEXT + "components/images/forward-arrow-16.png",
				source: this.options.languages != null ? MyGengo.util.getLanguageName(this.options.languages.languages, record.sourceLanguage): record.sourceLanguage,
				target: this.options.languages != null ? MyGengo.util.getLanguageName(this.options.languages.languages, record.targetLanguage): record.targetLanguage,
				"label-tier": this.msg("label.tier"),
				tier: Alfresco.constants.URL_RESCONTEXT + "components/myGengo/images/tier/" + record.tier +".png",
				"label-comment": this.msg("label.comment"),
				comment: record.commentsCount,
				updated: $date(record.updated, this.msg("date-format.mediumDate")) + " " + $date(record.updated, this.msg("date-format.mediumTime")),
				"label-updated": this.msg("label.updated"),
				textTwisterId : textTwisterId,
				text: record.text, 
				translation: (record.translation && record.translation != "") ? "<br/><img src='"+ Alfresco.constants.URL_RESCONTEXT +"/components/myGengo/images/down-arrow-16.png' class='language-image'/><br/><span>"+record.translation+"</span>" : ""
			});
			elCell.innerHTML = html;
			this.twisterIds.push(textTwisterId);
		},
		/**
		 * renderCellActions custom datacell formatter
		 *
		 * @method renderCellJobId
		 * @param elCell {object}
		 * @param oRecord {object}
		 * @param oColumn {object}
		 * @param oData {object|string}
		 */
		renderCellActions: function MyGengoJobList_renderCellActions(elCell, oRecord, oColumn, oData)
		{
			Dom.setStyle(elCell, "width", oColumn.width + "px");
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

            elCell.innerHTML = '<div id="' + this.id + '-actions-' + oRecord.getId() + '" class="hidden"></div>';
		},

		/**
		 * Custom event handler to highlight row.
		 *
		 * @method onEventHighlightRow
		 * @param oArgs.event {HTMLEvent} Event object.
		 * @param oArgs.target {HTMLElement} Target element.
		 */
		onEventHighlightRow: function MyGengoJobList_onEventHighlightRow(oArgs)
		{
			// elActions is the element id of the active table cell where we'll inject the actions
			var elActions = Dom.get(this.id + "-actions-" + oArgs.target.id);

			// Inject the correct action elements into the actionsId element
			if (elActions && elActions.firstChild === null)
			{
				// Call through to get the row highlighted by YUI
				this.widgets.dataTable.onEventHighlightRow.call(this.widgets.dataTable, oArgs);

				// Clone the actionSet template node from the DOM
				var record = this.widgets.dataTable.getRecord(oArgs.target.id),
				clone = Dom.get(this.id + "-actionSet").cloneNode(true);

				// Token replacement
				clone.innerHTML = YAHOO.lang.substitute(window.unescape(clone.innerHTML), this.getActionUrls(record));

				// Generate an id
				clone.id = elActions.id + "_a";

				// Simple view by default
				Dom.addClass(clone, "simple");

				// Trim the items in the clone depending on the user's access
				var userAccess = record.getData("permissions").userAccess,
				actionLabels = record.getData("actionLabels") || {};


				// Remove any actions the user doesn't have permission for
				var actions = YAHOO.util.Selector.query("div", clone),
				action, aTag, spanTag, actionPermissions, aP, i, ii, j, jj;

				for (i = 0, ii = actions.length; i < ii; i++)
				{
					action = actions[i];
					aTag = action.firstChild;
					spanTag = aTag.firstChild;
					if (spanTag && actionLabels[action.className])
					{
						spanTag.innerHTML = $html(actionLabels[action.className]);
					}

					if (aTag.rel !== "")
					{
						actionPermissions = aTag.rel.split(",");
						for (j = 0, jj = actionPermissions.length; j < jj; j++)
						{
							aP = actionPermissions[j];
							// Support "negative" permissions
							if ((aP.charAt(0) == "~") ? !!userAccess[aP.substring(1)] : !userAccess[aP])
							{
								clone.removeChild(action);
								break;
							}
						}
					}
				}

				// Need the "More >" container?
				var splitAt = this.options.splitActionsAt;
				actions = YAHOO.util.Selector.query("div", clone);
				if (actions.length > splitAt)
				{
					var moreContainer = Dom.get(this.id + "-moreActions").cloneNode(true);
					var containerDivs = YAHOO.util.Selector.query("div", moreContainer);
					// Insert the two necessary DIVs before the splitAt action item
					Dom.insertBefore(containerDivs[0], actions[splitAt]);
					Dom.insertBefore(containerDivs[1], actions[splitAt]);
					// Now make action items after the split, children of the 2nd DIV
					var index, moreActions = actions.slice(splitAt);
					for (index in moreActions)
					{
						if (moreActions.hasOwnProperty(index))
						{
							containerDivs[1].appendChild(moreActions[index]);
						}
					}
				}

				elActions.appendChild(clone);
			}

			if (this.showingMoreActions)
			{
				this.deferredActionsMenu = elActions;
			}
			else if (!Dom.hasClass(document.body, "masked"))
			{
				this.currentActionsMenu = elActions;
				// Show the actions
				Dom.removeClass(elActions, "hidden");
				this.deferredActionsMenu = null;
			}
		},

		/**
		 * Custom event handler to unhighlight row.
		 *
		 * @method onEventUnhighlightRow
		 * @param oArgs.event {HTMLEvent} Event object.
		 * @param oArgs.target {HTMLElement} Target element.
		 */
		onEventUnhighlightRow: function MyGengoJobList_onEventUnhighlightRow(oArgs)
		{
			// Call through to get the row unhighlighted by YUI
			this.widgets.dataTable.onEventUnhighlightRow.call(this.widgets.dataTable, oArgs);

			var elActions = Dom.get(this.id + "-actions-" + (oArgs.target.id));

			// Don't hide unless the More Actions drop-down is showing, or a dialog mask is present
			if (!this.showingMoreActions || Dom.hasClass(document.body, "masked"))
			{
				// Just hide the action links, rather than removing them from the DOM
				Dom.addClass(elActions, "hidden");
				this.deferredActionsMenu = null;
			}
		},

		/**
		 * The urls to be used when creating links in the action cell
		 *
		 * @method getActionUrls
		 * @param record {YAHOO.widget.Record | Object} A data record, or object literal describing the item in the list
		 * @return {object} Object literal containing URLs to be substituted in action placeholders
		 */
		getActionUrls: function MyGengoJobList_getActionUrls(record)
		{
			var recordData = YAHOO.lang.isFunction(record.getData) ? record.getData() : record,
					nodeRef = recordData.nodeRef;

			return (
					{
						editMetadataUrl: "edit-dataitem?nodeRef=" + nodeRef
					});
		},
		
		/**
		 * view job pop-up
		 *
		 * @method onActionView
		 * @param item {object} Object literal representing one data item
		 */
		onActionView: function MyGengoJobList_onActionView(item)
		{
			// Intercept before dialog show
	         var doBeforeDialogShow = function MyGengoJobList_onActionView_doBeforeDialogShow(p_form, p_dialog)
	         {
	           Alfresco.util.populateHTML(
	               [ p_dialog.id + "-form-dialog-header", this.msg("label.view-job.title", item.id) ]
	            );
	         };
			var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT + "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}",
					{
						itemKind: "node",
						itemId: item.nodeRef,
						mode: "view"
					});

			// Using Forms Service, so always create new instance
			var viewDetails = new MyGengo.module.SimpleViewDialog(this.id + "-viewDetails");
			viewDetails.setOptions(
					{
						width: "1000px",
						templateUrl: templateUrl,
						doBeforeDialogShow:
						{
							fn: doBeforeDialogShow,
							scope: this
						}
					}).show();
		},
		
		/**
		 * comment job pop-up
		 *
		 * @method onActionComment
		 * @param item {object} Object literal representing one data item
		 */
		onActionComment: function MyGengoJobList_onActionComment(item)
		{
			 // Intercept before dialog show
	         var doBeforeDialogShow = function MyGengoJobList_onActionComment_doBeforeDialogShow(p_form, p_dialog)
	         {
	            Alfresco.util.populateHTML(
	               [ p_dialog.id + "-form-container_h", this.msg("label.comment-job.title", item.id) ]
	            );
	         };
			var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT + "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}&formId={formId}&submitType={submitType}",
					{
						itemKind: "node",
						formId:"comment-form",
						itemId: item.nodeRef,
						mode: "edit",
						submitType: "json"
					});

			// Using Forms Service, so always create new instance
			var editDetails = new Alfresco.module.SimpleDialog(this.id + "-editDetails");
			editDetails.setOptions(
			{
				width: "1000px",
				templateUrl: templateUrl,
				actionUrl: null,
				destroyOnHide: true,
				doBeforeDialogShow:
				{
					fn: doBeforeDialogShow,
					scope: this
				},
				onSuccess:
				{
					fn: this.onActionRefresh,
					obj: {refresh:false, item:item},
					scope: this
				},
				onFailure:
				{
					fn: function MyGengoJobList_onActionApprove_failure(response)
					{
						this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
								{
									text: this.msg("message.comment.failure")
								});
					},
					scope: this
				}
			}).show();
		},
	      
		/**
		 * approve job pop-up
		 *
		 * @method onActionApprove
		 * @param item {object} Object literal representing one data item
		 */
		onActionApprove: function MyGengoJobList_onActionApprove(item)
		{
			// Intercept before dialog show
			var doBeforeDialogShow = function MyGengoJobList_onActionComment_doBeforeDialogShow(p_form, p_dialog)
			{
				Alfresco.util.populateHTML(
	               [ p_dialog.id + "-form-container_h", this.msg("label.approve-job.title", item.id) ]
	            );
			};
			var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT + "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}&formId={formId}&submitType={submitType}",
					{
				itemKind: "node",
				formId:"approve-form",
				itemId: item.nodeRef,
				mode: "edit",
				submitType: "json"
					});
			
			// Using Forms Service, so always create new instance
			var editDetails = new Alfresco.module.SimpleDialog(this.id + "-editDetails");
			editDetails.setOptions(
					{
						width: "1000px",
						templateUrl: templateUrl,
						actionUrl: null,
						destroyOnHide: true,
						doBeforeDialogShow:
						{
							fn: doBeforeDialogShow,
							scope: this
						},
						onSuccess:
						{
							fn: this.onActionRefresh,
							obj: {refresh:false, item:item},
							scope: this
						},
						onFailure:
						{
							fn: function MyGengoJobList_onActionComment_failure(response)
							{
								this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
										{
											text: this.msg("message.approve.failure")
										});
							},
							scope: this
						}
					}).show();
		},
		/**
		 * revise job pop-up
		 *
		 * @method onActionRevise
		 * @param item {object} Object literal representing one data item
		 */
		onActionRevise: function MyGengoJobList_onActionRevise(item)
		{
			// Intercept before dialog show
			var doBeforeDialogShow = function MyGengoJobList_onActionRevise_doBeforeDialogShow(p_form, p_dialog)
			{
				Alfresco.util.populateHTML(
						[ p_dialog.id + "-form-container_h", this.msg("label.revise-job.title", item.id) ]
				);
			};
			var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT + "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}&formId={formId}&submitType={submitType}",
			{
				itemKind: "node",
				formId:"revise-form",
				itemId: item.nodeRef,
				mode: "edit",
				submitType: "json"
			});
			
			// Using Forms Service, so always create new instance
			var editDetails = new Alfresco.module.SimpleDialog(this.id + "-editDetails");
			editDetails.setOptions(
			{
				width: "1000px",
				templateUrl: templateUrl,
				actionUrl: null,
				destroyOnHide: true,
				doBeforeDialogShow:
				{
					fn: doBeforeDialogShow,
					scope: this
				},
				onSuccess:
				{
					fn: this.onActionRefresh,
					obj: {refresh:false, item:item},
					scope: this
				},
				onFailure:
				{
					fn: function MyGengoJobList_onActionRevise_failure(response)
					{
						this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
						{
							text: this.msg("message.revise.failure")
						});
					},
					scope: this
				}
			}).show();
		},
		/**
		 * reject job pop-up
		 *
		 * @method onActionReject
		 * @param item {object} Object literal representing one data item
		 */
		onActionReject: function MyGengoJobList_onActionReject(item)
		{
			// Intercept before dialog show
			var doBeforeDialogShow = function MyGengoJobList_onActionReject_doBeforeDialogShow(p_form, p_dialog)
			{
				Alfresco.util.populateHTML(
						[ p_dialog.id + "-form-container_h", this.msg("label.reject-job.title", item.id) ]
				);
			};
			var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT + "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}&formId={formId}&submitType={submitType}",
			{
				itemKind: "node",
				formId:"reject-form",
				itemId: item.nodeRef,
				mode: "edit",
				submitType: "json"
			});
			
			// Using Forms Service, so always create new instance
			var editDetails = new Alfresco.module.SimpleDialog(this.id + "-editDetails");
			editDetails.setOptions(
			{
				width: "1000px",
				templateUrl: templateUrl,
				actionUrl: null,
				destroyOnHide: true,
				doBeforeDialogShow:
				{
					fn: doBeforeDialogShow,
					scope: this
				},
				onSuccess:
				{
					fn: this.onActionRefresh,
					obj: {refresh:false, item:item},
					scope: this
				},
				onFailure:
				{
					fn: function MyGengoJobList_onActionReject_failure(response)
				{
						this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
						{
							text: this.msg("message.reject.failure")
						});
				},
				scope: this
				}
			}).show();
		},
		/**
		 * refresh job pop-up
		 *
		 * @method onActionRefresh
		 * @param item {object} Object literal representing one data item
		 */
		onActionRefresh: function MyGengoJobList_onActionRefresh(item, obj)
		{
			if (!item.nodeRef && obj.item){
				item = obj.item;
			}
			// Display success message
			this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.refresh.wait"),
               spanClass: "wait",
               displayTime: 0,
               effect: null
            });
			var uri = YAHOO.lang.substitute( Alfresco.constants.PROXY_URI + "api/mygengo/site/{site}/{container}/job/{nodeRef}?refresh={refresh}", {
				site : Alfresco.constants.SITE,
				container: "myGengo",
				nodeRef: new Alfresco.util.NodeRef(item.nodeRef).uri,
				refresh: obj.refresh === false ? "false" : "true"
			});
			var config = {
					url: uri,
					successCallback:
                    {
                       fn: function MyGengoJobList_onActionRefresh_refreshSuccess(response)
                       {
                          // Fire "itemUpdated" event
                          Bubbling.fire("jobUpdated",
                          {
                             item: response.json
                          });
                          // Display success message
                          this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
                          {
                             text: this.msg("message.refresh.success")
                          });
                       },
                       scope: this
                    },
                    failureCallback:
                    {
                       fn: function MyGengoJobList_onActionRefresh_refreshFailure(response)
                       {
                          this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
                          {
                             text: this.msg("message.refresh.failure")
                          });
                       },
                       scope: this
                    }
			};
			Alfresco.util.Ajax.jsonGet(config);
		},
		
		/**
		 * Delete job.
		 *
		 * @method onActionDelete
		 * @param item {object} Object literal representing one data item
		 */
		onActionDelete: function MyGengoJobList_onActionDelete(item)
		{
			var me = this;

			Alfresco.util.PopupManager.displayPrompt(
			{
				title: this.msg("message.confirm.delete.title"),
				text: this.msg("message.confirm.delete", item.id),
				buttons: [
		          {
		        	  text: this.msg("button.delete"),
		        	  handler: function MyGengoJobList_onActionDelete_delete()
			          {
		        		  this.destroy();
		        		  me._onActionDeleteConfirm.call(me, item);
			          }
		          },
		          {
		        	  text: this.msg("button.cancel"),
		        	  handler: function MyGengoJobList_onActionDelete_cancel()
			          {
		        		  this.destroy();
			          },
			          isDefault: true
		          }
		       ]
			});
		},

		/**
		 * Delete job confirmed.
		 *
		 * @method _onActionDeleteConfirm
		 * @param item {object} Object literal representing one data item
		 * @private
		 */
		_onActionDeleteConfirm: function MyGengoJobList__onActionDeleteConfirm(item)
		{
			nodeRef = new Alfresco.util.NodeRef(item.nodeRef);
			var uri = YAHOO.lang.substitute( Alfresco.constants.PROXY_URI + "api/mygengo/site/{site}/{container}/job/{nodeRef}", {
				site : Alfresco.constants.SITE,
				container: "myGengo",
				nodeRef: nodeRef.uri,
			});
			
			var config = {
				url: uri ,
				successCallback:
                {
                   fn: function MyGengoJobList_onActionDeleteConfirm_refreshSuccess(response)
                   {
                	   var recordFound = this._findRecordByParameter(item.nodeRef, "nodeRef");
                	   if (recordFound !== null)
                	   {
                		   this.widgets.dataTable.deleteRow(recordFound, item);
                	   }

                	   // Display success message
                	   Alfresco.util.PopupManager.displayMessage(
        			   {
        				   text: this.msg("message.delete.success", item.id)
        			   });
                   },
                   scope: this
                },
                failureCallback:
                {
                   fn: function MyGengoJobList_onActionDeleteConfirm_refreshFailure(response)
                   {
                      this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
                      {
                         text: this.msg("message.delete.failure", item.id)
                      });
                   },
                   scope: this
                }
			};
			Alfresco.util.Ajax.jsonDelete(config);

		},
		/**
		 * Cancel job.
		 *
		 * @method onActionCancel
		 * @param item {object} Object literal representing one data item
		 */
		onActionCancel: function MyGengoJobList_onActionCancel(item)
		{
			var me = this;
			
			Alfresco.util.PopupManager.displayPrompt(
			{
				title: this.msg("message.confirm.cancel.title"),
				text: this.msg("message.confirm.cancel", item.id),
				buttons: [
		          {
		        	  text: this.msg("button.yes"),
		        	  handler: function MyGengoJobList_onActionCancel_delete()
			          {
			        		  this.destroy();
			        		  me._onActionCancelConfirm.call(me, item);
			          }
		          },
		          {
		        	  text: this.msg("button.no"),
		        	  handler: function MyGengoJobList_onActionCancel_cancel()
			          {
			        		  this.destroy();
			          },
			          isDefault: true
		          }
		        ]
			});
		},
		
		/**
		 * Cancel asset confirmed.
		 *
		 * @method _onActionCancelConfirm
		 * @param item {object} Object literal representing one data item
		 * @private
		 */
		_onActionCancelConfirm: function MyGengoJobList__onActionCancelConfirm(item)
		{
			nodeRef = new Alfresco.util.NodeRef(item.nodeRef);
			var uri = YAHOO.lang.substitute( Alfresco.constants.PROXY_URI + "api/mygengo/site/{site}/{container}/job/{nodeRef}", {
				site : Alfresco.constants.SITE,
				container: "myGengo",
				nodeRef: nodeRef.uri,
			});
			
			var config = {
					url: uri ,
					successCallback:
					{
						fn: function MyGengoJobList_onActionCancelConfirm_refreshSuccess(response)
						{
										var recordFound = this._findRecordByParameter(item.nodeRef, "nodeRef");
										if (recordFound !== null)
										{
											this.widgets.dataTable.deleteRow(recordFound, item);
										}
										
										// Display success message
										Alfresco.util.PopupManager.displayMessage(
												{
													text: this.msg("message.cancel.success", item.id)
												});
						},
						scope: this
					},
					failureCallback:
					{
						fn: function MyGengoJobList_onActionCancelConfirm_refreshFailure(response)
						{
								this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
										{
											text: this.msg("message.cancel.failure", item.id)
										});
						},
						scope: this
					}
			};
			Alfresco.util.Ajax.jsonDelete(config);
			
		},
		/**
		 * refresh all jobs event handler
		 *
		 * @method onRefreshAllJobs
		 * @param layer {object} Event fired
		 * @param args {array} Event parameters (depends on event type)
		 */
		onRefreshAllJobs: function MyGengoJobList_onRefreshAllJobs(layer, args)
		{
			 var me = this;
			 // Clear the current job list if the data webscript is taking too long
	         var fnShowLoadingMessage = function DataGrid_fnShowLoadingMessage()
	         {
	            // Check the timer still exists. This is to prevent IE firing the event after we cancelled it. Which is "useful".
	            if (timerShowLoadingMessage)
	            {
	               loadingMessage = Alfresco.util.PopupManager.displayMessage(
	               {
	                  displayTime: 0,
	                  text: '<span class="wait">' + $html(this.msg("message.refreshAll.wait")) + '</span>',
	                  noEscape: true
	               });
	               
	               if (YAHOO.env.ua.ie > 0)
	               {
	                  this.loadingMessageShowing = true;
	               }
	               else
	               {
	                  loadingMessage.showEvent.subscribe(function()
	                  {
	                     this.loadingMessageShowing = true;
	                  }, this, true);
	               }
	            }
	         };
	         
	         // Reset the custom error messages
	         this._setDefaultDataTableErrors(this.widgets.dataTable);
	         
	         // More Actions menu no longer relevant
	         this.showingMoreActions = false;
	         
	         // Slow data webscript message
	         this.loadingMessageShowing = false;
	         timerShowLoadingMessage = YAHOO.lang.later(this.options.loadingMessageDelay, this, fnShowLoadingMessage);
	         
	         var destroyLoaderMessage = function DataGrid__uDG_destroyLoaderMessage()
	         {
	            if (timerShowLoadingMessage)
	            {
	               // Stop the "slow loading" timed function
	               timerShowLoadingMessage.cancel();
	               timerShowLoadingMessage = null;
	            }

	            if (loadingMessage)
	            {
	               if (this.loadingMessageShowing)
	               {
	                  // Safe to destroy
	                  loadingMessage.destroy();
	                  loadingMessage = null;
	               }
	               else
	               {
	                  // Wait and try again later. Scope doesn't get set correctly with "this"
	                  YAHOO.lang.later(100, me, destroyLoaderMessage);
	               }
	            }
	         };
	         
	         var successHandler = function DataGrid__uDG_successHandler(sRequest, oResponse, oPayload)
	         {
	            destroyLoaderMessage();
	            //this.currentPage = p_obj.page || 1;
	            this.widgets.dataTable.onDataReturnInitializeTable.call(this.widgets.dataTable, sRequest, oResponse, oPayload);
	         };
	         
	         var failureHandler = function DataGrid__uDG_failureHandler(sRequest, oResponse)
	         {
	            destroyLoaderMessage();
	            if (oResponse.status == 401)
	            {
	               // Our session has likely timed-out, so refresh to offer the login page
	               window.location.reload(true);
	            }
	            else
	            {
	               try
	               {
	                  var response = YAHOO.lang.JSON.parse(oResponse.responseText);
	                  Alfresco.util.PopupManager.displayMessage(
						{
							text: response.message
						});
	                  if (oResponse.status == 404)
	                  {
	                     // Site or container not found - deactivate controls
	                     Bubbling.fire("deactivateAllControls");
	                  }
	               }
	               catch(e)
	               {
	                  this._setDefaultDataTableErrors(this.widgets.dataTable);
	               }
	            }
	         };
			this.widgets.dataSource.sendRequest(Alfresco.util.toQueryString({"refresh":"true"}),
	         {
	            success: successHandler,
	            failure: failureHandler,
	            scope: this
	         });
		},
		/**
		 * job updated event handler
		 *
		 * @method onJobUpdated
		 * @param layer {object} Event fired
		 * @param args {array} Event parameters (depends on event type)
		 */
		onJobUpdated: function MyGengoJobList_onJobUpdated(layer, args)
		{
			this.widgets.busyMessage.destroy();
			
            this.showingMoreActions = false;
            if (this.deferredActionsMenu !== null)
            {
               Dom.addClass(this.currentActionsMenu, "hidden");
               this.currentActionsMenu = this.deferredActionsMenu;
               this.deferredActionsMenu = null;
               Dom.removeClass(this.currentActionsMenu, "hidden");
            }
			
			
			var obj = args[1];
			if (obj && (obj.item !== null))
			{
				var recordFound = this._findRecordByParameter(obj.item.nodeRef, "nodeRef");
				if (recordFound !== null)
				{
				   this.widgets.dataTable.updateRow(recordFound, obj.item);
				   // highlight it
	               var el = this.widgets.dataTable.getTrEl(this._findRecordByParameter(obj.item.nodeRef, "nodeRef"));
	               Alfresco.util.Anim.pulse(el, {outColor: "#FFFFFF"});
				}
			}
		},
		
		/**
		 * Show more actions pop-up.
		 *
		 * @method onActionShowMore
		 * @param asset {object} Unused
		 * @param elMore {element} DOM Element of "More Actions" link
		 */
		onActionShowMore: function MyGengoJobList_onActionShowMore(asset, elMore)
		{
			var me = this;

			// Fix "More Actions" hover style
			Dom.addClass(elMore.firstChild, "highlighted");

			// Get the pop-up div, sibling of the "More Actions" link
			var elMoreActions = Dom.getNextSibling(elMore);
			Dom.removeClass(elMoreActions, "hidden");
			me.showingMoreActions = true;

			// Hide pop-up timer function
			var fnHidePopup = function MyGengoJobList_oASM_fnHidePopup()
			{
				// Need to rely on the "elMoreActions" enclosed variable, as MSIE doesn't support
				// parameter passing for timer functions.
				Event.removeListener(elMoreActions, "mouseover");
				Event.removeListener(elMoreActions, "mouseout");
				Dom.removeClass(elMore.firstChild, "highlighted");
				Dom.addClass(elMoreActions, "hidden");
				me.showingMoreActions = false;
				if (me.deferredActionsMenu !== null)
				{
					Dom.addClass(me.currentActionsMenu, "hidden");
					me.currentActionsMenu = me.deferredActionsMenu;
					me.deferredActionsMenu = null;
					Dom.removeClass(me.currentActionsMenu, "hidden");
				}
			};

			// Initial after-click hide timer - 5x the mouseOut timer delay
			if (elMoreActions.hideTimerId)
			{
				window.clearTimeout(elMoreActions.hideTimerId);
			}
			elMoreActions.hideTimerId = window.setTimeout(fnHidePopup, me.options.actionsPopupTimeout * 5);

			// Mouse over handler
			var onMouseOver = function MyGengoJobList_onMouseOver(e, obj)
			{
				// Clear any existing hide timer
				if (obj.hideTimerId)
				{
					window.clearTimeout(obj.hideTimerId);
					obj.hideTimerId = null;
				}
			};

			// Mouse out handler
			var onMouseOut = function MyGengoJobList_onMouseOut(e, obj)
			{
				var elTarget = Event.getTarget(e);
				var related = elTarget.relatedTarget;

				// In some cases we should ignore this mouseout event
				if ((related != obj) && (!Dom.isAncestor(obj, related)))
				{
					if (obj.hideTimerId)
					{
						window.clearTimeout(obj.hideTimerId);
					}
					obj.hideTimerId = window.setTimeout(fnHidePopup, me.options.actionsPopupTimeout);
				}
			};

			Event.on(elMoreActions, "mouseover", onMouseOver, elMoreActions);
			Event.on(elMoreActions, "mouseout", onMouseOut, elMoreActions);
		},
		/**
		 * Searches the current recordSet for a record with the given parameter value
		 *
		 * @method _findRecordByParameter
		 * @private
		 * @param p_value {string} Value to find
		 * @param p_parameter {string} Parameter to look for the value in
		 */
		_findRecordByParameter: function MyGengoJobList__findRecordByParameter(p_value, p_parameter)
		{
			var recordSet = this.widgets.dataTable.getRecordSet();
			for (var i = 0, j = recordSet.getLength(); i < j; i++)
			{
				if (recordSet.getRecord(i).getData(p_parameter) == p_value)
				{
					return recordSet.getRecord(i);
				}
			}
			return null;
		},
		/**
	       * Resets the YUI DataTable errors to our custom messages
	       * NOTE: Scope could be YAHOO.widget.DataTable, so can't use "this"
	       *
	       * @method _setDefaultDataTableErrors
	       * @private
	       * @param dataTable {object} Instance of the DataTable
	       */
	      _setDefaultDataTableErrors: function DataGrid__setDefaultDataTableErrors(dataTable)
	      {
	         var msg = Alfresco.util.message;
	         dataTable.set("MSG_EMPTY", msg("msg.myGengo-list.noJobs", "MyGengo.JobList"));
	         dataTable.set("MSG_ERROR", msg("message.datatable.error", "MyGengo.JobList"));
	      },
    }, true);
})();