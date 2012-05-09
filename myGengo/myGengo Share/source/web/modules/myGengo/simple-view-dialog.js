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
 * SimpleViewDialog module.
 * 
 * @namespace MyGengo.module
 * @class MyGengo.module.SimpleViewDialog
 */
if (typeof MyGengo == "undefined") MyGengo={};
if (typeof MyGengo.module == "undefined") MyGengo.module={};

(function()
{
   var Dom = YAHOO.util.Dom,
      Selector = YAHOO.util.Selector,
      KeyListener = YAHOO.util.KeyListener;
   
   MyGengo.module.SimpleViewDialog = function(htmlId, components)
   {
      components = YAHOO.lang.isArray(components) ? components : [];
      
      return MyGengo.module.SimpleViewDialog.superclass.constructor.call(
         this,
         "MyGengo.module.SimpleViewDialog",
         htmlId,
         ["button", "container", "connection", "json", "selector"].concat(components));
   };

   YAHOO.extend(MyGengo.module.SimpleViewDialog, Alfresco.component.Base,
   {
      /**
       * Dialog instance.
       * 
       * @property dialog
       * @type YAHOO.widget.Panel
       */
      dialog: null,

       /**
        * Object container for initialization options
        */
       options:
       {
          /**
           * URL which will return template body HTML
           *
           * @property templateUrl
           * @type string
           * @default null
           */
          templateUrl: null,

          /**
           * Width for the dialog
           *
           * @property width
           * @type integer
           * @default 30em
           */
          width: "30em",
          
          
          /**
           * Destroy the dialog instead of hiding it?
           *
           * @property destroyOnHide
           * @type boolean
           * @default false
           */
          destroyOnHide: false,
          
          /**
           * Object literal representing function to intercept dialog just before shown.
           *   fn: function(formsRuntime, Alfresco.module.SimpleDialog), // The handler to call when the event fires.
           *   obj: object, // An object to pass back to the handler.
           *   scope: object // The object to use for the scope of the handler. SimpleDialog instance if unset.
           *
           * @property doBeforeDialogShow
           * @type object
           * @default null
           */
          doBeforeDialogShow:
          {
             fn: null,
             obj: null,
             scope: null
          }
       },

      /**
       * Main entrypoint to show the dialog
       *
       * @method show
       */
      show: function AmSVD_show()
      {
         if (this.dialog)
         {
            this._showDialog();
         }
         else
         {
            var data =
            {
               htmlid: this.id
            };
            if (this.options.templateRequestParams)
            {
                data = YAHOO.lang.merge(this.options.templateRequestParams, data);
            }
            Alfresco.util.Ajax.request(
            {
               url: this.options.templateUrl,
               dataObj:data,
               successCallback:
               {
                  fn: this.onTemplateLoaded,
                  scope: this
               },
               failureMessage: "Could not load dialog template from '" + this.options.templateUrl + "'.",
               scope: this,
               execScripts: true
            });
         }
         return this;
      },
      
      /**
       * Show the dialog and set focus to the first text field
       *
       * @method _showDialog
       * @private
       */
      _showDialog: function AmSVD__showDialog()
      {
    	  // Custom before show event interest registered?
    	  var doBeforeDialogShow = this.options.doBeforeDialogShow;
    	  if (doBeforeDialogShow && typeof doBeforeDialogShow.fn == "function")
    	  {
    		  doBeforeDialogShow.fn.call(doBeforeDialogShow.scope || this, this.form, this, doBeforeDialogShow.obj);
    	  }

    	  this.dialog.show();

    	  // Register the ESC key to close the dialog
    	  this.widgets.escapeListener = new KeyListener(document,
    			  {
    		  keys: KeyListener.KEY.ESCAPE
    			  },
    			  {
    				  fn: function(id, keyEvent)
    				  {
    					  this._hideDialog();
    				  },
    				  scope: this,
    				  correctScope: true
    			  });
    	  this.widgets.escapeListener.enable();

      },

      /**
       * Hide the dialog
       *
       * @method hide
       */
      hide: function AmSD_hide()
      {
         this.widgets.escapeListener.disable();
         this._hideDialog();
      },


      /**
       * Hide the dialog, removing the caret-fix patch
       *
       * @method _hideDialog
       * @private
       */
      _hideDialog: function AmSD__hideDialog()
      {
         
         this.dialog.hide();
         if (this.options.destroyOnHide)
         {
            YAHOO.Bubbling.fire("formContainerDestroyed");
            this.dialog.destroy();
            delete this.dialog;
            delete this.widgets;
         }
      },
      
      /**
       * Event callback when dialog template has been loaded
       *
       * @method onTemplateLoaded
       * @param response {object} Server response from load template XHR request
       */
      onTemplateLoaded: function AmSVD_onTemplateLoaded(response)
      {
         // Inject the template from the XHR request into a new DIV element
         var containerDiv = document.createElement("div");
         containerDiv.innerHTML = response.serverResponse.responseText;

         // The panel is created from the HTML returned in the XHR request, not the container
         var dialogDiv = Dom.getFirstChild(containerDiv);
         while (dialogDiv && dialogDiv.tagName.toLowerCase() != "div")
         {
            dialogDiv = Dom.getNextSibling(dialogDiv);
         }
        
         // Create and render the YUI dialog
         this.dialog = Alfresco.util.createYUIPanel(dialogDiv,
         {
            width: this.options.width
         });
         Dom.addClass(this.id +"-form-fields", "bd");
         this._showDialog();
      },

      /**
       * Cancel button event handler
       *
       * @method onCancel
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onCancel: function AmSVD_onCancel(e, p_obj)
      {
         this._hideDialog();
      }
   });

   /**
    * Dummy instance to load optional YUI components early.
    * Use fake "null" id, which is tested later in onComponentsLoaded()
   */
   var dummyInstance = new MyGengo.module.SimpleViewDialog("null");
})();
