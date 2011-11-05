

function copyArgToModel(name, defaultValue) {
	if (args[name]) {
		model[name] = args[name];
	}
	else {
		model[name] = defaultValue;
	}
}

copyArgToModel("title", "");
copyArgToModel("viewmode", "images");
copyArgToModel("album", "");
copyArgToModel("filterPath", "");
copyArgToModel("filterTags", "");
copyArgToModel("sort", "cm:name");
copyArgToModel("sortOrder", "asc");
copyArgToModel("pageSize", "50");
copyArgToModel("maxImages", "1000");
copyArgToModel("background", "");
copyArgToModel("thumbName", "galpThumb120");
