<#assign id = args.htmlid />
<script type="text/javascript">//<![CDATA[
  new MyGengo.CreateJob("${args.htmlid}").setOptions(
   {
      siteId: "${page.url.templateArgs["site"]!""}",
      userRole: "${userRole!"None"}",
      languages : <#if languages??>${languages}<#else>null</#if>
   }).setMessages(
      ${messages}
   );
//]]></script>



<div id="${id}-body" class="myGengo-create">
   
   <div class="heading">${msg("header.myGengo-create")}</div>
   
   
   <div id="${id}-mygengo_create" class="share-form">
		<div class="form-container">
			<form id="${id}-form" action="#" enctype="application/json" accept-charset="utf-8" method="post" forms-runtime="listening" onsubmit="return false;">
			<div class="form-fields yui-g" id="${id}-formfields">
				<div class="set yui-u first">
					<div class="form-field">
						<label for="${id}-slug">${msg("label.slug")}<span class="mandatory-indicator">*</span></label>
						<input type="text" title="${msg("label.slug")}" value="" tabindex="1" name="slug" id="${id}-slug"></input>
					</div>
					<div class="form-field">
						<label for="${id}-text">${msg("label.text")}<span class="mandatory-indicator">*</span></label>
						<textarea title="${msg("label.text")}" tabindex="2" name="text" rows="8" id="${id}-text"></textarea>
					</div>
					<div class="form-field">
						<label for="${id}-comment">${msg("label.comment")}</label>
						<textarea title="${msg("label.comment")}" tabindex="3" name="comment" rows="8" id="${id}-comment"></textarea>
					</div>
				</div>
				<div class="set yui-u">
					<div class="form-field yui-g">
						<div class="yui-u first">
							<label for="${id}-source">${msg("label.translate.source")}<span class="mandatory-indicator">*</span></label>
							<select id="${id}-source" name="source" tabindex="4"></select>
						</div>
						<div class="yui-u">
							<label for="${id}-target">${msg("label.translate.target")}<span class="mandatory-indicator">*</span></label>
							<select id="${id}-target" name="target" tabindex="5"></select>
						</div>
					</div>
					<div class="form-field yui-g">
						<div class="yui-u first">
							<label for="${id}-tier">${msg("label.tier")}<span class="mandatory-indicator">*</span></label>
							<input type="radio" tabindex="6" name="tier" id="${id}-tier.standard" value="${msg("value.tier.standard")}" /><label class="radio" for="${id}-tier.standard">${msg("label.tier.standard")}</label><br/>
							<input type="radio" tabindex="7" name="tier" id="${id}-tier.pro" value="${msg("value.tier.pro")}" /><label class="radio" for="${id}-tier.pro">${msg("label.tier.pro")}</label><br/>
							<input type="radio" tabindex="8" name="tier" id="${id}-tier.ultra" value="${msg("value.tier.ultra")}" /><label class="radio" for="${id}-tier.ultra">${msg("label.tier.ultra")}</label><br/>
						</div>
						<div class="yui-u checkbox-field">
							<input type="checkbox" tabindex="9" id="${id}-autoApprove" name="autoApprove"/> <label class="checkbox" for="${id}-autoApprove">${msg("label.autoApprove")}</label>
						</div>
					</div>
					<div class="summary" id="${id}-summary">
					</div>
									
				</div>
			</div>
		</div>
		<div class="button">
			<span id="${id}-orderButton" class="yui-button">
		         <span class="first-child">
		             <button type="button" tabindex="10">${msg('button.order')}</button>
		         </span>
		    </span>
			<span id="${id}-quoteButton" class="yui-button">
		         <span class="first-child">
		             <button type="button" tabindex="11">${msg('button.quote')}</button>
		         </span>
		    </span>
	    </div>
   </div>
</div>