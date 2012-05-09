<#macro dateFormat date=""><#if date?is_date>${xmldate(date)}</#if></#macro>
<#macro jobJSON job commentsCount>
	<#escape x as jsonUtils.encodeJSONString(x)>
	{
	      	"nodeRef" : "${job.nodeRef}",
	      	"id" : "${job.properties["myGengo:jobId"]}",
	      	"text" : "${job.properties["myGengo:text"]}",
	      	<#if job.properties["myGengo:translation"]??>
	      	"translation" : "${job.properties["myGengo:translation"]}",
	      	</#if>
	      	"title" : "${job.properties["myGengo:title"]}",
	      	"sourceLanguage" : "${job.properties["myGengo:sourceLanguage"]}",
	      	"targetLanguage" : "${job.properties["myGengo:targetLanguage"]}",
	      	"tier" : "${job.properties["myGengo:tier"]}",
	      	"status" : "${job.properties["myGengo:status"]}",
	      	"credits" : "${job.properties["myGengo:jobCredits"]}",
	      	"unitCount" : "${job.properties["myGengo:unitCount"]}",
	      	"unitType" : "${job.properties["myGengo:unitType"]}",
	      	"eta" : ${job.properties["myGengo:eta"]?string("0")},
	      	"created" : "<@dateFormat job.properties.created />",
	      	"modified" : "<@dateFormat job.properties["myGengo:modified"] />",
	      	"commentsCount" : ${commentsCount?string("0")!"0"},
		    "permissions":
	         {
	            "userAccess":
	            {
	               "delete": <#if job.properties["myGengo:status"]?? && job.properties["myGengo:status"]=="approved">${job.hasPermission("Delete")?string}<#else>false</#if>,
	               "edit": ${job.hasPermission("Write")?string},
	               "approve": <#if job.properties["myGengo:status"]?? && job.properties["myGengo:status"]=="reviewable">true<#else>false</#if>,
	               "revise": <#if job.properties["myGengo:status"]?? && job.properties["myGengo:status"]=="reviewable">true<#else>false</#if>,
	               "reject": <#if job.properties["myGengo:status"]?? && job.properties["myGengo:status"]=="reviewable">true<#else>false</#if>,
	               "cancel": <#if job.properties["myGengo:status"]?? && job.properties["myGengo:status"]=="available">${job.hasPermission("Delete")?string}<#else>false</#if>,
	               "create": "${job.parent.hasPermission("CreateChildren")?string}",
	               "comment" : <#if job.properties["myGengo:status"]?? && job.properties["myGengo:status"] != "approved">true<#else>false</#if>
	            }
	         }
	}
	</#escape>
</#macro>