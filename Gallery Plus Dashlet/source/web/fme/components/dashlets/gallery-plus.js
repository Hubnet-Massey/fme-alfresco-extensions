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
 * FME top-level dashlet namespace.
 * 
 * @namespace FME.dashlet
 */
FME.dashlet = FME.dashlet || {};


FME.util = {
	nz : function(value, defaultvalue) {
		if( typeof (value) === undefined || value == null) {
			return defaultvalue;
		}
		return value;
	}
};

/**
 * fme Gallery Plus dashboard component.
 *
 * @namespace Alfresco
 * @class FME.dashlet.GalleryPlus
 * @author fmaul
 */
(function() {
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event, KeyListener = YAHOO.util.KeyListener;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML, $combine = Alfresco.util.combinePaths, $nz = FME.util.nz;

	/**
	 * Dashboard GalleryPlus constructor.
	 *
	 * @param {String}
	 *            htmlId The HTML id of the parent element
	 * @return {FME.dashlet.GalleryPlus} The new component instance
	 * @constructor
	 */
	FME.dashlet.GalleryPlus = function GalleryPlus_constructor(htmlId) {
		return FME.dashlet.GalleryPlus.superclass.constructor.call(this, "FME.dashlet.GalleryPlus", htmlId);
	};
	/**
	 * Extend from Alfresco.component.Base and add class implementation
	 */
	YAHOO.extend(FME.dashlet.GalleryPlus, Alfresco.component.Base, {
		constants : {
			SCROLL_LOAD_TRIGGER : 300,
			VIEWMODE_ALBUMS : "albums",
			VIEWMODE_IMAGES : "images"
		},

		/**
		 * Object container for initialization options
		 *
		 * @property options
		 * @type object
		 */
		options : {
			title : "Gallery Plus Dashlet",
			viewmode : "images",
			singleAlbumNodeRef : "",
			filterPath : "",
			filterTags : "",
			sort : "cm:name",
			maxImages : 50,
			componentId : "",
			detailsUrl : "",
			background : "white",
			siteId : ""
		},

		widgets : {},

		/**
		 * Distribute a delta (integer value) to n items based on
		 * the size (width) of the items thumbnails.
		 * 
		 * @method calculateCutOff
		 * @property len the sum of the width of all thumbnails
		 * @property delta the delta (integer number) to be distributed
		 * @property items an array of all items
		 */
		calculateCutOff : function FdGP_calculateCutOff(len, delta, items) {
			// resulting distribution
			var cutoff = [];
			var cutsum = 0;

			// distribute the delta based on the proportion of
			// thumbnail size to length of all thumbnails.
			for(var i in items) {
				var item = items[i];
				var fractOfLen = item.twidth / len;
				cutoff[i] = Math.floor(fractOfLen * delta);
				cutsum += cutoff[i];
			}

			// still more pixel to distribute because of decimal
			// fractions that were omitted.
			var stillToCutOff = delta - cutsum;
			while(stillToCutOff > 0) {
				for(i in cutoff) {
					// distribute pixels evenly until done
					cutoff[i]++;
					stillToCutOff--;
					if(stillToCutOff == 0)
						break;
				}
			}
			return cutoff;
		},
		
		/**
		 * Takes images from the items array (removes them) as 
		 * long as they fit into a width of maxwidth pixels.
		 *
		 * @method buildImageRow
		 */
		buildImageRow : function FdGP_buildImageRow(maxwidth, items) {
			var row = [];
			var len = 0;
			// ignore first margin
			var marginsOfImage = 6;
			var item;

			// Build a row of images until longer than maxwidth
			while(items.length > 0 && len < maxwidth) {
				item = items.shift();
				row.push(item);
				len += (item.twidth + marginsOfImage);
			}

			// calculate by how many pixels too long?
			var delta = len - maxwidth;

			// if the line is too long, make images smaller
			if(row.length > 0 && delta > 0) {

				// calculate the distribution to each image in the row
				var cutoff = this.calculateCutOff(len, delta, row);

				for(var i in row) {
					var pixelsToRemove = cutoff[i];
					item = row[i];

					// move the left border inwards by half the pixels
					item.vx = Math.floor(pixelsToRemove / 2);

					// shrink the width of the image by pixelsToRemove
					item.vwidth = item.twidth - pixelsToRemove;
				}
			} else {
				// all images fit in the row, set vx and vwidth
				for(var i in row) {
					item = row[i];
					item.vx = 0;
					item.vwidth = item.twidth;
				}
			}

			return row;
		},
		
		/**
		 * Draws all thumbnail images in the dashlet. If cleanup is specified the image area is
		 * cleared, else exisiting images are updated.   
		 */
		updateThumbnailImages : function FdGP_updateThumbnailImages(cleanup) {

			// copy items, because we need to remove from the array
			var items = this.currentThumbnails.slice();
			// this.widgets.backTo

			this.showImageArea();

			// if we are doing a reload, clean up the target area
			if(cleanup) {
				// remove all images
				this.widgets.imageArea.innerHTML = "";
			}

			// check how width the dashlet window is
			var windowWidth = this.widgets.imageArea.parentNode.offsetWidth;

			// calculate rows of images which each row fitting into
			// the specified windowWidth (and 8 pixel margin).
			var rows = [];
			while(items.length > 0) {
				rows.push(this.buildImageRow(windowWidth - 8, items));
				//
			}

			// now create the images as HTML objects (in the DOM)
			for(var r in rows) {
				for(var i in rows[r]) {
					var item = rows[r][i];
					if(item.el) {
						// this image is already on the screen, update it
						this.updateImageElement(item);
					} else {
						// create this image
						this.createImageElement(this.widgets.imageArea, item);
					}
				}
			}

			// check the windowWidth again, if a scrollbar appeared during drawing
			// it may have changed.
			var windowWidthAfter = this.widgets.imageArea.parentNode.offsetWidth;
			if(windowWidth != windowWidthAfter) {
				// reflow the grid, because the scrollbar has appeared and
				// the width has changed.
				this.updateThumbnailImages(false);
			}
		},
		
		/**
		 * Updates an exisiting tthumbnail in the image area. 
		 */
		updateImageElement : function FdGP_updateImageElement(item) {
			var overflow = Dom.getFirstChild(item.el);
			var link = Dom.getFirstChild(overflow);
			var img = Dom.getFirstChild(link);

			Dom.setStyle(overflow, "width", "" + $nz(item.vwidth, 120) + "px");
			Dom.setStyle(overflow, "height", "" + $nz(item.theight, 120) + "px");

			Dom.setStyle(img, "margin-left", "" + (item.vx ? (-item.vx) : 0) + "px");
			Dom.setStyle(img, "margin-top", "" + 0 + "px");
		},
		
		/**
		 * Creates a new thumbail in the image area. An attaches a fade in animation
		 * to the image. 
		 */
		createImageElement : function FdGP_createImageElement(parentNode, item) {
			var imageContainer = document.createElement("div");
			Dom.addClass(imageContainer, "imageContainer");

			var overflow = document.createElement("div");
			Dom.setStyle(overflow, "width", "" + $nz(item.vwidth, 120) + "px");
			Dom.setStyle(overflow, "height", "" + $nz(item.theight, 120) + "px");
			Dom.setStyle(overflow, "overflow", "hidden");

			var link = document.createElement("a");
			Dom.addClass(link, "viewImageAction");
			link.href = item.nodeRef;

			var img = document.createElement("img");
			img.src = Alfresco.constants.PROXY_URI + item.thumbUrl;
			img.title = item.title;
			Dom.setStyle(img, "width", "" + $nz(item.twidth, 120) + "px");
			Dom.setStyle(img, "height", "" + $nz(item.theight, 120) + "px");
			Dom.setStyle(img, "margin-left", "" + (item.vx ? (-item.vx) : 0) + "px");
			Dom.setStyle(img, "margin-top", "" + 0 + "px");
			Dom.setStyle(img, "opacity", "0");

			link.appendChild(img);
			overflow.appendChild(link);
			imageContainer.appendChild(overflow);

			// fade in the image after load
			YAHOO.util.Event.addListener(img, 'load', function(ev) {
				var imgFade = new YAHOO.util.Anim(img, {
					opacity : {
						to : 1
					}
				}, 0.5);
				imgFade.animate();
			});
			
			// display the number of comments if there are any
			if(item.comments && item.comments > 0) {
				var comments = document.createElement("div");
				Dom.addClass(comments, "commentnumber");
				comments.innerHTML = "" + item.comments;
				imageContainer.appendChild(comments);
			}

			Event.addListener(link, "click", this.onImageClick, this, true);

			parentNode.appendChild(imageContainer);
			item.el = imageContainer;
			return imageContainer;
		},
		
		/**
		 * Handler for a click on an image. It opens the preview dialog.
		 */
		onImageClick : function FdGP_onImageClick(e, args) {
			if(!this.widgets.imageView) {
				this.widgets.imageView = new FME.module.PreviewDialog(this.id);
			}

			// Fix for IE<9 which doesn't have currentTarget
			if(e.currentTarget) {
				var selectedNodeRef = e.currentTarget.href;
			} else {
				var selectedNodeRef = e.srcElement.parentElement.href;
			}

			// Determine the index of the currently clicked image
			var index = 0;
			for(index in this.currentThumbnails) {
				if(this.currentThumbnails[index].nodeRef == selectedNodeRef)
					break;
			}

			// Pass the list of all images to the preview dialog
			this.widgets.imageView.setOptions({
				templateUrl : Alfresco.constants.URL_SERVICECONTEXT + "fme/modules/preview-dialog",
				items : this.currentThumbnails,
				index : parseInt(index),
				detailsUrl : this.options.detailsUrl,
				siteId : this.options.siteId
			}).show();

			YAHOO.util.Event.stopEvent(e);
			return false;
		},
		
		/**
		 * Loads thumbnail images from the server based on the currently selected options.  
		 */
		loadImages : function FdGP_loadImages(loadmore, selectedAlbum) {
			if(this.currentlyLoading) {
				return;
			}
			
			this.currentViewmode = this.constants.VIEWMODE_IMAGES;

			// determine how many images to request from the server
			var numberOfImages = this.options.maxImages;
			if(loadmore && this.currentThumbnails) {
				numberOfImages -= this.currentThumbnails.length;
			}
			numberOfImages = Math.min(this.options.pageSize, numberOfImages);

			if(numberOfImages > 0) {
				this.loadSpecificNumberOfImages(loadmore, selectedAlbum, numberOfImages);
			}
		},
		
		/**
		 * Loads a specific number of images from the server and is only used by FdGP_loadImages().
		 */
		loadSpecificNumberOfImages : function FdGP_loadSpecificNumberOfImages(loadmore, selectedAlbum, numberOfImages) {
			if(this.currentlyLoading)
				return;

			var galleryImagesUrl = Alfresco.constants.PROXY_URI + "de/fme/dashlets/gallery?thumbName={thumbName}&max={max}&skip={skip}&sort={sort}&sortOrder={sortOrder}&filterPath={filterPath}&filterTags={filterTags}&albumNodeRef={albumNodeRef}";

			if(selectedAlbum) {
				// If an album was selected use it for the query
				Dom.setStyle(this.widgets.backToAlbumsLink, "display", "inline");
				this.selectedAlbum = selectedAlbum.nodeRef;
				this.updateTitle(selectedAlbum.title);
			} else {
				if(!loadmore) {
					Dom.setStyle(this.widgets.backToAlbumsLink, "display", "none");
					this.selectedAlbum = (this.options.singleAlbumNodeRef != "all") ? this.options.singleAlbumNodeRef : "";
					this.updateTitle();
				}
			}
			
			// build the query options for the image request
			galleryImagesUrl = YAHOO.lang.substitute(galleryImagesUrl, {
				max : numberOfImages,
				skip : loadmore ? this.currentThumbnails.length : 0,
				sort : this.options.sort,
				sortOrder : this.options.sortOrder,
				albumNodeRef : this.selectedAlbum,
				filterPath : this.options.filterPath.substr(0, this.options.filterPath.indexOf("|")),
				filterTags : this.options.filterTags,
				thumbName : this.options.thumbName
			});

			this.currentlyLoading = true;
			
			// Execute the request to retrieve the list of images to display
			Alfresco.util.Ajax.jsonRequest({
				// this.options.siteId
				url : galleryImagesUrl,
				successCallback : {
					fn : function(response) {
						if(loadmore) {
							this.currentThumbnails = this.currentThumbnails.concat(response.json.thumbs);
							this.updateThumbnailImages(false);
						} else {
							this.currentThumbnails = response.json.thumbs;
							this.updateThumbnailImages(true);
						}
						this.currentlyLoading = false;
					},
					scope : this
				},
				failureCallback : {
					fn : function(response) {
						this.currentlyLoading = false;

						// show the failure message inline
						var elMessage = Dom.get(this.id + "-message");
						elMessage.innerHTML = $html(response.json.message);
						Dom.removeClass(elMessage, "hidden");
					},
					scope : this
				}
			});

		},
		
		/**
		 * Fired by YUI when parent element is available for scripting
		 *
		 * @method onReady
		 */
		onReady : function FdGP_onReady() {
			var me = this;
			this.currentViewmode = this.options.viewmode;

			this.widgets.scrollArea = Dom.get(this.id + "-list");
			this.widgets.imageArea = Dom.get(this.id + "-images");

			// update the thumbnail view then the window is resized
			YAHOO.util.Event.addListener(window, 'resize', function(ev) {
				if(me.currentViewmode == me.constants.VIEWMODE_IMAGES) {
					me.updateThumbnailImages.call(me, false);
				}
			});

			// load additional images then the dashlet contents are scrolled
			var scrollPositionSource = this.widgets.scrollArea;
			var scrollEventSource = this.widgets.scrollArea;
			if (!scrollEventSource) {
				scrollEventSource = window;
				scrollPositionSource = window.document.body;
			}
			YAHOO.util.Event.addListener(scrollEventSource, 'scroll', function(ev) {
				if(me.currentViewmode == me.constants.VIEWMODE_IMAGES) {
					var bottomPosition = scrollPositionSource.clientHeight + scrollPositionSource.scrollTop;
					if(bottomPosition + me.constants.SCROLL_LOAD_TRIGGER > scrollPositionSource.scrollHeight) {
						me.loadImages(true);
					}
				}
			});

			this.widgets.backToAlbumsLink = Dom.get(this.id + "-back-to-albums");
			Event.addListener(this.widgets.backToAlbumsLink, "click", function(e) {
				this.fadeOutImageArea();
				this.currentViewmode = this.constants.VIEWMODE_ALBUMS;
				this.updateView();
			}, this, true);

			Dom.setStyle(this.widgets.backToAlbumsLink, "display", "none");

			if (this.widgets.scrollArea) {
				Dom.setStyle(this.widgets.scrollArea, "background-color", this.options.background);
			}

			this.updateTitle();
			this.updateView();
		},
	
		/**
		 * Updates the title of the dashlet and displays the album name if applicable
		 */
		updateTitle : function FdGP_updateTitle(albumTitle) {
			var title = this.options.title;
			
			if (albumTitle) {
				title += " - " + albumTitle;
			}
			
			var titleNode = Dom.get(this.id + "-title-text");
			if (titleNode) {
				titleNode.innerHTML = title;
			}
		},
		
		/**
		 * Updates the dashlet view and decides which view (images or albums to display)
		 */
		updateView : function FdGP_updateView() {
			if(this.currentViewmode == this.constants.VIEWMODE_ALBUMS) {
				this.displayAlbums();
			} else {
				this.loadImages(false);
			}
		},
		
		/**
		 * Loads the list of albums for display in the albums viewmode
		 */
		displayAlbums : function FdGP_displayAlbums() {
			this.updateTitle();
			this.currentViewmode = this.constants.VIEWMODE_ALBUMS;
			var albumsUrl = Alfresco.constants.PROXY_URI + "de/fme/dashlets/gallery-albums?filterPath={filterPath}&filterTags={filterTags}";
			albumsUrl = YAHOO.lang.substitute(albumsUrl, {
				filterPath : this.options.filterPath.substr(0, this.options.filterPath.indexOf("|")),
				filterTags : this.options.filterTags
			});

			// Execute the request to retrieve the list of images to display
			Alfresco.util.Ajax.jsonRequest({
				url : albumsUrl,
				successCallback : {
					fn : function(response) {
						this.drawAlbums(response.json.albums);
					},
					scope : this
				},
				failureCallback : {
					fn : function(response) {
						this.currentlyLoading = false;
						// remove the ajax wait spinner
						Dom.addClass(this.id + "-wait", "hidden");

						// show the failure message inline
						var elMessage = Dom.get(this.id + "-message");
						elMessage.innerHTML = $html(response.json.message);
						Dom.removeClass(elMessage, "hidden");
					},
					scope : this
				}
			});
		},
	
		/**
		 * Draw the albums to the dashlet via DOM operations after the data has been loaded.
		 */	
		drawAlbums : function FdGP_drawAlbums(albums) {
			Dom.setStyle(this.widgets.backToAlbumsLink, "display", "none");

			this.showImageArea();
			this.widgets.imageArea.innerHTML = "";

			// draw an image stack for each album
			for(var a in albums) {
				var album = albums[a];

				var stack = document.createElement("div");
				Dom.addClass(stack, "image_stack");

				// If only one preview, show as middle image (index=1)
				var startIndex = (album.previews.length == 1) ? 1 : 0;  

				// each albums stack consists of 3 images 
				for(var i = 0; i < 3; i++) {
					if(album.previews[i]) {
						var image = document.createElement("img");
						Dom.addClass(image, "photo" + (startIndex + i + 1));
						image.src = Alfresco.constants.PROXY_URI + "api/node/" + album.previews[i].replace("://", "/") + "/content/thumbnails/galpThumb200?c=force";
						stack.appendChild(image);
					}
				}
				
				var title = document.createElement("div");
				Dom.addClass(title, "imgtitle");
				title.innerHTML = album.title;
				stack.appendChild(title);

				// when an album is clicked the whole image area is faded out
				Event.addListener(stack, "click", function(e, ctx) {
					ctx.gallery.fadeOutImageArea.call(ctx.gallery);
					ctx.gallery.loadImages(false, ctx.album);
				}, {
					gallery : this,
					album : album
				}, false);

				this.widgets.imageArea.appendChild(stack);
			}
		},
		
		/**
		 * Fade out the image area. This is used when switching between images and albums viewmodes.
		 */
		fadeOutImageArea : function FdGP_fadeOutImageArea() {
			this.imageAreaAnimation = new YAHOO.util.Anim(this.widgets.imageArea, {
				opacity : {
					from : 1,
					to : 0
				}
			}, 1);
			this.imageAreaAnimation.animate();
		},
		
		/**
		 * Ensures that the image area is visible after has been faded out by FdGP_fadeOutImageArea().
		 */
		showImageArea : function FdGP_showImageArea() {
			if(this.imageAreaAnimation && this.imageAreaAnimation.isAnimated()) {
				this.imageAreaAnimation.stop();
				this.imageAreaAnimation = null;
			}
			Dom.setStyle(this.widgets.imageArea, "opacity", "1");
		},
		
		/**
		 * Called when the user clicks the config dashlet link. Will open a
		 * dashlet config dialog
		 *
		 * @method onConfigDashletClick
		 * @param e
		 *            The click event
		 */
		onConfigDashletClick : function FdGP_onConfigDashletClick(e) {
			Event.stopEvent(e);

			var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/gallery/config/" + encodeURIComponent(this.options.componentId);

			if(!this.configDialog) {
				this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions({
					width : "50em",
					templateUrl : Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/gallery/config?tag=" + this.options.tag,
					onSuccess : {
						fn : function DocumentsForTag_onConfigDashlet_callback(response) {
							var obj = response.json;
							if(obj) {
								this.options = YAHOO.lang.merge(this.options, obj);
							}
							this.updateTitle();
							if (this.widgets.scrollArea) {
								Dom.setStyle(this.widgets.scrollArea, "background-color", this.options.background);
							}
							this.currentViewmode = this.options.viewmode;
							this.updateView();
						},
						scope : this
					},
					doSetupFormsValidation : {
						fn : function DocumentsForTag_doSetupForm_callback(form) {
							/*
							 * set form validation: title: mandatory tag: mandatory
							 * rowsPerPage: mandatory & positive integer
							 */
							form.addValidation(this.configDialog.id + "-title", Alfresco.forms.validation.mandatory, null, "keyup");
							form.addValidation(this.configDialog.id + "-viewmode", Alfresco.forms.validation.mandatory, null, "keyup");
							form.addValidation(this.configDialog.id + "-maxImages", Alfresco.forms.validation.regexMatch, {
								pattern : /^\d+$/,
								match : true
							}, "keyup", this.msg("message.validation.maxImages"));
							form.addValidation(this.configDialog.id + "-pageSize", Alfresco.forms.validation.regexMatch, {
								pattern : /^\d+$/,
								match : true
							}, "keyup", this.msg("message.validation.maxImages"));
							form.setShowSubmitStateDynamically(true, false);
							Dom.get(this.configDialog.id + "-title").value = this.options.title;
							Dom.get(this.configDialog.id + "-filterPath").value = this.options.filterPath;
							Dom.get(this.configDialog.id + "-filterPathView").innerHTML = this.options.filterPath.substr(this.options.filterPath.indexOf("|") + 1);
							Dom.get(this.configDialog.id + "-filterTags").value = this.options.filterTags;
							Dom.get(this.configDialog.id + "-sort").value = this.options.sort;
							Dom.get(this.configDialog.id + "-pageSize").value = this.options.pageSize;
							Dom.get(this.configDialog.id + "-maxImages").value = this.options.maxImages;
							Dom.get(this.configDialog.id + "-background").value = this.options.background;

							var initList = function(listId, fieldId, selectedValue) {
								Dom.get(this.configDialog.id + fieldId).value = selectedValue;
								var listEl = Dom.get(this.configDialog.id + listId);
								for(var i = 0; i < listEl.options.length; i++) {
									if(listEl.options[i].value == selectedValue) {
										listEl.options[i].selected = true;
									}
								}
							}

							initList.call(this, "-viewmode-list", "-viewmode", this.options.viewmode);
							initList.call(this, "-singleAlbumNodeRef-list", "-singleAlbumNodeRef", this.options.singleAlbumNodeRef);
							initList.call(this, "-thumbName-list", "-thumbName", this.options.thumbName);
							initList.call(this, "-sortOrder-list", "-sortOrder", this.options.sortOrder);

							this.configDialog.widgets.filterPathView = Dom.get(this.configDialog.id + "-filterPathView");
							this.configDialog.widgets.filterPathField = Dom.get(this.configDialog.id + "-filterPath");
							this.configDialog.widgets.selectFilterPathButton = Alfresco.util.createYUIButton(this.configDialog, "selectFilterPath-button", this.onSelectFilterPath);
							this.configDialog.widgets.clearFilterPathButton = Alfresco.util.createYUIButton(this.configDialog, "clearFilterPath-button", this.onClearFilterPath);
						},
						scope : this
					}
				});
			}

			// augment configDialog to support mandatoryControlValueUpdated
			// bubble event fired by dashlet-configure-object-finder
			YAHOO.lang.augmentObject(this.configDialog, {
				onMandatoryControlValueUpdated : function FormUI_onMandatoryControlValueUpdated(layer, args) {
					this.form.updateSubmitElements();
				}
			}, true);
			YAHOO.Bubbling.on("mandatoryControlValueUpdated", this.configDialog.onMandatoryControlValueUpdated, this.configDialog);

			this.configDialog.setOptions({
				actionUrl : actionUrl,
				siteId : this.options.siteId,
				containerId : this.options.containerId
			}).show();
		},
		
		/**
		 * Clears the filter path in the dashlet config dialog.
		 */
		onClearFilterPath : function FdGP_onClearFilterPath(e) {
			this.widgets.filterPathView.innerHTML = "";
			this.widgets.filterPathField.value = "";
		},
		
		/**
		 * Shows the filter path selection dialog to easily select a path to filter images by.
		 */
		onSelectFilterPath : function FdGP_onSelectFilterPath(e) {
			// Set up select destination dialog
			if(!this.widgets.filterPathDialog) {
				this.widgets.filterPathDialog = new Alfresco.module.DoclibGlobalFolder(this.id + "-selectFilterPath");

				var allowedViewModes = [Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY,
				//Alfresco.module.DoclibGlobalFolder.VIEW_MODE_SITE,
				Alfresco.module.DoclibGlobalFolder.VIEW_MODE_USERHOME];

				this.widgets.filterPathDialog.setOptions({
					allowedViewModes : allowedViewModes,
					siteId : this.options.siteId,
					containerId : this.options.containerId,
					title : "Select filter path", //this.msg("title.destinationDialog"),
					nodeRef : "alfresco://company/home"
				});

				YAHOO.Bubbling.on("folderSelected", function(layer, args) {
					var obj = args[1];
					if(obj !== null) {
						this.widgets.filterPathView.innerHTML = obj.selectedFolder.path;
						this.widgets.filterPathField.value = obj.selectedFolder.nodeRef + "|" + obj.selectedFolder.path;
					}
				}, this);
			}

			// Make sure correct path is expanded
			var pathNodeRef = this.widgets.filterPathField.value;
			this.widgets.filterPathDialog.setOptions({
				pathNodeRef : pathNodeRef ? new Alfresco.util.NodeRef(pathNodeRef) : null
			});

			// Show dialog
			this.widgets.filterPathDialog.showDialog();
		}
	});
})();
