<#include "/org/alfresco/components/form/controls/common/picker.inc.ftl" />
<#assign el=args.htmlid?html>
<#assign tagPickerId = el + "-tagpicker">
<script type="text/javascript">//<![CDATA[

var picker = new Alfresco.ObjectFinder("${tagPickerId}", "${tagPickerId}-hidden").setOptions(
   {
      field: "cm:taggable",
      compactMode: true,
      mandatory: true,
      currentValue: "",
      selectActionLabel: "${msg("button.tag.select")}",
      minSearchTermLength: ${args.minSearchTermLength!'1'},
      maxSearchResults: ${args.maxSearchResults!'1000'},
      allowNavigationToContentChildren: false,
      itemType: "cm:category",
      multipleSelectMode: true,
      parentNodeRef: "alfresco://category/root",
      itemFamily: "category",
      maintainAddedRemovedItems: false,
      params: "aspect=cm:taggable",
      createNewItemUri: "/api/tag/workspace/SpacesStore",
      createNewItemIcon: "tag"   
   }).setMessages(
      ${messages}
   );

//]]></script>

<div id="${el}-configDialog" class="config-dashlet">
   <div class="hd">${msg("label.configure")}</div>
   <div class="bd">
      <form id="${el}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-tag">${msg("label.tag")}:</label></div>
            <#--<div class="yui-u"><input id="${el}-tag" type="text" name="tag" value=""/>&nbsp;*</div>-->
            <div class="yui-u">
            	<div id="${el}-tagSection-div" class="tag-picker">
			    	<div id="${tagPickerId}" class="object-finder">
			        	<div id="${tagPickerId}-currentValueDisplay" class="current-values"></div>
			            <input type="hidden" id="${tagPickerId}-hidden" name="-" value="${field.value?html}" />
			            <input type="hidden" id="${tagPickerId}-added" name="${field.name}_added" />
			            <input type="hidden" id="${tagPickerId}-removed" name="${field.name}_removed" />
			            <div id="${tagPickerId}-itemGroupActions" class="show-picker"></div>
			            <@renderPickerHTML tagPickerId />
			      	</div>
		     	</div>
		    </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-title">${msg("label.title")}:</label></div>
            <div class="yui-u"><input id="${el}-title" type="text" name="title" value=""/>&nbsp;*</div>
         </div>
         <div class="bdft">
            <input type="submit" id="${el}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${el}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>