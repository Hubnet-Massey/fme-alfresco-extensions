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
   var $html = Alfresco.util.encodeHTML;

   Alfresco.module.DevTools = function(htmlId)
   {
      return Alfresco.module.DevTools.superclass.constructor.call(this, "Alfresco.module.DevTools", htmlId, ["button", "menu", "container"]);
   };

   YAHOO.extend(Alfresco.module.DevTools, Alfresco.component.Base,
   {
      /**
       * Fired by YUI when parent element is available for scripting.
       *
       * @method onReady
       */
      onReady: function DevTools_onReady()
      {
          var container = YAHOO.util.Selector.query(".header .app-items")[0];
          var menu = ([ 
          	      { text : "Refresh Repository Webscripts", classname: "refresh-menuitem", onclick : { fn: this.onRefreshRepoWebscripts, scope: this } },
          	      { text : "Refresh Share Webscripts", classname: "refresh-menuitem", onclick : { fn: this.onRefreshShareWebscripts, scope: this } },
          	      { text : "Refresh Share All (WS, Templates, Config)", classname: "refresh-menuitem", onclick : { fn: this.onRefreshAllShare, scope: this } },
          	      { text : "Toggle Surfbug", classname: "surfbug-menuitem", onclick : { fn: this.onSurfBug, scope: this } },
          	      { text : "Toggle Repository Debugger", classname: "debugger-menuitem", onclick : { fn: this.onRepoDebugger, scope: this } },
          	      { text : "Toggle Share Debugger", classname: "debugger-menuitem", onclick : { fn: this.onShareDebugger, scope: this } },
          	      { text : "Share Module Deployment", url : Alfresco.constants.URL_PAGECONTEXT + "modules/deploy", target:"_blank" },
          	      { text : "Javascript Console", classname: "jsconsole-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "console/admin-console/javascript-console" },
          	      { text : "Node Browser", classname: "jsconsole-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "console/admin-console/node-browser" },
          	      
          	      // TODO: get correct URL, maybe open in iframe
          	      { text : "Workflow Console", url : this.options.explorerBaseUrl + "/faces/jsp/admin/workflow-console.jsp", target:"_blank" },

          	      // TODO: check if SOLR is active, get correct URL, maybe open in iframe        	      
          	      { text : "Solr Admin Console", url : this.options.solrAdminUrl, target:"_blank" },
          	      
          	      // TODO: check if lucene is active, get correct URL, maybe open in iframe        	      
          	      { text : "Lucene Index Check", url : this.options.explorerBaseUrl + "/service/enterprise/admin/indexcheck", target:"_blank" }
          	       
          	      // TODO: Open Explorer (in IFrame)
          	      // TODO: Toggle Minification. How to change the config dynamically?
          	 ]);
          
          this.widgets.devtoolsButton = new YAHOO.widget.Button(
                   { id: container.id+"-devtools",
                     type: "menu",
                      label: "Devtools",
                      menu: menu,
                      lazyloadmenu: true, 
                      container: container.id
                   });      	  
          this.widgets.devtoolsButton.addClass("devtools-menu");
      },
            
      onRepoDebugger : function DevTools_onRepoDebugger() {
    	  this.toggleDebugger(Alfresco.constants.PROXY_URI);
      },
      
      onShareDebugger : function DevTools_onShareDebugger() {
    	  this.toggleDebugger(Alfresco.constants.URL_PAGECONTEXT);
      },
      
      toggleDebugger : function DevTools_toggleDebugger(baseUrl) {
    	  var debuggerUrl = baseUrl + "api/javascript/debugger";
    	  
    	  // retrieve the current state of the debugger. 
    	  Alfresco.util.Ajax.jsonGet({ 
    		  url : debuggerUrl,
    		  successCallback : {
    			  fn : function(result) {
    				  
    				  var debuggerState = result.serverResponse.responseText.match(/name=\"visible\" value=\"([^"]+)/);
    				  if (debuggerState.length == 2) {
    					  
    					  // which parameter do we need to post, to enable the debugger?
    					  var state = debuggerState[1];
    					  
    					  Alfresco.util.Ajax.jsonPost({ 
    			    		  url : debuggerUrl + "?visible=" + state,
    			    	  });      
    				  }
    			  },
    			  scope : this
    		  }
    	  });    	  
      },
      
      onSurfBug : function DevTools_onSurfBug() {
          var newMode = (window.SurfBug != undefined) ? "disabled" : "enabled";
    	  
    	  Alfresco.util.Ajax.jsonPost({ 
    		  url : Alfresco.constants.URL_PAGECONTEXT + "surfBugStatus?statusUpdate=" + newMode,
    		  successCallback : {
    			  fn : function(result) {
    		    	  window.location.reload();
    			  },
    			  scope : this
    		  }
    	  });
      },
      
      onRefreshRepoWebscripts : function DevTools_onRefreshRepoWebscripts() {
    	  Alfresco.util.PopupManager.displayMessage({ text : "Starting Repository Webscript refresh..."});
    	  Alfresco.util.Ajax.jsonPost({ 
    		  url : Alfresco.constants.PROXY_URI + "index?reset=on",
    		  successCallback : {
    			  fn : function(result) {
    				  var info = result.serverResponse.responseText.match(/Reset Web Scripts[^\<]+/)[0];
    		    	  Alfresco.util.PopupManager.displayMessage({ text : info});
    			  },
    			  scope : this
    		  }
    	  });
      },
      
      onRefreshShareWebscripts : function DevTools_onRefreshShareWebscripts() {
    	  Alfresco.util.PopupManager.displayMessage({ text : "Starting Share Webscript refresh..."});
    	  Alfresco.util.Ajax.jsonPost({ 
    		  url : Alfresco.constants.URL_PAGECONTEXT + "index?reset=on",
    		  successCallback : {
    			  fn : function(result) {
    				  var info = result.serverResponse.responseText.match(/Reset Web Scripts[^\<]+/)[0];
    		    	  Alfresco.util.PopupManager.displayMessage({ text : info});
    			  },
    			  scope : this
    		  }
    	  });
      },

      onRefreshAllShare : function DevTools_onRefreshAllShare() {
    	  Alfresco.util.PopupManager.displayMessage({ text : "Starting refresh of Share Webscripts, Templates and Config..."});
    	  Alfresco.util.Ajax.jsonPost({
    		  url : Alfresco.constants.URL_PAGECONTEXT + "console?reset=all",
    		  successCallback : {
    			  fn : function(result) {
    		    	  Alfresco.util.PopupManager.displayMessage({ text : "Share webscripts and config were refreshed successfully."});
    			  },
    			  scope : this
    		  }
    	  });
      }

   });
   
})();
