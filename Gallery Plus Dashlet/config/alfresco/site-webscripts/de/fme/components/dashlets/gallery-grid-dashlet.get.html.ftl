<#assign idJS=args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
(function()
{
   new FME.dashlet.GalleryPlus("${idJS}").setOptions({
   		"componentId": "${instance.object.id}",
   		"title" : "${title}",
   		"viewmode" : "${viewmode!'images'}",
   		"singleAlbumNodeRef" : "${singleAlbumNodeRef!''}",
   		"filterPath" : "${filterPath!''}",
   		"filterTags" : "${filterTags!''}",
   		"sort" : "${sort!'cm:name'}",
   		"sortOrder" : "${sortOrder!'asc'}",
   		"pageSize" : "${pageSize!'50'}",
   		"maxImages" : "${maxImages!'100'}",
   		"background" : "${background!''}",
   		"thumbName" : "${thumbName}",
   	<#if page.url.templateArgs.site?exists>
   		"detailsUrl" : "${url.context}/page/site/${page.url.templateArgs.site!""}/document-details?nodeRef=",
	<#else>
   		"detailsUrl" : "${url.context}/page/document-details?nodeRef=",
   	</#if>
   }).setMessages(${messages});
   new Alfresco.widget.DashletResizer("${idJS}", "${instance.object.id}");
})();
//]]></script>
<#assign el=args.htmlid?html>
<div class="dashlet fme-gallery-dashlet">

   <div class="title" id="${el}-title">
		<span id="${el}-title-text">${title!""}</span>
   		<div class="title-toolbar">
	       <a href="#" id="${el}-back-to-albums" class="theme-color-1">${msg("label.backToAlbums")}</a>
   		</div>
   </div>
    <#if userIsSiteManager>
	   <div class="toolbar">
	       <a href="#" id="${el}-config-link" class="theme-color-1">${msg("label.configure")}</a>
	   </div>
	</#if>
	
   <div id="${el}-list" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div class="dashlet-padding">
         <div id="${el}-wait" class="images-wait"></div>
         <div id="${el}-message" class="images-message hidden"></div>
         <div id="${el}-images" class="images"></div>
      </div>
   </div>
</div> 
