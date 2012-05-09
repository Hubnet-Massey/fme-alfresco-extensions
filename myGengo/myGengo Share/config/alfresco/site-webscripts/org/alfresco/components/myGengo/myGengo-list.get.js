function main() {
	var siteId = page.url.templateArgs.site
	// Call the repo for site container (lazy creation)
	var result = remote.call("/slingshot/doclib/container/" + siteId + "/myGengo");
	if (result.status != 200) {
		model.containerNotExist = true;
	}
	
	var userRole = "None";
	var obj = context.properties["memberships"];
	if (!obj) {
		var json = remote.call("/api/sites/" + page.url.templateArgs.site
				+ "/memberships/" + encodeURIComponent(user.name));
		if (json.status == 200) {
			obj = eval('(' + json + ')');

			// Store the memberships into the request context, it is used
			// downstream by other components - saves making same call many times
			context.setValue("memberships", obj);
		}
	}
	if (obj) {
		userRole = obj.role;
	}
	model.userRole = userRole;
	
	var languages = remote.call("/api/mygengo/site/" + page.url.templateArgs.site
			+ "/myGengo/languages");
	if (languages.status == 200) {
		
		model.languages = languages;
	}
	
	// Actions
	   var actionSet = [],
	      myConfig = new XML(config.script),
	      xmlActionSet = myConfig.actionSet;

	   for each (var xmlAction in xmlActionSet.action)
	   {
	      actionSet.push(
	      {
	         id: xmlAction.@id.toString(),
	         type: xmlAction.@type.toString(),
	         permission: xmlAction.@permission.toString(),
	         href: xmlAction.@href.toString(),
	         label: xmlAction.@label.toString()
	      });
	   }

	   model.actionSet = actionSet;
}
main();