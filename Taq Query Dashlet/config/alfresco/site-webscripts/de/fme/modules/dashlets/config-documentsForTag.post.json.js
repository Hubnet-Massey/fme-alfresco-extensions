/**
 * DocumentsForTag configuration component POST method
 */

function main()
{
   var c = sitedata.getComponent(url.templateArgs.componentId),
       tag = String(json.get("tag")),
       title = String(json.get("title")),
       rowsPerPage = String(json.get("rowsPerPage"));
   
   c.properties["tag"] = tag;
   model.tag = tag;
   
   c.properties["title"] = title;
   model.title = title;
   
   c.properties["rowsPerPage"] = rowsPerPage;
   model.rowsPerPage = rowsPerPage;
     
   c.save();
}

main();