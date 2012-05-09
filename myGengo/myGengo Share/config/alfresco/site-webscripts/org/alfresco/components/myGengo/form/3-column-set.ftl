<div class="yui-gb">
<#list set.children as item>
   <#if item.kind != "set">
      <#if (item_index % 3) == 0>
     	 <div class="yui-u first">
      <#elseif ((item_index % 3) == 0) && !item_has_next>
       	<div class="yui-u">&nbsp;</div><div class="yui-u">&nbsp;</div><div class="yui-u">
      <#elseif ((item_index % 3) == 1) && !item_has_next>
      	 <div class="yui-u">&nbsp;</div><div class="yui-u">
      <#else>
      	<div class="yui-u">
      </#if>
      <@formLib.renderField field=form.fields[item.id] />
      </div>
   </#if>
</#list>
</div>