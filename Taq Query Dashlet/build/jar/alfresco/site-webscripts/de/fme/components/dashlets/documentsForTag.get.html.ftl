<#assign el=args.htmlid?js_string>

<script type="text/javascript">//<![CDATA[
   new FME.dashlet.DocumentsForTag("${el}").setOptions({
   		site : "${page.url.templateArgs.site}",
   		tag : "${tag}",
   		title : "${title}",
   		alwaysDisplayPaginator : ${alwaysDisplayPaginator?string},
   		rowsPerPage : ${rowsPerPage?string},
   		"componentId": "${instance.object.id}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${el}", "${instance.object.id}");
//]]></script>

<div class="dashlet documents-for-tag">
   <div class="title" id="${el}-title">${title!""}</div>
    <#if userIsSiteManager>
	   <div class="toolbar">
	       <a href="#" id="${el}-config-link" class="theme-color-1">${msg("label.configure")}</a>
	   </div>
	</#if>
   <div id="${args.htmlid}-documents" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
   </div>
</div>