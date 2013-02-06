<#assign elJS=args.htmlid?js_string>
<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
(function()
{
   var galleryPlus = new FME.dashlet.GalleryPlus("${elJS}").setOptions({
   		"componentId": "${instance.object.id}",
   		"title" : "${title?html}",
   		"viewmode" : "${viewmode}",
   		"singleAlbumNodeRef" : "${album}",
   		"filterPath" : "${filterPath}",
   		"filterTags" : "${filterTags}",
   		"sort" : "${sort}",
   		"sortOrder" : "${sortOrder}",
   		"pageSize" : "${pageSize}",
   		"maxImages" : "${maxImages}",
   		"background" : "${background}",
   		"thumbName" : "${thumbName}",
   		"detailsUrl" : "${url.context}/page/site/${page.url.templateArgs.site!""}/document-details?nodeRef=",
   		"siteId" : "${page.url.templateArgs.site!""}"
   }).setMessages(${messages});
})();
//]]></script>

<div class="fme-gallery-dashlet" style="margin-top:1em;">
   <div id="${el}-message" class="images-message hidden"></div>
   <div id="${el}-images" class="images"></div>
</div> 
