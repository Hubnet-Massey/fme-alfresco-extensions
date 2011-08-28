/**
 * FME root namespace.
 * 
 * @namespace FME
 */
if (typeof FME == "undefined" || !FME)
{
   var FME = {};
}

/**
 * FME top-level module namespace.
 * 
 * @namespace FME.module	
 */
FME.module = FME.module || {};
/**
 * fme Image Preview Dialog, used by the Gallery Plus dashlet.
 * 
 * This dialog uses some code from the Alfresco.module.SimpleDialog but is mostly rewritten.
 *
 * @namespace FME.module
 * @class FME.module.PreviewDialog
 * @author Florian Maul (fme AG)
 */
(function() {
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event, KeyListener = YAHOO.util.KeyListener;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML, $combine = Alfresco.util.combinePaths;

	FME.module.PreviewDialog = function PreviewDialog_constructor(htmlId) {
		return FME.module.PreviewDialog.superclass.constructor.call(this, "FME.module.PreviewDialog", htmlId);
	};

	YAHOO.extend(FME.module.PreviewDialog, Alfresco.component.Base, {
		/**
		 * Dialog instance.
		 *
		 * @property dialog
		 * @type YAHOO.widget.Panel
		 */
		dialog : null,

		/**
		 * Object container for initialization options
		 *
		 * @property options
		 * @type object
		 */
		options : {
			templateUrl : "",
			items : [],
			index : 0,
			thumbName : "galpThumb120",
			detailsUrl : ""
		},

		/**
		 * Main entrypoint to show the dialog
		 *
		 * @method show
		 */
		show : function FMPD_show() {
			if(this.dialog) {
				this._showDialog();
			} else {
				var data = {
					htmlid : this.id
				};
				Alfresco.util.Ajax.request({
					url : this.options.templateUrl,
					dataObj : data,
					successCallback : {
						fn : this.onTemplateLoaded,
						scope : this
					},
					failureMessage : "Could not load dialog template from '" + this.options.templateUrl + "'.",
					scope : this,
					execScripts : true
				});
			}
			return this;
		},
		
		/**
		 * Event callback when dialog template has been loaded
		 *
		 * @method onTemplateLoaded
		 * @param response
		 *            {object} Server response from load template XHR
		 *            request
		 */
		onTemplateLoaded : function FMPD_onTemplateLoaded(response) {
			// Inject the template from the XHR request into a new DIV element
			var containerDiv = document.createElement("div");
			containerDiv.innerHTML = response.serverResponse.responseText;

			// The panel is created from the HTML returned in the XHR request,
			// not the container
			var dialogDiv = Dom.getFirstChild(containerDiv);
			while(dialogDiv && dialogDiv.tagName.toLowerCase() != "div") {
				dialogDiv = Dom.getNextSibling(dialogDiv);
			}

			this.dialog = Alfresco.util.createYUIPanel(dialogDiv, {
				width : "1100px",
				height : "750px",
				fixedcenter : true,
				constraintoviewport : true,
				underlay : "none",
				close : true,
				visible : false,
				draggable : true
			});

			this.widgets.image = Dom.get(this.id + "-image");
			this.widgets.commentArea = Dom.get(this.id + "-comments");
			this.widgets.commentButton = Alfresco.util.createYUIButton(this, "newcomment-button", this.postComment);

			YAHOO.util.Event.addListener(Dom.get(this.id + "-right"), "click", function(e, dialog) {
				dialog.showImage(dialog.options.index + 1);
			}, this);

			YAHOO.util.Event.addListener(Dom.get(this.id + "-left"), "click", function(e, dialog) {
				dialog.showImage(dialog.options.index - 1);
			}, this);

			YAHOO.util.Event.addListener(Dom.get(this.id + "-imageViewDialog"), "mousewheel", function(e, dialog) {
				var downwards = e.wheelDelta < 0;
				dialog.showImage(dialog.options.index + ( downwards ? 1 : -1));
				YAHOO.util.Event.preventDefault(e);
				return false;
			}, this);
			
			// for Firefox use DOMMouseScroll... only would YUI3 fixed this
			YAHOO.util.Event.addListener(Dom.get(this.id + "-imageViewDialog"), "DOMMouseScroll", function(e, dialog) {
				var downwards = e.detail > 0;
				dialog.showImage(dialog.options.index + ( downwards ? 1 : -1));
				YAHOO.util.Event.preventDefault(e);
				return false;
			}, this);
			
			// Hook close button
			this.dialog.hideEvent.subscribe(this.onHideEvent, null, this);
			this._showDialog();
		},
		
		/**
		 * Displays an image from the list if images (this.items) in the preview dialog. 
		 */
		showImage : function FMPD_showImage(index) {
			// check index parameter against the boundries 
			if(index !== undefined) {
				if(index < 0)
					index = 0;
				if(index >= this.options.items.length)
					index = this.options.items.length - 1;
				this.options.index = parseInt(index);
			}

			// changed the currentItem the the new image
			var item = this.options.items[this.options.index];
			this.currentItem = item;

			var selectedNodeRef = item.nodeRef;
			var nodeRefUrl = selectedNodeRef.replace(":/", "");

			this.widgets.image.src = Alfresco.constants.PROXY_URI + "api/node/" + nodeRefUrl + "/content/thumbnails/galpPreview800?c=force";
			Dom.setStyle(this.widgets.image, "display", "block");

			Dom.setStyle(Dom.get(this.id + "-left"), "display", (this.options.index > 0) ? "block" : "none");
			Dom.setStyle(Dom.get(this.id + "-right"), "display", ((this.options.index + 1) < this.options.items.length) ? "block" : "none");
			Dom.get(this.id + "-imageTitle").innerHTML = item.title;
			Dom.get(this.id + "-imageDescription").innerHTML = item.description;
			Dom.get(this.id + "-detailsAction").href = this.options.detailsUrl + selectedNodeRef;
			Dom.get(this.id + "-downloadAction").href = Alfresco.constants.PROXY_URI + "api/node/" + nodeRefUrl + "/content?a=true";

			this.loadComments(item.nodeRef);

		},
		
		/**
		 * Loads the comments for the node specified by the nodeRef parameter.
		 */
		loadComments : function FMPD_loadComments(nodeRef) {

			var nodeRefUrl = nodeRef.replace("://", "/");
			var url = Alfresco.constants.URL_SERVICECONTEXT + "components/node/" + nodeRefUrl + "/comments?pageSize=1000";

			// Execute the request to retrieve the list of images to display
			Alfresco.util.Ajax.jsonRequest({
				// this.options.siteId
				url : url,
				successCallback : {
					fn : function(response) {
						var comments = response.json;

						// Remove all comments
						this.widgets.commentArea.innerHTML = "";

						for(var c in comments.items) {
							var comment = comments.items[c];
							this.createComment(comment);
						}

						// enable new comment textarea only when create permission is available
						Dom.setStyle(this.widgets.newcomment, "display", (comments.nodePermissions.create) ? "block" : "none");
						this.widgets.textarea.disabled = false;
					},
					scope : this
				},
				failureCallback : {
					fn : function(response) {
					},
					scope : this
				}
			});

		},
		
		/**
		 * Creates a DOM element to display one comment object in the dialog and
		 * append it the comment area (right hand side of the dialog).
		 */
		createComment : function FMPD_createComment(comment) {
			if(comment.author.avatarRef) {
				var avatarUrl = Alfresco.constants.PROXY_URI + "api/node/" + comment.author.avatarRef.replace("://", "/") + "/content/thumbnails/avatar?c=force";
			} else {
				var avatarUrl = Alfresco.constants.URL_RESCONTEXT + "components/images/no-user-photo-64.png";
			}

			var commentElement = document.createElement("div");
			Dom.addClass(commentElement, "comment");

			var avatar = document.createElement("div");
			Dom.addClass(avatar, "avatar");

			var avatarImg = document.createElement("img");
			avatarImg.src = avatarUrl;

			var commentText = document.createElement("div");
			Dom.addClass(commentText, "commenttext");

			var authorElement = document.createElement("div");
			Dom.addClass(authorElement, "author");

			var authorLink = document.createElement("a");
			authorLink.href = Alfresco.constants.URL_CONTEXT + "page/user/" + comment.author.username + "/profile";
			authorLink.innerHTML = comment.author.firstName + " " + comment.author.lastName + ":";

			var contentElement = document.createElement("div");
			Dom.addClass(contentElement, "content");
			contentElement.innerHTML = comment.content + " ";

			var dateElement = document.createElement("div");
			Dom.addClass(dateElement, "date");
			dateElement.innerHTML = this.formatCommentDate(comment.createdOn);

			authorElement.appendChild(authorLink);
			commentText.appendChild(authorElement);
			commentText.appendChild(contentElement);
			commentText.appendChild(dateElement);

			avatar.appendChild(avatarImg);
			commentElement.appendChild(avatar);
			commentElement.appendChild(commentText);

			this.widgets.commentArea.appendChild(commentElement);
		},
		
		/**
		 * Formats the comment date returned by the repository. Displays a relative date if it
		 * can be parsed and an absolute date otherwise.  
		 */
		formatCommentDate : function FMPD_formatCommentDate(createdOn) {
			var formattedDate = Alfresco.util.formatDate(createdOn);
			var parsedDate = Date.parse(formattedDate);
			if(parsedDate) {
				return Alfresco.util.relativeTime(parsedDate);
			} else {
				return formattedDate;
			}
		},
		
		/**
		 * Show the dialog and set focus to the first text field
		 *
		 * @method _showDialog
		 * @private
		 */
		_showDialog : function FMPD_showDialog() {
			// Remove current image, so doesn't popup up when the dialog is reused.
			Dom.setStyle(this.widgets.image, "display", "none");

			this.dialog.show();
			this.showImage();

			if(!this.widgets.keyListener) {
				// Register the ESC key to close the dialog
				this.widgets.keyListener = new KeyListener(document, {
					keys : [KeyListener.KEY.ESCAPE, KeyListener.KEY.LEFT, KeyListener.KEY.RIGHT]
				}, {
					fn : function(id, keyEvent) {
						var key = keyEvent[0];
						if(key == KeyListener.KEY.LEFT) {
							this.showImage(this.options.index - 1);
						} else if(key == KeyListener.KEY.RIGHT) {
							this.showImage(this.options.index + 1);
						} else {
							this.dialog.hide();
						}
					},
					scope : this,
					correctScope : true
				});
			}
			this.widgets.keyListener.enable();

			Event.on(document, "click", this.onOutsideDialogClick, this, true);

			// Setting up comment display
			this.widgets.newcomment = Dom.get(this.id + "-newcomment");
			Dom.setStyle(this.widgets.newcomment, "display", "none");
			this.widgets.textarea = Dom.get(this.id + "-newcommenttext");

			// Listen for Enter events in the textarea to submit comments
			if(!this.widgets.postListener) {
				this.widgets.postListener = new KeyListener(this.widgets.textarea, {
					keys : KeyListener.KEY.ENTER
				}, {
					fn : function(id, keyEvent) {
						this.postComment();
						return true;
					},
					scope : this,
					correctScope : true
				});
			}
			this.widgets.postListener.enable();

		},
		
		/**
		 * Clickhandler for a click outside the dialog. Closes the dialog if a user clicks outside of it.
		 */
		onOutsideDialogClick : function FMPD_onOutsideDialogClick(e) {
			var el = Event.getTarget(e);
			var dialogEl = this.dialog.element;
			if(el != dialogEl && !Dom.isAncestor(dialogEl, el)) {
				this.dialog.hide();
			}
		},
		
		/**
		 * Posts the comment entered by the user to the repository.
		 */
		postComment : function FMPD_postComment() {
			this.widgets.textarea.disabled = true;
			var content = this.widgets.textarea.value;

			var nodeRefUrl = this.currentItem.nodeRef.replace("://", "/");
			var url = Alfresco.constants.PROXY_URI + "api/node/" + nodeRefUrl + "/comments";

			Alfresco.util.Ajax.jsonRequest({
				method : "POST",
				url : url,
				dataObj : {
					content : content
				},
				successCallback : {
					fn : function(response) {
						this.loadComments(this.currentItem.nodeRef);
						this.widgets.textarea.value = "";
						this.widgets.textarea.disabled = false;
					},
					scope : this
				},
				failureCallback : {
					fn : function(response) {
						this.widgets.textarea.disabled = false;
					},
					scope : this
				}

			});
		},
		
		/**
		 * Hide the dialog, removing the caret-fix patch
		 *
		 * @method _hideDialog
		 * @private
		 */
		_hideDialog : function FMPD_hideDialog() {
			Event.removeListener(document, "click", this.onOutsideDialogClick);

			// Unhook close button
			this.dialog.hideEvent.unsubscribe(this.onHideEvent, null, this);

			if(this.widgets.keyListener) {
				this.widgets.keyListener.disable();
			}

			if(this.widgets.postListener) {
				this.widgets.postListener.disable();
			}
		},
		
		/**
		 * Event handler for container "hide" event. Defer until the dialog
		 * itself has processed the hide event so we can safely destroy it
		 * later.
		 *
		 * @method onHideEvent
		 * @param e
		 *            {object} Event type
		 * @param obj
		 *            {object} Object passed back from subscribe method
		 */
		onHideEvent : function FMPD_onHideEvent(e, obj) {
			YAHOO.lang.later(0, this, this._hideDialog);
		}
	});

})();
