<#include "/org/alfresco/components/form/controls/common/utils.inc.ftl" />

<#if field.control.params.optionSeparator??>
   <#assign optionSeparator=field.control.params.optionSeparator>
<#else>
   <#assign optionSeparator=",">
</#if>
<#if field.control.params.labelSeparator??>
   <#assign labelSeparator=field.control.params.labelSeparator>
<#else>
   <#assign labelSeparator="|">
</#if>

<#assign fieldValue=field.value>

<#if fieldValue?string == "" && field.control.params.defaultValueContextProperty??>
   <#if context.properties[field.control.params.defaultValueContextProperty]??>
      <#assign fieldValue = context.properties[field.control.params.defaultValueContextProperty]>
   <#elseif args[field.control.params.defaultValueContextProperty]??>
      <#assign fieldValue = args[field.control.params.defaultValueContextProperty]>
   </#if>
</#if>

<div class="form-field">
   <#if form.mode == "view">
      <div class="viewmode-field">
         <#if field.mandatory && !(fieldValue?is_number) && fieldValue?string == "">
            <span class="incomplete-warning"><img src="${url.context}/res/components/form/images/warning-16.png" title="${msg("form.field.incomplete")}" /><span>
         </#if>
         <span class="viewmode-label">${field.label?html}:</span>
         <#if fieldValue?string == "">
            <#assign valueToShow=msg("form.control.novalue")>
         <#else>
            <#assign valueToShow=fieldValue>
            <#if field.control.params.options?? && field.control.params.options != "">
               <#list field.control.params.options?split(optionSeparator) as nameValue>
                  <#if nameValue?index_of(labelSeparator) == -1>
                     <#if nameValue == fieldValue?string || (fieldValue?is_number && fieldValue?c == nameValue)>
                        <#assign valueToShow=nameValue>
                        <#break>
                     </#if>
                  <#else>
                     <#assign choice=nameValue?split(labelSeparator)>
                     <#if choice[0] == fieldValue?string || (fieldValue?is_number && fieldValue?c == choice[0])>
                        <#assign valueToShow=msgValue(choice[1])>
                        <#break>
                     </#if>
                  </#if>
               </#list>
            </#if>
         </#if>
         <span class="viewmode-value">${valueToShow?html}</span>
      </div>
   <#else>
      <label for="${fieldHtmlId}">${field.label?html}:<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if></label>
      <#if field.control.params.options?? && field.control.params.options != "">
      
		<div>         
               <#list field.control.params.options?split(optionSeparator) as nameValue>
                  <#if nameValue?index_of(labelSeparator) == -1>
                  	 <div>
                     	<input type="radio" onchange='javascript:YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);' name="${field.name}" value="${nameValue?html}" <#if nameValue == field.value?string> checked="checked"</#if> style="margin-left:1em;width:2em;"> ${msgValue(nameValue)?html}
                     </div>
                  <#else>
                     <#assign choice=nameValue?split(labelSeparator)>
                  	 <div>
                     	<input type="radio" onchange='javascript:YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);' name="${field.name}" value="${choice[0]?html}" <#if choice[0] == field.value?string> checked="checked"</#if> style="margin-left:1em;width:2em;"> ${msgValue(choice[1])?html}
                     </div>
                  </#if>
               </#list>
         </div>
         
         <@formLib.renderFieldHelp field=field />
      <#else>
         <div class="missing-options">${msg("form.control.selectone.missing-options")}</div>
      </#if>
   </#if>
</div>