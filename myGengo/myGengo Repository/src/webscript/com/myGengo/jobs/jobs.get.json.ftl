<#import "../job.lib.ftl" as jobLib />
<#escape x as jsonUtils.encodeJSONString(x)>
{
   "totalRecords": ${items?size},
   "jobs":[
   	  <#list items as item>
         <@jobLib.jobJSON job=item.job commentsCount=item.commentsCount />
      <#if item_has_next>,</#if>
      </#list>
   ]
}
</#escape>   