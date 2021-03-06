<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/repository/forms/pickerresults.lib.js">

function main()
{
   var count = 0,
      items = [],
      results = [];

   // extract mandatory data from request body
   if (!json.has("items"))
   {
       status.setCode(status.STATUS_BAD_REQUEST, "items parameter is not present");
       return;
   }
   
   // convert the JSONArray object into a native JavaScript array
   var jsonItems = json.get("items"),
      itemValueType = "nodeRef",
      itemValueTypeHint = "",
      numItems = jsonItems.length(),
      item, result;
   
   if (json.has("itemValueType"))
   {
      var jsonValueTypes = json.get("itemValueType").split(";");
      itemValueType = jsonValueTypes[0];
      itemValueTypeHint = (jsonValueTypes.length > 1) ? jsonValueTypes[1] : "";
   }
   
   for (count = 0; count < numItems; count++)
   {
      item = jsonItems.get(count);
      if (item != "")
      {
         result = null;
         if (itemValueType == "nodeRef")
         {
            result = search.findNode(item);
         }
         //Jan Pfitzner (Alfrescian.org): added support tag-argument (tag value as text)
         else if (itemValueType == "tag")
         {
             var queryResult = search.query({language: "fts-alfresco", query : 'cm\:name:"'+item+'" AND PARENT:"workspace://SpacesStore/tag:tag-root"'});
             if (queryResult.length > 0){
            	 result = queryResult[0];
             }
         }
         else if (itemValueType == "xpath")
         {
            result = search.xpathSearch(itemValueTypeHint.replace("%VALUE%", search.ISO9075Encode(item)))[0];
         }
         
         if (result != null)
         {
            // create a separate object if the node represents a user or group
            if (result.isSubType("cm:person"))
            {
               result = createPersonResult(result);
            }
            else if (result.isSubType("cm:authorityContainer"))
            {
               result = createGroupResult(result);
            }
            
            results.push(
            {
               item: result
            });
         }
      }
   }

   if (logger.isLoggingEnabled())
       logger.log("#items = " + count + ", #results = " + results.length);

   model.results = results;
}

main();
