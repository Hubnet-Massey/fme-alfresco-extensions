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
          var menuItems = ([[ 
              	      { text : "Refresh Repository Webscripts", classname: "refresh-menuitem", onclick : { fn: this.onRefreshRepoWebscripts, scope: this } },
              	      { text : "Refresh Share Webscripts", classname: "refresh-menuitem", onclick : { fn: this.onRefreshShareWebscripts, scope: this } },
              	      { text : "Refresh Share All (WS, Templates, Config)", classname: "refresh-menuitem", onclick : { fn: this.onRefreshAllShare, scope: this } },
              	      { text : "Navigate Repository Webscripts", classname: "explorer-menuitem", url : this.options.explorerBaseUrl+ "/service/index", target:"_blank"},
              	      { text : "Navigate Share Webscripts", classname: "explorer-menuitem", url : Alfresco.constants.URL_SERVICECONTEXT+ "index", target:"_blank"}
          	      ],[
              	      { text : "Toggle Surfbug", classname: "surfbug-menuitem", onclick : { fn: this.onSurfBug, scope: this } },
              	      { text : "Toggle Repository Debugger", classname: "debugger-menuitem", onclick : { fn: this.onRepoDebugger, scope: this } },
              	      { text : "Toggle Share Debugger", classname: "debugger-menuitem", onclick : { fn: this.onShareDebugger, scope: this } },
              	      { text : "Share Module Deployment", classname: "general-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "modules/deploy", target:"_blank" },
              	      { text : "Javascript Console", classname: "jsconsole-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "console/admin-console/javascript-console"},
              	      { text : "Share Node Browser", classname: "jsconsole-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "console/admin-console/node-browser"},
              	      { text : "Repository Node Browser", classname: "jsconsole-menuitem", url : this.options.explorerBaseUrl + "/faces/jsp/admin/node-browser.jsp", target:"_blank"}
          	      ],[
          	      
              	      { text : "Activiti Workflow Console", classname:"activiti-menuitem", url : Alfresco.constants.URL_CONTEXT + "proxy/activiti-admin", target:"_blank" },          	      
              	      { text : "Repository Workflow Console",  classname: "general-menuitem", url : this.options.explorerBaseUrl + "/faces/jsp/admin/workflow-console.jsp", target:"_blank" },
              	      { text : "Repository Admin Console", classname: "general-menuitem", url : this.options.explorerBaseUrl + "/faces/jsp/admin/repoadmin-console.jsp", target:"_blank" }
          	      ],[
          	            	      
              	      { text : "Solr Admin Console", classname: "solr-menuitem", url : this.options.solrAdminUrl, target:"_blank" },
              	      {	text : "Solr Queries",  classname: "general-menuitem",
              	  	                submenu: {  
              	  	                            id: "solr_queries",  
              	  	                            itemdata: [ 
              	  	                                { text: "Summary Report", url: this.options.solrUrl + "cores?action=SUMMARY&wt=xml", target:"_blank", classname: "general-menuitem"}, 
              	  	                                { text: "Overall Status Report", url: this.options.solrUrl + "cores?action=REPORT&wt=xml", target:"_blank", classname: "general-menuitem"}, 
              	  	                                { text: "Index Status", url: this.options.solrUrl+"cores?action=STATUS&wt=xml", target:"_blank", classname: "general-menuitem"}, 
              	  	                                { text: "Cache Check", url: this.options.solrUrl+"cores?action=CHECK", target:"_blank", classname: "general-menuitem"}, 
              	  	                                { text: "General fix", url: this.options.solrUrl+"cores?action=FIX", target:"_blank", classname: "general-menuitem"}, 
              	  	                                { text: "Try to reindex any failed node", url: this.options.solrUrl+"cores?action=RETRY", target:"_blank", classname: "general-menuitem"}, 
              	  	                                { text: "Show Log4j setting", url: this.options.solrUrl+"cores?action=LOG4J", target:"_blank", classname: "general-menuitem"} 
              	  	                            ]  
              	  	                        } 
              	      },
              	      { text : "Lucene Index Check", url : this.options.explorerBaseUrl + "/service/enterprise/admin/indexcheck", target:"_blank", classname: "general-menuitem"}
              	      ],[
          	      { text : "Useful repo webscripts", classname: "general-menuitem", 
          	    	  	submenu: {  
          	    	  			id: "documentation_links",  
          	    	  			itemdata: [ 
          	    	  			           { text: "mimetype descriptions", url: this.options.explorerBaseUrl+"/service/api/mimetypes/descriptions", target:"_blank", classname: "general-menuitem"},
          	    	  			           { text: "Registered mimetypes with transformation", url: this.options.explorerBaseUrl+"service/mimetypes", target:"_blank", classname: "general-menuitem"},
          	    	  			           { text: "Dictionary (all types and aspects as json)", url: this.options.explorerBaseUrl+"/service/api/dictionary", target:"_blank", classname: "general-menuitem"}
          	    	  		    ]  
          	    	  	} 
          	       },
          	       { text : "Documentation Links",  classname: "general-menuitem",
                       submenu: {  
                               id: "documentation_links",  
                               itemdata: [ 
                                          { text: "Alfresco and SOLR", url: "http://wiki.alfresco.com/wiki/Alfresco_And_SOLR", target:"_blank", classname: "general-menuitem"}
                               ]  
                       } 
          	       }
          	 ]]);
          
          var devtoolsMenu= new YAHOO.widget.Menu("devtoolsMenu", { autosubmenudisplay:true }); 
          devtoolsMenu.addItems(menuItems);
          devtoolsMenu.render(YAHOO.util.Dom.get(this.id));
//          devtoolsMenu.render(container);
          
          
          this.widgets.devtoolsButton = new YAHOO.widget.Button(
                   { id: container.id+"-devtools",
                     type: "menu",
                     label: "Devtools",
                     menu: devtoolsMenu,
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
