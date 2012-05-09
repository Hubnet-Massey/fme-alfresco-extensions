<#if field.value != "">
<#assign imageUrl><#if field.control.params.weburl?? && field.control.params.weburl == "true">${field.value}<#else>/share/proxy/alfresco/api/node/${field.value}</#if></#assign>
<div class="form-field">
      <div class="viewmode-field">
         <span class="viewmode-label">${field.label?html}:</span>
         <span class="viewmode-value"><img src="${imageUrl}"/></span>
      </div>
</div>
</#if>