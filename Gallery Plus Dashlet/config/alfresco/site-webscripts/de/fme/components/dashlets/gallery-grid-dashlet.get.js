function main() {
	var conf = new XML(config.script);

	var copyConfigAndArgsToModel = function(name) {
		var value = args[name]
		if (!args[name]) {
			if (conf && conf[name][0]) {
				value = conf[name][0].toString();
			}
		}
		model[name] = value;
	}
	
	copyConfigAndArgsToModel("title");
	copyConfigAndArgsToModel("singleAlbumNodeRef");
	copyConfigAndArgsToModel("filterPath");
	copyConfigAndArgsToModel("filterTags");
	copyConfigAndArgsToModel("sort");
	copyConfigAndArgsToModel("sortOrder");
	copyConfigAndArgsToModel("pageSize");
	copyConfigAndArgsToModel("maxImages");
	copyConfigAndArgsToModel("background");
	copyConfigAndArgsToModel("viewmode");
	copyConfigAndArgsToModel("thumbName");

	// test if current user is SiteManager
	var userIsSiteManager = false;

	// Check whether we are within the context of a site
	if (page.url.templateArgs.site) {
		// If we are, call the repository to see if the user is site manager or
		// not
		userIsSiteManager = false;
		var obj = context.properties["memberships"];
		if (!obj) {
			var json = remote.call("/api/sites/" + page.url.templateArgs.site
					+ "/memberships/" + encodeURIComponent(user.name));
			if (json.status == 200) {
				obj = eval('(' + json + ')');
			}
		}
		if (obj) {
			userIsSiteManager = (obj.role == "SiteManager");
		}
	}
	else {
		// user dashboard
		userIsSiteManager = true;
	}
	
	model.userIsSiteManager = userIsSiteManager;

}

main();