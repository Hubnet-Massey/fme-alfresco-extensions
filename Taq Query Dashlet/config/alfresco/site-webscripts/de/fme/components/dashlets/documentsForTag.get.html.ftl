<#assign id = args.htmlid>
<#assign el=args.htmlid?js_string>
<#assign prefSimpleView = preferences.simpleView!true>

<script type="text/javascript">//<![CDATA[
   var documentForTagDashlet = new FME.dashlet.DocumentsForTag("${el}").setOptions({
   		simpleView: ${prefSimpleView?string?js_string},
   		tag : "${tag}",
   		title : "${title}",
   		alwaysDisplayPaginator : ${alwaysDisplayPaginator?string},
   		rowsPerPage : ${rowsPerPage?string},
   		componentId: "${instance.object.id}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${el}", "${instance.object.id}");
   
   var editDashletEvent = new YAHOO.util.CustomEvent("onDashletConfigure");
   editDashletEvent.subscribe(documentForTagDashlet.onConfigDashletClick, documentForTagDashlet, true);
   new Alfresco.widget.DashletTitleBarActions("${el}").setOptions(
   {
      actions:
      [
      	<#if userIsSiteManager>
         {
            cssClass: "edit",
            eventOnClick: editDashletEvent,
            tooltip: "${msg("dashlet.edit.tooltip")?js_string}"
         },
		</#if>
         {
            cssClass: "help",
            bubbleOnClick:
            {
               message: "${msg("dashlet.help")?js_string}"
            },
            tooltip: "${msg("dashlet.help.tooltip")?js_string}"
         }
      ]
   });
//]]></script>

<div class="dashlet documents-for-tag">
   <div class="title" id="${id}-title">${title!""}</div>
   <div class="toolbar flat-button">
   	  <div id="${id}-paginator-top"></div>
      <div id="${id}-simpleDetailed" class="align-right simple-detailed yui-buttongroup inline">
         <span class="yui-button yui-radio-button simple-view<#if prefSimpleView> yui-button-checked yui-radio-button-checked</#if>">
            <span class="first-child">
               <button type="button" tabindex="0" title="${msg("button.view.simple")}"></button>
            </span>
         </span>
         <span class="yui-button yui-radio-button detailed-view<#if !prefSimpleView> yui-button-checked yui-radio-button-checked</#if>">
            <span class="first-child">
               <button type="button" tabindex="0" title="${msg("button.view.detailed")}"></button>
            </span>
         </span>
      </div>
      
      <div class="clear"></div>
   </div>
   		
   <div id="${id}-documents" class=" body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
   </div>
   
</div>