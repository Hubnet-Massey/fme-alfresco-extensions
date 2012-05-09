<#assign id = args.htmlid>
<!--[if IE]>
   <iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe> 
<![endif]-->
<input id="yui-history-field" type="hidden" />
<script type="text/javascript">//<![CDATA[
  new MyGengo.JobList("${args.htmlid}").setOptions(
   {
      siteId: "${page.url.templateArgs["site"]!""}",
      userRole: "${userRole!"None"}",
      languages : <#if languages??>${languages}<#else>null</#if>
   }).setMessages(
      ${messages}
   );
//]]></script>
<div id="${id}-body" class="yui-g myGengo-list doclist datagrid">
   
   <div class="heading">${msg("header.myGengo-list")}</div>
   <div id="${id}-paginator-top" class="paginator"></div>
   <div id="${id}-jobs" class="job-list">
   </div>
    <!-- Action Sets -->
   <div style="display:none">
      <!-- Action Set "More..." container -->
      <div id="${args.htmlid}-moreActions">
         <div class="onActionShowMore"><a href="#" class="show-more theme-color-1" title="${msg("actions.more")}"><span>${msg("actions.more")}</span></a></div>
         <div class="more-actions hidden"></div>
      </div>

      <!-- Action Set Templates -->
      <div id="${args.htmlid}-actionSet" class="action-set detailed">
      <#list actionSet as action>
         <div class="${action.id}"><a rel="${action.permission!""}" href="${action.href}" class="${action.type} theme-color-1" title="${msg(action.label)}"><span>${msg(action.label)}</span></a></div>
      </#list>
      </div>
   </div>

</div>
