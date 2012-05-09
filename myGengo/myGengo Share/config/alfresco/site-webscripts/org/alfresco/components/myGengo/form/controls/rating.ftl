<#comment>
   Copyright 2011, Jeff Potts

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
</#comment>
<#assign controlId = fieldHtmlId + "-cntrl">
<script>
	var mratings = new MyGengo.Ratings("${controlId}", "${fieldHtmlId}", "${field.value?html}").setOptions({
		readOnly : <#if form.mode == "view">true<#else>false</#if>
	});
</script>
<div class="form-field">
   <#if form.mode == "view">
      <div class="viewmode-field">
         <span class="viewmode-label">${field.label?html}:</span>
         <span class="viewmode-value">
         	<div class="rating" id="${controlId}"></div>
         </span>
      </div>
   <#else>
      <label for="${fieldHtmlId}">${field.label?html}:<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if></label>
      <div class="rating" id="${controlId}"></div>
      <input type="hidden" id="${fieldHtmlId}" name="${field.name}" value="${field.value?html}" />
   </#if>
</div>