// Call the repository to see if the user is site manager or not
var userIsSiteManager = false;
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
	userIsSiteManager = obj.role == "SiteManager";
}
model.userIsSiteManager = userIsSiteManager;