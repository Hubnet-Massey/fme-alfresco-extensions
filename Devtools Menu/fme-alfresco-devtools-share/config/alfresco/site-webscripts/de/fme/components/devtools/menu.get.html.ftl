<#assign el=args.htmlid?html>
<#if user.isAdmin> 
<script type="text/javascript">//<![CDATA[
   new Alfresco.module.DevTools("${el}").setOptions({
     solrAdminUrl: "${solrAdminUrl}",
     explorerBaseUrl: "${explorerBaseUrl}"
   }).setMessages(${messages});
//]]></script>
</#if> 
