<#assign elJS=args.htmlid?js_string>
<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
(function()
{
   var galleryPlus = new FME.dashlet.GalleryPlus("${elJS}").setOptions({
   		"componentId": "${instance.object.id}",
   		"title" : "${title?html}",
   		"viewmode" : "${viewmode?js_string}",
   		"singleAlbumNodeRef" : "${album?js_string}",
   		"filterPath" : "${filterPath?js_string}",
   		"filterTags" : "${filterTags?js_string}",
   		"sort" : "${sort?js_string}",
   		"sortOrder" : "${sortOrder?js_string}",
   		"pageSize" : "${pageSize?js_string}",
   		"maxImages" : "${maxImages?js_string}",
   		"background" : "${background?js_string}",
   		"thumbName" : "${thumbName?js_string}",
   		"detailsUrl" : "${url.context}/page/site/${page.url.templateArgs.site!""}/document-details?nodeRef=",
   		"siteId" : "${page.url.templateArgs.site!""}"
   }).setMessages(${messages});
})();
//]]></script>

<div class="fme-gallery-dashlet" style="margin-top:1em;">
   <div id="${el}-message" class="images-message hidden"></div>
   <div id="${el}-images" class="images"></div>
</div> 
