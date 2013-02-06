/**
 * Galery Plus Dashlet configuration component POST method
 */

var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

function main()
{
   var c = sitedata.getComponent(url.templateArgs.componentId);

   var saveValue = function(name, value) {
	   c.properties[name] = value;
	   model[name] = value; 
   };

   var saveValueIgnoreEmpty = function(name, value) {
	   if (value) {
		   saveValue(name, value);
	   }
   };
   
   saveValue("title", String(json.get("title")).replace(rscript, ""));
   saveValue("filterPath", String(json.get("filterPath")));
   saveValue("filterTags", String(json.get("filterTags")));
   saveValue("sort", String(json.get("sort")));
   saveValue("sortOrder", String(json.get("sortOrder")));
   saveValue("pageSize", String(json.get("pageSize")));
   saveValue("maxImages", String(json.get("maxImages")));
   saveValue("background", String(json.get("background")));

   saveValueIgnoreEmpty("viewmode", String(json.get("viewmode")));
   saveValueIgnoreEmpty("thumbName", String(json.get("thumbName")));
   saveValueIgnoreEmpty("singleAlbumNodeRef", String(json.get("singleAlbumNodeRef")));
   
   c.save();
}

main();
