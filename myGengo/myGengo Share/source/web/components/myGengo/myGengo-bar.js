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
 * MyGengo toolbar component.
 * 
 * @namespace MyGengo
 * @class MyGengo.Toolbar
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
   var $html = Alfresco.util.encodeHTML;
   
   /**
    * MyGengo.Toolbar constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {MyGengo.Toolbar} The new Toolbar instance
    * @constructor
    */
   MyGengo.Toolbar = function(htmlId)
   {
      this.name = "MyGengo.Toolbar";
      this.id = htmlId;
      
      /* Register this component */
      Alfresco.util.ComponentManager.register(this);

      this.widgets = {};
      
      /* Load YUI Components */
      Alfresco.util.YUILoaderHelper.require(["button", "container", "json"], this.onComponentsLoaded, this);
   
      /* Decoupled event listeners */
      YAHOO.Bubbling.on("deactivateAllControls", this.onDeactivateAllControls, this);

      return this;
   };
   /**
    * Extend from Alfresco.component.Base
    */
   YAHOO.extend(MyGengo.Toolbar, Alfresco.component.Base);
  
   
   /**
    * Augment prototype with main class implementation, ensuring overwrite is enabled
    */
   YAHOO.lang.augmentObject(MyGengo.Toolbar.prototype,
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
          * flag if there is a valid mygengo login
          * @property loggedIn
          * @type boolean
          */
         loggedIn : false
        
      },

      
      /**
       * Fired by YUI when parent element is available for scripting.
       * Component initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function MyGengoToolbar_onReady()
      {  
         var me = this;
         var pageId = Alfresco.constants.PAGEID.toLowerCase();
         
         // setup the buttons
         this.widgets.acountInfoButton = Alfresco.util.createYUIButton(this, "accountInfoButton", this.onShowAccountInfo);
         this.widgets.jobListButton = Alfresco.util.createYUIButton(this, "jobListButton", this.onShowJobList);
         this.widgets.createJobButton = Alfresco.util.createYUIButton(this, "createJobButton", this.onCreateJob);
         this.widgets.onRefreshJobsButton = Alfresco.util.createYUIButton(this, "refreshJobsButton", this.onRefreshJobs);
         if ( pageId === "mygengo-account" || pageId === "mygengo-create"){
        	 Dom.setStyle(this.id + "-accountInfoButton", "display", "none");
        	 Dom.setStyle(this.id + "-createJobButton", "display", "none");
        	 Dom.setStyle(this.id + "-refreshJobsButton", "display", "none");
         }
         if (pageId === "mygengo" ){
        	 Dom.setStyle(this.id + "-jobListButton", "display", "none");
         }
         if (this.options.userRole !== "SiteManager" && pageId === "mygengo"){
        	 Dom.setStyle(this.id + "-accountInfoButton", "display", "none");
         }
         if (!this.options.loggedIn || (this.options.userRole == "SiteConsumer" || this.options.userRole == "None") && pageId === "mygengo"){
        	 Dom.setStyle(this.id + "-createJobButton", "display", "none");
        	 Dom.setStyle(this.id + "-refreshJobsButton", "display", "none");
         }
         
         // Finally show the component body here to prevent UI artifacts on YUI button decoration
         Dom.setStyle(this.id + "-body", "visibility", "visible");
      },

      
      /**
       * Search event handler
       *
       * @method onShowAccountInfo
       */
      onShowAccountInfo: function MyGengoToolbar_onShowAccountInfo()
      {
    	  var url = Alfresco.constants.URL_PAGECONTEXT + "site/" + this.options.siteId + "/myGengo-account";
          window.location.href = url;
      },
      /**
       * Search event handler
       *
       * @method onShowJobList
       */
      onShowJobList: function MyGengoToolbar_onShowJobList()
      {
    	  var url = Alfresco.constants.URL_PAGECONTEXT + "site/" + this.options.siteId + "/myGengo";
    	  window.location.href = url;
      },
      /**
       * Search event handler
       *
       * @method onShowJobList
       */
      onCreateJob: function MyGengoToolbar_onCreateJob()
      {
    	  var url = Alfresco.constants.URL_PAGECONTEXT + "site/" + this.options.siteId + "/myGengo-create";
    	  window.location.href = url;
      },
     
      /**
       * Search event handler
       *
       * @method onRefreshJobs
       */
      onRefreshJobs: function MyGengoToolbar_onRefreshJobs()
      {
    	  // Fire "refreshJobs" event
	      Bubbling.fire("refreshJobs");
      },
      
      

      /**
       * Deactivate All Controls event handler
       *
       * @method onDeactivateAllControls
       * @param layer {object} Event fired
       * @param args {array} Event parameters (depends on event type)
       */
      onDeactivateAllControls: function SiteMembers_onDeactivateAllControls(layer, args)
      {
         var index, widget, fnDisable = Alfresco.util.disableYUIButton;
         for (index in this.widgets)
         {
            if (this.widgets.hasOwnProperty(index))
            {
               fnDisable(this.widgets[index]);
            }
         }
      }
   }, true);
})();