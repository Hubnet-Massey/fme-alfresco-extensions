<#setting locale="en_US">
<#escape x as jsonUtils.encodeJSONString(x)>
{
	"quote" : {
		"unitCount" : ${quote.unitCount?string("0")},
		"credits" : ${quote.credits?string("0.###")},
		"eta" : ${quote.eta?string("0")}
	}
}
</#escape>