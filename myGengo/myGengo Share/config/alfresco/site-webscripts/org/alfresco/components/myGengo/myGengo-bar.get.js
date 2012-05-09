// Call the repository to see if the user is site manager or not
var userRole = "None";
var obj = context.properties["memberships"];
if (!obj) {
	json = remote.call("/api/sites/" + page.url.templateArgs.site
			+ "/memberships/" + encodeURIComponent(user.name));
	if (json.status == 200) {
		var obj = eval('(' + json + ')');

		// Store the memberships into the request context, it is used
		// downstream by other components - saves making same call many times
		context.setValue("memberships", obj);
	}
}
if (obj) {
	userRole = obj.role ;
}
model.userRole = userRole;
model.myGengoLoggedIn=false;
json = remote.call("/api/mygengo/site/" + page.url.templateArgs.site
		+ "/myGengo");
if (json.status == 200) {
	var obj = eval('(' + json + ')');
	model.myGengoLoggedIn = obj.accountInfo.loggedIn;
}