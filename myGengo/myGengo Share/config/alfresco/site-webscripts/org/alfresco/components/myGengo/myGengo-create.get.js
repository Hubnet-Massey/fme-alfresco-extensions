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