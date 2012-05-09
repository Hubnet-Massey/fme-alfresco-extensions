<#assign id = args.htmlid>
<script type="text/javascript">//<![CDATA[
  new MyGengo.Toolbar("${args.htmlid}").setOptions(
   {
      siteId: "${page.url.templateArgs["site"]!""}",
      userRole: "${userRole!"None"}",
      loggedIn: ${myGengoLoggedIn?string!"false"}
   }).setMessages(
      ${messages}
   );
//]]></script>

<div id="${id}-headerBar" class="myGengo-bar toolbar flat-button theme-bg-2">
	<div class="left">
	  <span id="${id}-jobListButton" class="job-list yui-button yui-push-button">
         <span class="first-child">
             <button type="button">${msg('button.jobList')}</button>
         </span>
     </span>
	  <span id="${id}-createJobButton" class="create-job yui-button yui-push-button">
         <span class="first-child">
             <button type="button">${msg('button.createJob')}</button>
         </span>
     </span>
	  <span id="${id}-refreshJobsButton" class="refresh-jobs yui-button yui-push-button">
         <span class="first-child">
             <button type="button">${msg('button.refreshJobs')}</button>
         </span>
     </span>
	  <span id="${id}-accountInfoButton" class="account-info yui-button yui-push-button">
         <span class="first-child">
             <button type="button">${msg('button.accountInfo')}</button>
         </span>
     </span>
  </div>
  
</div>
<div class="clear"></div>