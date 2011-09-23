
var projects = companyhome.childByNamePath("Projects"), group = null;

// Create project folders only if "Projects" doesn't exist yet
if (!projects) {

	var projects = companyhome.createFolder("Projects");

	// create 300 projects
	for ( var i = 1000; i < 1300; i++) {

		// Create a group folder for 100 projects (e.g. 1000-1099)
		if (!group || (i % 100) == 0) {
			group = projects.createFolder("" + i + " - " + (i + 99));
		}

		// Create project folder with a project number (e.g. 1192)
		var project = group.createFolder("" + i);

		project.createFolder("01 Offers");
		project.createFolder("02 Design & Implementation");
		project.createFolder("03 Project Management");
		project.createFolder("04 QA");
		project.createFolder("05 Invoices");
	}
}
