<#escape x as jsonUtils.encodeJSONString(x)>
{
	"languages" : [
		<#list languages as languagePair>
			{
				"source" : {
					"language" : "${languagePair.source.language}",
					"localizedName" : "${languagePair.source.localizedName}",
					"languageCode" : "${languagePair.source.languageCode}",
					"unitType" : "${languagePair.source.unitType}"
				},
				"target" : {
					"language" : "${languagePair.target.language}",
					"localizedName" : "${languagePair.target.localizedName}",
					"languageCode" : "${languagePair.target.languageCode}",
					"unitType" : "${languagePair.target.unitType}"
				},
				"unitPrice" : "${languagePair.unitPrice}",
				"tier" : "${languagePair.tier}"
			}
			<#if languagePair_has_next>,</#if>
      	</#list>
	]
}
</#escape>