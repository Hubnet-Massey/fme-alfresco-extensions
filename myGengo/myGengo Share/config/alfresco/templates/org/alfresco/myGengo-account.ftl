<#include "include/alfresco-template.ftl" />
<@templateHeader>
</@>

<@templateBody>
   <div id="alf-hd">
      <@region id="header" scope="global" protected=true />
      <@region id="title" scope="template" protected=true />
      <@region id="navigation" scope="template" protected=true />
   </div>

   <div id="bd">
		<@region id="myGengo-bar" scope="template"  protected=true/>
		<@region id="myGengo-account" scope="template" protected=true />
   </div>   
</@>

<@templateFooter>
   <div id="alf-ft">
      <@region id="footer" scope="global" protected=true />
   </div>
</@>