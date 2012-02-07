/**
 * Copyright (C) 2011 fme alfresco extensions project
 *
 * This file is part of the fme alfresco extensions project.
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
 *
 * You should have received a copy of the Apache 2.0 license along with
 * this project. If not, see <http://www.apache.org/licenses/LICENSE-2.0>.
 */
if (typeof(FME) == "undefined") FME={};
if (typeof(FME.dashlet) == "undefined") FME.dashlet={};

/**
 * Dashboard DocumentsForTag component.
 * 
 * @namespace FME
 * @class FME.dashlet.DocumentsForTag
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   
   /**
    * Preferences
    */
   var PREFERENCES_TAG_DASHLET = "org.alfresco.share.documentsForTag.dashlet"
      PREFERENCES_TAG_DASHLET_FILTER = PREFERENCES_TAG_DASHLET + ".filter",
      PREFERENCES_TAG_DASHLET_VIEW = PREFERENCES_TAG_DASHLET + ".simpleView";
   
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $links = Alfresco.util.activateLinks,
      $userProfile = Alfresco.util.userProfileLink,
      $siteDashboard = Alfresco.util.siteDashboardLink,
      $relTime = Alfresco.util.relativeTime;


   /**
    * Dashboard DocumentsForTag constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.DocumentsForTag} The new component instance
    * @constructor
    */
   FME.dashlet.DocumentsForTag = function DocumentsForTag_constructor(htmlId)
   {
      FME.dashlet.DocumentsForTag.superclass.constructor.call(this, htmlId, ["paginator"]);
      
      // Re-register with our own name
      this.name = "FME.dashlet.DocumentsForTag";
      Alfresco.util.ComponentManager.reregister(this);

      // Instance variables
      this.options = YAHOO.lang.merge(this.options, FME.dashlet.DocumentsForTag.superclass.options);
      
      this.totalRecords = 0;
      this.initialPage = 1;
      this.favoriteEventClass = Alfresco.util.generateDomId(null, "tagDashletFavourite");
      this.likeEventClass = Alfresco.util.generateDomId(null, "tagDashletLike");
      return this;
   };
   

   YAHOO.extend(FME.dashlet.DocumentsForTag, Alfresco.component.SimpleDocList,
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
          * Dashlet title
          *
          * @property title
          * @type string
          * @default ""
          */
         title: "",
         
         /**
          * Dashlet tag
          *
          * @property tag
          * @type string
          * @default "faq"
          */
         tag: "faq",
         
  	    /**
  	     * Number of entries to display per page. 10 by Default
  	     *
  	     * @property rowsPerPage
  	     * @type int
  	     * @default 10
  	     */
  	    rowsPerPage: 10,
  	    
  	     /**
  	     * Flag if paginator should always be displayed.
  	     *
  	     * @property alwaysDisplayPaginator
  	     * @type boolean
  	     * @default false
  	     */
  	    alwaysDisplayPaginator : false,
  	    
  	    /**
         * The component id
         *
         * @property componentId
         * @type string
         * @default ""
         */
        componentId: ""
  	    
      },

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function DocumentsForTag_onReady()
      {
    	 // Jan: We need support for paginator, thus the whole onReady is copied & modified here:
    	  var me = this;

          // Tooltip for thumbnail on mouse hover
          this.widgets.previewTooltip = new YAHOO.widget.Tooltip(this.id + "-previewTooltip",
          {
             width: "108px"
          });
          this.widgets.previewTooltip.contextTriggerEvent.subscribe(function(type, args)
          {
             var context = args[0],
                record = me.widgets.alfrescoDataTable.getData(context.id),
                thumbnailUrl = Alfresco.constants.PROXY_URI + "api/node/" + record.nodeRef.replace(":/", "") + "/content/thumbnails/doclib?c=queue&ph=true";

             this.cfg.setProperty("text", '<img src="' + thumbnailUrl + '" />');
          });

          // Tooltip for metadata on mouse hover
          this.widgets.metadataTooltip = new YAHOO.widget.Tooltip(this.id + "-metadataTooltip");
          this.widgets.metadataTooltip.contextTriggerEvent.subscribe(function(type, args)
          {
             var context = args[0],
                record = me.widgets.alfrescoDataTable.getData(context.id),
                locn = record.location;

             var text = '<em>' + me.msg("label.site") + ':</em> ' + $html(locn.siteTitle) + '<br />';
             text += '<em>' + me.msg("label.path") + ':</em> ' + $html(locn.path);

             this.cfg.setProperty("text", text);
          });

          /**
           * Create datatable
           */
          this.widgets.alfrescoDataTable = new Alfresco.util.DataTable(
          {
             dataSource:
             {
                url: this.getWebscriptUrl(),
                pagingResolver: function (currentSkipCount, currentMaxItems)
                {
                
                   return  "filterData="+ me.options.tag+ "&size=" + me.options.rowsPerPage +"&pos=" + (currentSkipCount/me.options.rowsPerPage + 1);
                },
                initialParameters: this.getParameters(),
                config:
                {
                   responseSchema:
                   {
                      resultsList: "items",
                      metaFields:
                      {
                         paginationRecordOffset: "startIndex",
                         totalRecords: "totalRecords"
                      }
                   }
                }
             },
             dataTable:
             {
                container: this.id + "-documents",
                columnDefinitions:
                [
                   { key: "thumbnail", sortable: false, formatter: this.bind(this.renderCellThumbnail), width: 16 },
                   { key: "detail", sortable: false, formatter: this.bind(this.renderCellDetail) }
                ],
                config:
                {
                   className: "alfresco-datatable simple-doclist",
                   renderLoopSize: 4
                }
             },
             paginator:{
            	 config:
            	 {
            		 containers: [ this.id + "-paginator-top"],
            		 rowsPerPage: this.options.rowsPerPage,
	                 alwaysVisible : this.options.alwaysDisplayPaginator,
	                 initialPage: this.initialPage,
	                 template: this.msg("tinyPagination.template"),
	                 pageReportTemplate: this.msg("tinyPagination.pageReportTemplate"),
	                 previousPageLinkLabel: this.msg("tinyPagination.previousPageLinkLabel"),
	                 nextPageLinkLabel: this.msg("tinyPagination.nextPageLinkLabel"),
	                 firstPageLinkLabel: this.msg("tinyPagination.firstPageLinkLabel"),
	                 lastPageLinkLabel : this.msg("tinyPagination.lastPageLinkLabel")
            	 },
                 history : false
             }
          });
          
          
          // Jan: augment findRecordByParameter, because recordSet may contain undefined elements
          YAHOO.lang.augmentObject(this.widgets.alfrescoDataTable,
          {
        	  /**
    	      * Searches the current recordSet for a record with the given parameter value
    	      *
    	      * @public
    	      * @method findDataByParameter
    	      * @param p_parameter {string} Parameter to look for the value in
    	      * @param p_value {string} Value to find
    	      * @return The data asscoiated to the row.
    	      */
    	      findRecordByParameter: function DataTable_findRecordByParameter(p_parameter, p_value)
    	      {
    		      var recordSet = this.widgets.dataTable.getRecordSet(), data, i, j;
    		      for (i = 0, j = recordSet.getLength(); i < j; i++)
    		      {
    		    	  record = recordSet.getRecord(i);
    		    	  if (record && record.getData(p_parameter) === p_value)
    		    	  {
    		    		  return record;
    		    	  }
    		      }
    		      return null;
    	      } 
 		  }, true);

          // Override DataTable function to set custom empty message
          var me = this,
             dataTable = this.widgets.alfrescoDataTable.getDataTable(),
             original_doBeforeLoadData = dataTable.doBeforeLoadData;

          dataTable.doBeforeLoadData = function DocumentsForTag_doBeforeLoadData(sRequest, oResponse, oPayload)
          {
             if (oResponse.results.length === 0)
             {
                oResponse.results.unshift(
                {
                   isInfo: true,
                   title: me.msg("empty.title"),
                   description: me.msg("empty.description")
                });
             }

             return original_doBeforeLoadData.apply(this, arguments);
          };

          // Rendering complete event handler
          dataTable.subscribe("renderEvent", function()
          {
             // Register tooltip contexts
             this.widgets.previewTooltip.cfg.setProperty("context", this.previewTooltips);
             this.widgets.metadataTooltip.cfg.setProperty("context", this.metadataTooltips);
          }, this, true);

          // Hook favourite document events
        //Jan using non-global event-class here to support multiple dashlet instances
          var fnFavouriteHandler = function DocumentsForTag_fnFavouriteHandler(layer, args)
          {
             var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
             if (owner !== null)
             {
                me.onFavourite.call(me, args[1].target.offsetParent, owner);
             }
             return true;
          };
          YAHOO.Bubbling.addDefaultAction(this.favoriteEventClass, fnFavouriteHandler);

          // Hook like/unlike events
          //Jan using non-global event-class here to support multiple dashlet instances
          var fnLikesHandler = function DocumentsForTag_fnLikesHandler(layer, args)
          {
             var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
             if (owner !== null)
             {
                me.onLikes.call(me, args[1].target.offsetParent, owner);
             }
             return true;
          };
          YAHOO.Bubbling.addDefaultAction(this.likeEventClass, fnLikesHandler); 
    	  
    	  

         // Detailed/Simple List button
         this.widgets.simpleDetailed = new YAHOO.widget.ButtonGroup(this.id + "-simpleDetailed");
         if (this.widgets.simpleDetailed !== null)
         {
            this.widgets.simpleDetailed.check(this.options.simpleView ? 0 : 1);
            this.widgets.simpleDetailed.on("checkedButtonChange", this.onSimpleDetailed, this.widgets.simpleDetailed, this);
         }
         
         // Preferences service
         this.services.preferences = new Alfresco.service.Preferences();
         
      },
      
      /**
       * Generate base webscript url.
       *
       * @method getWebscriptUrl
       * @override
       */
      getWebscriptUrl: function DocumentsForTag_getWebscriptUrl()
      {
         //return Alfresco.constants.PROXY_URI +"slingshot/doclib/doclist/documents/site/"+Alfresco.constants.SITE+"/documentLibrary?filter=tag";
    	 return Alfresco.constants.URL_SERVICECONTEXT + "components/documentlibrary/data/doclist/all/site/"+Alfresco.constants.SITE+"/documentLibrary?filter=tag&sortAsc=true&sortField=cm%3Aname&view=browse";
      },

      /**
       * Calculate webscript parameters
       *
       * @method getParameters
       * @override
       */
      getParameters: function DocumentsForTag_getParameters()
      {
         return  "filterData="+ this.options.tag;
      },

      /**
       * Show/Hide detailed list buttongroup click handler
       *
       * @method onSimpleDetailed
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onSimpleDetailed: function DocumentsForTag_onSimpleDetailed(e, p_obj)
      {
         this.options.simpleView = e.newValue.index === 0;
         this.services.preferences.set(PREFERENCES_TAG_DASHLET_VIEW, this.options.simpleView);
         if (e)
         {
            Event.preventDefault(e);
         }

         this.reloadDataTable();
      },
      
      /**
       * Thumbnail custom datacell formatter
       *
       * @method renderCellThumbnail
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellThumbnail: function SimpleDocList_renderCellThumbnail(elCell, oRecord, oColumn, oData)
      {
         var columnWidth = 40,
            record = oRecord.getData(),
            desc = "";

         if (record.isInfo)
         {
            columnWidth = 52;
            desc = '<img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/help-docs-bw-32.png" />';
         }
         else
         {
            var name = record.fileName,
               extn = name.substring(name.lastIndexOf(".")),
               locn = record.location,
               nodeRef = new Alfresco.util.NodeRef(record.nodeRef),
               docDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + "site/" + locn.site.name + "/document-details?nodeRef=" + nodeRef.toString(),
               folderDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + "site/" + locn.site.name + "/folder-details?nodeRef=" + nodeRef.toString();

            if (this.options.simpleView)
            {
               /**
                * Simple View
                */
               var id = this.id + '-preview-' + oRecord.getId();
               if (!record.node.isContainer){
	               desc = '<span id="' + id + '" class="icon32"><a href="' + docDetailsUrl + '"><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/filetypes/' + Alfresco.util.getFileIcon(name) + '" alt="' + extn + '" title="' + $html(name) + '" /></a></span>';
	
	               // Preview tooltip
	               this.previewTooltips.push(id);
               }else{
            	   desc = '<span id="' + id + '" class="icon32"><a href="' + folderDetailsUrl + '"><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/documentlibrary/images/folder-32.png" alt="folder" title="' + $html(name) + '" /></a></span>';
               }
            }
            else
            {
               /**
                * Detailed View
                */
               columnWidth = 100;
               if (!record.node.isContainer){
            	   desc = '<span class="thumbnail"><a href="' + docDetailsUrl + '"><img src="' + Alfresco.constants.PROXY_URI + 'api/node/' + nodeRef.uri + '/content/thumbnails/doclib?c=queue&ph=true" alt="' + extn + '" title="' + $html(name) + '" /></a></span>';
               }else{
            	   desc = '<span class="thumbnail"><a href="' + folderDetailsUrl + '"><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/documentlibrary/images/folder-64.png" alt="folder" title="' + $html(name) + '" /></a></span>';
               }
            }
         }

         oColumn.width = columnWidth;

         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         elCell.innerHTML = desc;
      },
     
      /**
       * Detail custom datacell formatter
       *
       * @method renderCellDetail
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellDetail: function DocumentsForTag_renderCellDetail(elCell, oRecord, oColumn, oData)
      {
    	 //JAN: overring method, because we've to use non-global event class (favourite & likes) 
         var record = oRecord.getData(),
            desc = "";

         if (record.isInfo)
         {
            desc += '<div class="empty"><h3>' + record.title + '</h3>';
            desc += '<span>' + record.description + '</span></div>';
         }
         else
         {
            var id = this.id + '-metadata-' + oRecord.getId(),
               version = "",
               description = '<span class="faded">' + this.msg("details.description.none") + '</span>',
               dateLine = "",
               canComment = record.node.permissions.user.CreateChildren,
               locn = record.location,
               nodeRef = (record.workingCopy ? new Alfresco.util.NodeRef(record.workingCopy.sourceNodeRef): new Alfresco.util.NodeRef(record.nodeRef) ),
               docDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + "site/" + locn.site.name + "/document-details?nodeRef=" + nodeRef.toString(),
               folderPathUrl = Alfresco.util.siteURL("documentlibrary" + "?path=" + encodeURIComponent( Alfresco.util.combinePaths(record.location.path, record.location.file)),{site: locn.site.name});

            // Description non-blank?
            if (record.node.properties["cm:description"] && record.node.properties["cm:description"] !== "")
            {
               description = $links($html(record.node.properties["cm:description"]));
            }

            // Version display
            if (!record.node.isContainer && record.version && record.version !== "")
            {
               version = '<span class="document-version">' + $html((record.workingCopy ? record.workingCopy.workingCopyVersion : record.version)) + '</span>';
            }
            
            // Date line
            var dateI18N = "modified", dateProperty = record.node.properties["cm:modified"].iso8601;
            if (record.workingCopy)
            {
            	dateI18N = "editing-started";
            }
            else if (record.node.properties["cm:modified"].iso8601 === record.node.properties["cm:created"].iso8601)
            {
            	dateI18N = "created";
            	dateProperty = record.node.properties["cm:created"].iso8601;
            }
            if (Alfresco.constants.SITE === "")
            {
            	dateLine = this.msg("details." + dateI18N + "-in-site", $relTime(dateProperty), $siteDashboard(locn.site.name, locn.siteTitle, 'class="site-link theme-color-1" id="' + id + '"'));
            }
            else
            {
            	dateLine = this.msg("details." + dateI18N + "-by", $relTime(dateProperty), $userProfile(record.node.properties["cm:modifier"].userName, YAHOO.lang.trim(record.node.properties["cm:modifier"].firstName + " " + record.node.properties["cm:modifier"].lastName), 'class="theme-color-1"'));
            } 

            if (this.options.simpleView)
            {
               /**
                * Simple View
                */
               desc += '<h3 class="filename simple-view"><a class="theme-color-1" href="' +  (record.node.isContainer ? folderPathUrl : docDetailsUrl) + '">' + $html(record.displayName) + '</a></h3>';
            	
               desc += '<div class="detail"><span class="item-simple">' + dateLine + '</span></div>';
            }
            else
            {
               /**
                * Detailed View
                */
              	
               desc += '<h3 class="filename"><a class="theme-color-1" href="' + (record.node.isContainer ? folderPathUrl : docDetailsUrl) + '">' + $html(record.displayName) + '</a>' + version + '</h3>';

               desc += '<div class="detail">';
               desc +=    '<span class="item">' + dateLine + '</span>';
               if (this.options.showFileSize && !record.node.isContainer)
               {
                  desc +=    '<span class="item">' + Alfresco.util.formatFileSize(record.node.size) + '</span>';
               }
               desc += '</div>';
               desc += '<div class="detail"><span class="item">' + description + '</span></div>';

               /* Favourite / Likes / Comments */
               desc += '<div class="detail detail-social">';
               desc +=    '<span class="item item-social">' + this.generateFavourite(this, oRecord) + '</span>';
               desc +=    '<span class="item item-social item-separator">' + this.generateLikes(this, oRecord) + '</span>';
               if (canComment)
               {
                  desc +=    '<span class="item item-social item-separator">' + this.generateComments(this, oRecord) + '</span>';
               }
               desc += '</div>';
            }
            
            // Metadata tooltip
            this.metadataTooltips.push(id);
         }

         elCell.innerHTML = desc;
      },
      
      /**
       * Generate "Favourite" UI
       *
       * @method generateFavourite
       * @param scope {object} DocumentLibrary instance
       * @param record {object} DataTable record
       * @return {string} HTML mark-up for Favourite UI
       */
      generateFavourite : function DocumentsForTag_generateFavourite(scope, record)
      {
         var i18n = "favourite." + (record.getData("isFolder") ? "folder." : "document."),
            html = "";

         if (record.getData("isFavourite"))
         {
            html = '<a class="favourite-action ' + this.favoriteEventClass + ' enabled" title="' + scope.msg(i18n + "remove.tip") + '" tabindex="0"></a>';
         }
         else
         {
            html = '<a class="favourite-action ' + this.favoriteEventClass + '" title="' + scope.msg(i18n + "add.tip") + '" tabindex="0">' + scope.msg(i18n + "add.label") + '</a>';
         }

         return html;
      },

      /**
       * Generate "Likes" UI
       *
       * @method generateLikes
       * @param scope {object} DocumentLibrary instance
       * @param record {object} DataTable record
       * @return {string} HTML mark-up for Likes UI
       */
      generateLikes : function DocumentsForTag_generateLikes(scope, record)
      {
         var likes = record.getData("likes"),
            i18n = "like." + (record.getData("isFolder") ? "folder." : "document."),
            html = "";

         if (likes.isLiked)
         {
            html = '<a class="like-action ' + this.likeEventClass + ' enabled" title="' + scope.msg(i18n + "remove.tip") + '" tabindex="0"></a>';
         }
         else
         {
            html = '<a class="like-action ' + this.likeEventClass + '" title="' + scope.msg(i18n + "add.tip") + '" tabindex="0">' + scope.msg(i18n + "add.label") + '</a>';
         }

         html += '<span class="likes-count">' + $html(likes.totalLikes) + '</span>';

         return html;
      },
      
      /**
       * Like/Unlike event handler
       *
       * @method onLikes
       * @param row {HTMLElement} DOM reference to a TR element (or child thereof)
       */
      onLikes: function SimpleDocList_onLikes(row)
      {
         var file = this.widgets.alfrescoDataTable.getData(row),
            nodeRef = new Alfresco.util.NodeRef(file.nodeRef),
            likes = file.likes;

         likes.isLiked = !likes.isLiked;
         likes.totalLikes += (likes.isLiked ? 1 : -1);

         var responseConfig =
         {
            successCallback:
            {
               fn: function SimpleDocList_onLikes_success(event, p_nodeRef)
               {
                  var data = event.json.data;
                  if (data)
                  {
                     // Update the record with the server's value
                     var record = this.widgets.alfrescoDataTable.findRecordByParameter("nodeRef", p_nodeRef),
                        file = record.getData(),
                        likes = file.likes;

                     likes.totalLikes = data.ratingsCount;
                     this.widgets.alfrescoDataTable.getDataTable().updateRow(record, file);

                     // Post to the Activities Service on the "Like" action
                     if (likes.isLiked)
                     {
                        var activityData =
                        {
                           nodeRef: file.nodeRef
                        };
                        Alfresco.Share.postActivity(this.options.siteId, "file-liked", file.fileName, "document-details", activityData);
                     }
                  }
               },
               scope: this,
               obj: nodeRef.toString()
            },
            failureCallback:
            {
               fn: function SimpleDocList_onLikes_failure(event, p_nodeRef)
               {
                  // Reset the flag to it's previous state
                  var record = this.widgets.alfrescoDataTable.findRecordByParameter("nodeRef", p_nodeRef),
                     file = record.getData(),
                     likes = file.likes;

                  likes.isLiked = !likes.isLiked;
                  likes.totalLikes += (likes.isLiked ? 1 : -1);
                  this.widgets.alfrescoDataTable.getDataTable().updateRow(record, file);
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     text: this.msg("message.save.failure", file.displayName)
                  });
               },
               scope: this,
               obj: nodeRef.toString()
            }
         };

         if (likes.isLiked)
         {
            this.services.likes.set(nodeRef, 1, responseConfig);
         }
         else
         {
            this.services.likes.remove(nodeRef, responseConfig);
         }
         //JAN: we don't need that line... this.widgets.alfrescoDataTable.getDataTable().updateRow(record, file);
      },
      /**
       * Generate "Comments" UI
       *
       * @method generateComments
       * @param scope {object} DocumentLibrary instance
       * @param record {object} DataTable record
       * @return {string} HTML mark-up for Comments UI
       */
      generateComments : function DocumentsForTag_generateComments(scope, record)
      {
          var file = record.getData(),
             url = Alfresco.constants.URL_PAGECONTEXT + "site/" + file.location.site.name + "/" + (file.node.isContainer ? "folder" : "document") + "-details?nodeRef=" + file.nodeRef + "#comment",
             i18n = "comment." + (file.node.isContainer ? "folder." : "document.");

          return '<a href="' + url + '" class="comment" title="' + scope.msg(i18n + "tip") + '" tabindex="0">' + scope.msg(i18n + "label") + '</a>';
      },
            
      /**
       * Called when the user clicks the config dashlet link.
       * Will open a dashlet config dialog
       *
       * @method onConfigDashletClick
       * @param e The click event
       */
      onConfigDashletClick: function DocumentsForTag_onConfigDashletClick(e)
      {
         Event.stopEvent(e);
         
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/documentsForTag/config/" + encodeURIComponent(this.options.componentId);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/documentsForTag/config?tag=" + this.options.tag,
               onSuccess:
               {
                  fn: function DocumentsForTag_onConfigDashlet_callback(response)
                  {
                	  var obj = response.json; 
                	  this.options.title =  obj ? obj.title : this.options.title; 
                	  Dom.get(this.id + "-title").innerHTML = this.options.title;
                	  
                	  this.options.tag =  obj  ? obj.tag : this.options.tag; 
                	  this.options.rowsPerPage =  obj ? obj.rowsPerPage : this.options.rowsPerPage;
                	  this.widgets.alfrescoDataTable.config.paginator.config.rowsPerPage=this.options.rowsPerPage;
                	  //reload Datatable
                	  this.widgets.alfrescoDataTable.reloadDataTable();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function DocumentsForTag_doSetupForm_callback(form)
                  {
                	 /*
                	  * set form validation: 
                	  * title: mandatory
                	  * tag: mandatory
                	  * rowsPerPage: mandatory & positive integer
                	  */
                	 form.addValidation(this.configDialog.id + "-tagpicker-hidden", Alfresco.forms.validation.mandatory, null, "blur"); 
                     form.addValidation(this.configDialog.id + "-title", Alfresco.forms.validation.mandatory, null, "keyup");
                     form.addValidation(this.configDialog.id + "-rowsPerPage", Alfresco.forms.validation.mandatory, null, "keyup");
                     form.addValidation(this.configDialog.id + "-rowsPerPage", Alfresco.forms.validation.regexMatch, {pattern: /^\d+$/, match:true}, "keyup", this.msg("message.validation.rowsPerPage"));
                     form.setShowSubmitStateDynamically(true, false);
                     Dom.get(this.configDialog.id + "-title").value = this.options.title;
                     Dom.get(this.configDialog.id + "-rowsPerPage").value = this.options.rowsPerPage;
                     
                  },
                  scope: this
               }
            });
         }
         
         //augment configDialog to support mandatoryControlValueUpdated bubble event fired by dashlet-configure-object-finder
         YAHOO.lang.augmentObject(this.configDialog,
		 {
        	 onMandatoryControlValueUpdated: function FormUI_onMandatoryControlValueUpdated(layer, args)
             {
        		 this.form.updateSubmitElements();
             }
		 }, true);
         YAHOO.Bubbling.on("mandatoryControlValueUpdated", this.configDialog.onMandatoryControlValueUpdated,  this.configDialog);
         
         
         this.configDialog.setOptions(
         {
            actionUrl: actionUrl
         }).show();
      }
     
   });
})();
