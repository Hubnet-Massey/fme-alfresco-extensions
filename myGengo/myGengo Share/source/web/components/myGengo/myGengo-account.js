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
 * MyGengo account component.
 * 
 * @namespace MyGengo
 * @class MyGengo.Account
 */
if (typeof MyGengo == "undefined") MyGengo={};

(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      Element = YAHOO.util.Element;
   
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
   	$date = function $date(date, format) { return Alfresco.util.formatDate(Alfresco.util.fromISO8601(date), format); };
   
   /**
    * MyGengo.Toolbar constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {MyGengo.Toolbar} The new Toolbar instance
    * @constructor
    */
   MyGengo.Account = function(htmlId)
   {
      this.name = "MyGengo.Account";
      this.id = htmlId;
      
      /* Register this component */
      Alfresco.util.ComponentManager.register(this);

      this.widgets = {};
      
      /* Load YUI Components */
      Alfresco.util.YUILoaderHelper.require(["button", "container", "datasource", "datatable", "json"], this.onComponentsLoaded, this);
   
      /* Decoupled event listeners */
      YAHOO.Bubbling.on("deactivateAllControls", this.onDeactivateAllControls, this);

      return this;
   };
   /**
    * Extend from Alfresco.component.Base
    */
   YAHOO.extend(MyGengo.Account, Alfresco.component.Base);
  
   
   /**
    * Augment prototype with main class implementation, ensuring overwrite is enabled
    */
   YAHOO.lang.augmentObject(MyGengo.Account.prototype,
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
         siteId: ""
      },

      /**
       * Tells whether an action is currently ongoing.
       * 
       * @property busy
       * @type boolean
       * @see _setBusy/_releaseBusy
       */
      busy: null,
      
      /**
       * Fired by YUI when parent element is available for scripting.
       * Component initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function MyGengoAccount_onReady()
      {  
         Alfresco.util.Ajax.jsonGet(
         {
        	url: Alfresco.constants.PROXY_URI + "api/mygengo/site/" + Alfresco.constants.SITE +"/myGengo",
           	successCallback:
           	{
           		fn: this.onAccountDataLoaded,
           		scope: this
        	},
        	failureMessage: this.msg("message.status.failure")
         });
         
         // Finally show the component body here to prevent UI artifacts on YUI button decoration
         Dom.setStyle(this.id + "-body", "visibility", "visible");
      },
      
      onAccountDataLoaded : function MyGengoAccount_onAccountDataLoaded(response){
    	if (response.json.accountInfo && response.json.accountInfo.loggedIn){
    		Dom.setStyle(this.id + "-mygengo_account", "visibility", "visible");
    		Dom.get(this.id + "-credits").innerHTML = this.msg("acount.label.credits")+ ": " + response.json.accountInfo.credits;
    		Dom.get(this.id + "-creditsSpent").innerHTML = this.msg("acount.label.creditsSpent")+ ": " + response.json.accountInfo.creditsSpent;
    		Dom.get(this.id + "-userSince").innerHTML = this.msg("acount.label.userSince")+ ": " + $date(response.json.accountInfo.userSince, this.msg("date-format.longDate"));
    		
    		 // setup the button
            this.widgets.signOutButton = Alfresco.util.createYUIButton(this, "signoutButton", this.onSignOut);
    	} else{
    		Dom.setStyle(this.id + "-mygengo_account", "visibility", "hidden");
    		// setup the buttons
            this.showPassport(this.onPassportAuthenticationSuccess);
    	}
    	
      },
      
      onAccountDataDeleted : function MyGengoAccount_onAccountDataDeleted(response){
    	  if (response.json.success && response.json.success){
    		  Dom.setStyle(this.id + "-mygengo_account", "visibility", "hidden");
    		  this.showPassport(this.onPassportAuthenticationSuccess);
			  Alfresco.util.PopupManager.displayMessage(
	 	      {
	 	    	 text: this.msg("message.status.deleted"),
	 	    	 displayTime: 2
	 	      });
    	  }
      },
      
      onSignOut: function MygengoAccount_signOut(event, args){
    	  
    	  var me = this;

          Alfresco.util.PopupManager.displayPrompt(
          {
             title: this.msg("message.confirm.signout.title"),
             text: this.msg("message.confirm.signout"),
             buttons: [
             {
                text: this.msg("button.ok"),
                handler: function MygengoAccounT_onSignOut_ok()
                {
                   this.destroy();
                   me._onSignOutConfirm.call(me);
                }
             },
             {
                text: this.msg("button.cancel"),
                handler: function MygengoAccounT_onSignOut_cancel()
                {
                   this.destroy();
                },
                isDefault: true
             }]
          }); 
      },
      
      showPassport: function MyGengoAccount_showPassport(callback){
    	  var appName = "fme-Alfresco-myGengo-" + this.options.siteId; 
    	  var me = this;
    	  var passport = new MyGengoPassport({
		        // Your application name
		        appName: appName,
		        sandbox : false,
		        modal :false,
	
		        // HTML ID to set as the sign-in button
		        button: Dom.get(me.id +'-mygengo_button'),
		        
		        // Choose from 'largeBlue', 'largeWhite', 'smallBlue',
				// 'smallWhite'
		        buttonStyle: 'smallBlue',
		        
		        // Your custom function to run when they're signed in!
		        on_authentication: function(data) {
		        	// show busy message
		        	me._setBusy(me.msg('message.wait.authenticate'));
		            Alfresco.util.Ajax.jsonPost(
		            {
		            	url: Alfresco.constants.PROXY_URI + "api/mygengo/site/" + Alfresco.constants.SITE +"/myGengo",
		            	dataObj:
			        	{
			           		privateKey: data.private_key,
			           		publicKey: data.public_key,
			           		appName: appName
			           	},
		               	successCallback:
		               	{
		               		fn: callback,
		               		scope: me
		            	},
		            	failureCallback:
		               	{
		               		fn: function(){
		               			me._releaseBusy();
		               			Alfresco.util.PopupManager.displayMessage(
		               	        {
		               	            text: me.msg("message.status.failure")
		               	        });		               		 
		               		},
		               		scope: me
		            	}
		            });
		        }
		    });		  
      },
      
      onPassportAuthenticationSuccess: function MyGengoAccount_onPassportAuthenticationSuccess(response){
    	  this.onAccountDataLoaded(response);
    	  Dom.get(this.id +'-mygengo_button').innerHTML="";
    	  Dom.setStyle(this.id +'-mygengo_button', "display", "none");
    	  this._releaseBusy();
      },

      /**
       * Deactivate All Controls event handler
       *
       * @method onDeactivateAllControls
       * @param layer {object} Event fired
       * @param args {array} Event parameters (depends on event type)
       */
      onDeactivateAllControls: function MyGengoAccount_onDeactivateAllControls(layer, args)
      {
         var index, widget, fnDisable = Alfresco.util.disableYUIButton;
         for (index in this.widgets)
         {
            if (this.widgets.hasOwnProperty(index))
            {
               fnDisable(this.widgets[index]);
            }
         }
      },
      
      /**
       * Displays the provided busyMessage but only in case
       * the component isn't busy set.
       * 
       * @return true if the busy state was set, false if the component is already busy
       */
      _setBusy: function MyGengoAccount__setBusy(busyMessage)
      {
         if (this.busy)
         {
            return false;
         }
         this.busy = true;
         this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
         {
            text: busyMessage,
            spanClass: "wait",
            displayTime: 0
         });
         return true;
      },
      
      /**
       * Removes the busy message and marks the component as non-busy
       */
      _releaseBusy: function MyGengoAccount__releaseBusy()
      {
         if (this.busy)
         {
            this.widgets.busyMessage.destroy();
            this.busy = false;
            return true;
         }
         else
         {
            return false;
         }
      },
      

	  _onSignOutConfirm : function MygengoAccount_signOut(event, args) {
		Alfresco.util.Ajax.jsonDelete({
					url : Alfresco.constants.PROXY_URI
							+ "api/mygengo/site/"
							+ Alfresco.constants.SITE
							+ "/myGengo",
					successCallback : {
						fn : this.onAccountDataDeleted,
						scope : this
					},
					failureCallback : {
						fn : function() {
							this._releaseBusy();
							Alfresco.util.PopupManager
									.displayMessage({
										text : this
												.msg("message.status.failure")
									});
						},
						scope : this
					}
				});

	  }
   }, true);
})();