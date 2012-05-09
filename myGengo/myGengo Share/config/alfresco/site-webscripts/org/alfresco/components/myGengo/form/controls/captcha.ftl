<div class="form-field">
   <#if form.mode == "edit">
      <label for="${fieldHtmlId}">${field.label?html}:<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if></label>
      <div class="captcha-value"><img src="${field.value}"/></div>
      <input id="${fieldHtmlId}" name="${field.control.params.name}" tabindex="0"
             <#if field.control.params.password??>type="password"<#else>type="text"</#if>
             <#if field.control.params.styleClass??>class="${field.control.params.styleClass}"</#if>
             <#if field.control.params.style??>style="${field.control.params.style}"</#if>
             <#if field.description??>title="${field.description}"</#if>
             <#if field.control.params.maxLength??>maxlength="${field.control.params.maxLength}"</#if> 
             <#if field.control.params.size??>size="${field.control.params.size}"</#if> 
             <#if field.disabled && !(field.control.params.forceEditable?? && field.control.params.forceEditable == "true")>disabled="true"</#if> />
      <@formLib.renderFieldHelp field=field />
   </#if>
</div>