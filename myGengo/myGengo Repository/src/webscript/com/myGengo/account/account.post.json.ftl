<#import "account.lib.ftl" as accountLib />
<#if accountInfo??>
	<@accountLib.accountJSON accountInfo=accountInfo />
<#else>
	<@accountLib.noAccountJSON />	
</#if>