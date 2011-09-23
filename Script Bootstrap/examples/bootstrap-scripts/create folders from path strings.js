
createFolderPaths(companyhome, [
  "test1/somefolder/Test",
  "test2/anotherFolder",
  "test1",
  "test2/andYetAnotherFolder"  
]);

function createFolderPaths(node, paths) {
  for each(var path in paths) {
    createFolderPath(node, path); 
  }
}

function createFolderPath(node, path) {
  var elements = path.split("/"), base=node;  
  for each(element in elements) {
    var found = base.childByNamePath(element);
    
    if (!found) {
    	found = base.createFolder(element);
    	logger.log("created folder: " + found.displayPath + "/" + found.name);
    }
    base = found;
  }
}
