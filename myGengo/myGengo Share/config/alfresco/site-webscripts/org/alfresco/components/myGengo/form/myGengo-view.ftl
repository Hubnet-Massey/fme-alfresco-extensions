<div id="${formId}-dialog">
   <div class="hd" id="${formId}-dialog-header"></div>
<#if error?exists>
   <div class="error">${error}</div>
<#elseif form?exists>
   <div id="${formId}-container" class="form-container columns-form-container bd">
    
      <#if form.showCaption?exists && form.showCaption>
         <div id="${formId}-caption" class="caption"><span class="mandatory-indicator">*</span>${msg("form.required.fields")}</div>
      </#if>
         
      <div id="${formId}-fields" class="form-fields columns-form-fields mygengo-form-fields"> 
        <div class="yui-gc">
        <#list form.structure as item>
            <#if item.kind == "set">
               <#if item_has_next>
               		<div class="yui-u first" style="text-align:left">
               <#else>
               		<div class="yui-u">
               </#if>
               <@renderSetWithLabel set=item />
               </div>
            <#else>
               <@formLib.renderField field=form.fields[item.id] />
            </#if>
        </#list>
        </div>
      </div>
   </div>
</#if>
</div>
</div>
<#macro renderSetWithLabel set>
   <#if set?size != 0>
   <#if set.appearance?exists>
      <#if set.appearance == "fieldset">
         <fieldset><legend>${set.label}</legend>
      <#elseif set.appearance == "panel">
         <div class="form-panel columns-form-panel">
            <div class="form-panel-heading">${set.label}</div>
            <div class="form-panel-body">
      <#elseif set.appearance == "whitespace">
         <div class="set-whitespace"></div>
      </#if>
   </#if>
   
   <#if set.template??>
      <#include "${set.template}" />
   <#else>
      <#list set.children as item>
      	 <#if item??>	
	         <#if item.kind == "set">
	            <@formLib.renderSet set=item />
	         <#else>
	            <@formLib.renderField field=form.fields[item.id] />
	         </#if>
         </#if>
      </#list>
   </#if>
  
   
   <#if set.appearance?exists>
      <#if set.appearance == "fieldset">
         </fieldset>
      <#elseif set.appearance == "panel">
            </div>
         </div>
      </#if>
   </#if>
   </#if>
</#macro>

