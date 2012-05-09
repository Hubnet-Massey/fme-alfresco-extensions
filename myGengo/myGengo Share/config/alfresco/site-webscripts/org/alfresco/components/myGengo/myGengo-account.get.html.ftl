<#assign id = args.htmlid />
<#if userIsSiteManager>
	<script type="text/javascript">//<![CDATA[
	  new MyGengo.Account("${args.htmlid}").setOptions(
	   {
	      siteId: "${page.url.templateArgs["site"]!""}"
	   }).setMessages(
	      ${messages}
	   );
	//]]></script>
	
	
	
	<div id="${id}-body" class="myGengo-account">
	   
	   <div class="heading">${msg("header.myGengo-account")}</div>
	   
	   <div id="${id}-mygengo_button"></div>
	   
	   <div id="${id}-mygengo_account" class="share-form" style="visibility:hidden">
			<div class="form-container">
				<div class="form-fields">
					<div class="set">
						<div id="${id}-credits" class="form-field"></div>
						<div id="${id}-creditsSpent" class="form-field"></div>
						<div id="${id}-userSince" class="form-field"></div>
					</div>
				</div>
			</div>
			<div class="button">
				<span id="${id}-signoutButton" class="yui-button">
			         <span class="first-child">
			             <button type="button">${msg('button.signOut')}</button>
			         </span>
			    </span>
		    </div>   	
	   </div>
	</div>
</#if>