<#assign idJS=args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
(function()
{
   var galleryPlus = new FME.dashlet.GalleryPlus("${idJS}").setOptions({
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
   		"detailsUrl" : "${url.context}/page/site/${page.url.templateArgs.site!""}/document-details?nodeRef=",
   		"siteId" : "${page.url.templateArgs.site!""}"
   }).setMessages(${messages});
   new Alfresco.widget.DashletResizer("${idJS}", "${instance.object.id}");
   
   /**
    * Create a new custom YUI event and subscribe it to the WebViews onConfigWebViewClick
    * function. This custom event is then passed into the DashletTitleBarActions widget as
    * an eventOnClick action so that it can be fired when the user clicks on the Edit icon
   */
   var editDashletEvent = new YAHOO.util.CustomEvent("onDashletConfigure");
   editDashletEvent.subscribe(galleryPlus.onConfigDashletClick, galleryPlus, true);

   new Alfresco.widget.DashletTitleBarActions("${idJS}").setOptions(
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
   <div id="${el}-list" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div class="dashlet-padding">
         <div id="${el}-wait" class="images-wait"></div>
         <div id="${el}-message" class="images-message hidden"></div>
         <div id="${el}-images" class="images"></div>
      </div>
   </div>
</div> 
