<#macro dateFormat date=""><#if date?is_date>${xmldate(date)}</#if></#macro>
<#macro accountJSON accountInfo>
	<#escape x as jsonUtils.encodeJSONString(x)>
	{
	   "accountInfo":
	   {
	      "loggedIn": <#if accountInfo?? && accountInfo.privateKey??>true,<#else>false</#if>
	      <#if accountInfo??>
	      	"appName" : "${accountInfo.applicationName}",
	      	"credits" : "${accountInfo.credits}",
	      	"creditsSpent" : "${accountInfo.creditsSpent}",
	      	"userSince" : "<@dateFormat accountInfo.userSince />"
	      </#if>
	   }
	}
	</#escape>
</#macro>
<#macro noAccountJSON>
	<#escape x as jsonUtils.encodeJSONString(x)>
	{
	   "accountInfo":
	   {
	      "loggedIn": false
	   }
	}
	</#escape>
</#macro>