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
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $links = Alfresco.util.activateLinks;


   /**
    * Dashboard DocumentsForTag constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.DocumentsForTag} The new component instance
    * @constructor
    */
   FME.dashlet.DocumentsForTag = function DocumentsForTag_constructor(htmlId)
   {
      FME.dashlet.DocumentsForTag.superclass.constructor.call(this, "FME.dashlet.DocumentsForTag", htmlId, ["button", "container", "datasource", "datatable", "paginator", "animation"]);
      this.previewTooltips = [];
      this.metadataTooltips = [];
      this.totalRecords = 0;
      this.initialPage = 1;
      
      return this;
   };

   YAHOO.extend(FME.dashlet.DocumentsForTag, Alfresco.component.Base,
   {

      /**
       * Holds IDs to register preview tooltips with.
       * 
       * @property previewTooltips
       * @type array
       */
      previewTooltips: null,

      /**
       * Holds IDs to register metadata tooltips with.
       * 
       * @property metadataTooltips
       * @type array
       */
      metadataTooltips: null,
      
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
          * current site
          *
          * @property site
          * @type string
          * @default ""
          */
         site: "",
         
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
         var me = this;
         
         // Preferences service
         this.services.preferences = new Alfresco.service.Preferences();
         
         // Add click handler to config dashlet link that will be visible if user is site manager.
         var configLink = Dom.get(this.id + "-config-link");
         if (configLink)
         {
            Event.addListener(configLink, "click", this.onConfigDashletClick, this, true);            
         }

         // Tooltip for thumbnail on mouse hover
         this.widgets.previewTooltip = new YAHOO.widget.Tooltip(this.id + "-previewTooltip",
         {
            width: "108px"
         });
         this.widgets.previewTooltip.contextTriggerEvent.subscribe(function(type, args)
         {
            var context = args[0],
               record = me.widgets.dataTable.getRecord(context.id),
               thumbnailUrl = Alfresco.constants.PROXY_URI + "api/node/" + record.getData("nodeRef").replace(":/", "") + "/content/thumbnails/doclib?c=queue&ph=true";
            
            this.cfg.setProperty("text", '<img src="' + thumbnailUrl + '" />');
         });

         // Tooltip for metadata on mouse hover
         this.widgets.metadataTooltip = new YAHOO.widget.Tooltip(this.id + "-metadataTooltip");
         this.widgets.metadataTooltip.contextTriggerEvent.subscribe(function(type, args)
         {
            var context = args[0],
               record = me.widgets.dataTable.getRecord(context.id),
               locn = record.getData("location");
            
            var text ='<em>' + me.msg("label.path") + ':</em> ' + $html(locn.path);
            
            this.cfg.setProperty("text", text);
         });

         // DataSource definition
         var uriDocList = Alfresco.constants.PROXY_URI + "slingshot/doclib/doclist/documents/site/"+this.options.site+"/documentLibrary?filter=tag";
         
         this.widgets.dataSource = new YAHOO.util.DataSource(uriDocList,
         {
            responseType: YAHOO.util.DataSource.TYPE_JSON,
            connXhrMode:  "queueRequests",
            responseSchema:
            {
               resultsList: "items",
               metaFields:
               {
                  paginationRecordOffset: "startIndex",
                  totalRecords: "totalRecords"
               }
            }
         });
         
         /**
          * Favourite Documents custom datacell formatter
          */
         var favEventClass = Alfresco.util.generateDomId(null, "fav-doc");
         var renderCellFavourite = function DocumentsForTag_renderCellFavourite(elCell, oRecord, oColumn, oData)
         {
            var nodeRef = oRecord.getData("nodeRef"),
               isFavourite = oRecord.getData("isFavourite");

            Dom.setStyle(elCell, "width", oColumn.width + "px");
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

            elCell.innerHTML = '<a class="favourite-document ' + favEventClass + (isFavourite ? ' enabled' : '') + '" title="' + me.msg("tip.favourite-document." + (isFavourite ? 'remove' : 'add')) + '">&nbsp;</a>';
         };

         /**
          * Thumbnail custom datacell formatter
          */
         var renderCellThumbnail = function DocumentsForTag_renderCellThumbnail(elCell, oRecord, oColumn, oData)
         {
            var name = oRecord.getData("fileName"),
               title = oRecord.getData("title"),
               type = oRecord.getData("type"),
               locn = oRecord.getData("location"),
               extn = name.substring(name.lastIndexOf("."));

            Dom.setStyle(elCell, "width", oColumn.width + "px");
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

            var id = me.id + '-preview-' + oRecord.getId(),
               docDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + "site/" + locn.site + "/document-details?nodeRef=" + oRecord.getData("nodeRef");
            
            elCell.innerHTML = '<span id="' + id + '" class="icon32"><a href="' + docDetailsUrl + '"><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/filetypes/' + Alfresco.util.getFileIcon(name) + '" alt="' + extn + '" title="' + $html(title) + '" /></a></span>';
                  
            // Preview tooltip
            me.previewTooltips.push(id);
         };

         /**
          * Description/detail custom datacell formatter
          *
          * @method renderCellDescription
          * @param elCell {object}
          * @param oRecord {object}
          * @param oColumn {object}
          * @param oData {object|string}
          */
         var renderCellDescription = function DocumentsForTag_renderCellDescription(elCell, oRecord, oColumn, oData)
         {
            var type = oRecord.getData("type"),
               locn = oRecord.getData("location");
            
            var id = me.id + '-metadata-' + oRecord.getId(),
               docDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + "site/" + locn.site + "/document-details?nodeRef=" + oRecord.getData("nodeRef");
                
            var desc = '<span id="' + id + '"><a class="theme-color-1" href="' + docDetailsUrl + '">' + $html(oRecord.getData("displayName")) + '</a></span>';
            desc += '<div class="detail">' + $links($html(oRecord.getData("description"))) + '</div>';

            elCell.innerHTML = desc;

            // Metadata tooltip
            me.metadataTooltips.push(id);
         };

         // DataTable column defintions
         var columnDefinitions =
         [
            { key: "favourite", label: "Favourite", sortable: false, formatter: renderCellFavourite, width: 16 },
            { key: "thumbnail", label: "Thumbnail", sortable: false, formatter: renderCellThumbnail, width: 32 },
            { key: "description", label: "Description", sortable: false, formatter: renderCellDescription }
         ];

         
         // YUI Paginator definition
         this.widgets.paginator = new YAHOO.widget.Paginator(
         {
            rowsPerPage: this.options.rowsPerPage,
            alwaysVisible : this.options.alwaysDisplayPaginator,
            initialPage: this.initialPage,
            template: this.msg("tinyPagination.template"),
            pageReportTemplate: this.msg("tinyPagination.pageReportTemplate"),
            previousPageLinkLabel: this.msg("tinyPagination.previousPageLinkLabel"),
            nextPageLinkLabel: this.msg("tinyPagination.nextPageLinkLabel"),
            firstPageLinkLabel: this.msg("tinyPagination.firstPageLinkLabel"),
            lastPageLinkLabel : this.msg("tinyPagination.lastPageLinkLabel")
         });
         
         // Customize request sent to server to be able to set total # of records
         var generateRequest = function DocumentsForTag_generateRequest(oState, oSelf) {
             // Build custom request
        	 var page = oState && oState.pagination ? oState.pagination.page : me.initialPage;
             return  "&filterData="+ me.options.tag + "&size=" + me.options.rowsPerPage  + "&pos=" + page;
         };
         
         
         // DataTable definition
         this.widgets.dataTable = new YAHOO.widget.DataTable(this.id + "-documents", columnDefinitions, this.widgets.dataSource,
         {
            initialLoad: true,
            generateRequest: generateRequest,
            initialRequest: generateRequest(), // Initial request for first page of data
            dynamicData: true,
            paginator: this.widgets.paginator,
            MSG_EMPTY: this.msg("label.loading")
         });

         // Update totalRecords on the fly with value from server
         this.widgets.dataTable.handleDataReturnPayload = function DocumentsForTag_handleDataReturnPayload(oRequest, oResponse, oPayload)
         {
            me.totalRecords = oResponse.meta.totalRecords;
            return oPayload;
         };
         // Override abstract function within DataTable to set custom error message
         this.widgets.dataTable.doBeforeLoadData = function DocumentsForTag_doBeforeLoadData(sRequest, oResponse, oPayload)
         {
            if (oResponse.error)
            {
               try
               {
                  var response = YAHOO.lang.JSON.parse(oResponse.responseText);
                  me.widgets.dataTable.set("MSG_ERROR", response.message);
               }
               catch(e)
               {
                  me.widgets.dataTable.set("MSG_EMPTY", me.msg("label.empty"));
                  me.widgets.dataTable.set("MSG_ERROR", me.msg("label.error"));
               }
            }
            
            
            // We don't get an renderEvent for an empty recordSet, but we'd like one anyway
            if (oResponse.results.length === 0)
            {
               this.fireEvent("renderEvent",
               {
                  type: "renderEvent"
               });
            }
            
            // Must return true to have the "Loading..." message replaced by the error message
            return true;
         };

         // Rendering complete event handler
         this.widgets.dataTable.subscribe("renderEvent", function()
         {
        	 this.widgets.paginator.setState(
             {                
                totalRecords: this.totalRecords
             });
            this.widgets.paginator.render();
            // Register tooltip contexts
            this.widgets.previewTooltip.cfg.setProperty("context", this.previewTooltips);
            this.widgets.metadataTooltip.cfg.setProperty("context", this.metadataTooltips);
            
            this.widgets.dataTable.set("MSG_EMPTY", this.msg("label.empty"));
         }, this, true);
         
         // Hook favourite document events
         var fnFavouriteHandler = function DocumentsForTag_fnFavouriteHandler(layer, args)
         {
            var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
            if (owner !== null)
            {
               me.onFavouriteDocument.call(me, args[1].target.offsetParent, owner);
            }
      		 
            return true;
         };
         YAHOO.Bubbling.addDefaultAction(favEventClass, fnFavouriteHandler);
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
                	  
                	  //update paginator silently
                	  this.widgets.paginator.setRowsPerPage(this.options.rowsPerPage, true);
                	  
                	  //refresh dataSource using new configs
                	  this.widgets.dataSource.sendRequest("&filterData="+ this.options.tag + "&size=" + this.options.rowsPerPage  + "&pos=" +  this.initialPage,
                	  {
        					success: this.widgets.dataTable.onDataReturnInitializeTable,
        					failure: this.widgets.dataTable.onDataReturnInitializeTable,
        					scope: this.widgets.dataTable
        			  });
                	  
                	  
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
      },
      
      /**
       * Favourite document event handler
       *
       * @method onFavouriteDocument
       * @param row {object} DataTable row representing file to be actioned
       */
      onFavouriteDocument: function DocumentsForTag_onFavouriteDocument(row)
      {
         var record = this.widgets.dataTable.getRecord(row),
            file = record.getData(),
            nodeRef = file.nodeRef,
            undoIndex;
         
         file.isFavourite = !file.isFavourite;
         
         if (this.currentFilter == "favourites")
         {
            undoIndex = record.getData("index");
            this.widgets.dataTable.deleteRow(record);
         }
         else
         {
            this.widgets.dataTable.updateRow(record, file);
         }
               
         var responseConfig =
         {
            failureCallback:
            {
               fn: function DocumentsForTag_oFD_failure(event, obj)
               {
                  // Reset the flag to it's previous state
                  var record = obj.record,
                     file = record.getData();
                  
                  file.isFavourite = !file.isFavourite;
                  if (this.currentFilter == "favourites")
                  {
                     this.widgets.dataTable.addRow(file, obj.undoIndex);
                  }
                  else
                  {
                     this.widgets.dataTable.updateRow(record, file);
                  }
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     text: this.msg("message.favourite.failure", file.displayName)
                  });
               },
               scope: this,
               obj:
               {
                  record: record,
                  undoIndex: undoIndex
               }
            }
         };

         var fnPref = file.isFavourite ? "add" : "remove";
         this.services.preferences[fnPref].call(this.services.preferences, Alfresco.service.Preferences.FAVOURITE_DOCUMENTS, nodeRef, responseConfig);
      }

   });
})();
