function main() {
	var conf = new XML(config.script);
	args.feedurl
	var tag = args.tag;
	var title = args.title;
	var alwaysDisplayPaginator = false;
	var rowsPerPage = args.rowsPerPage;

	if (!args.tag) {
		if (conf && conf.tag[0]) {
			tag = conf.tag[0].toString();
		}
	}
	model.tag = tag;

	if (!args.title) {
		if (conf && conf.title[0]) {
			title = conf.title[0].toString();
		}
	}
	model.title = title;

	if (conf && conf.alwaysDisplayPaginator[0]) {
		alwaysDisplayPaginator = conf.alwaysDisplayPaginator[0].toString();
	}
	model.alwaysDisplayPaginator = alwaysDisplayPaginator;

	if (!args.rowsPerPage) {
		if (conf && conf.rowsPerPage[0]) {
			rowsPerPage = conf.rowsPerPage[0].toString();
		}
	}
	model.rowsPerPage = rowsPerPage;

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
	model.userIsSiteManager = userIsSiteManager;
}

main();