

if (config.scoped["DevTools"] && config.scoped["DevTools"]["devtools"]) {
	
	model.explorerBaseUrl = config.scoped["DevTools"]["devtools"].getChildValue("explorerBaseUrl");
	model.solrAdminUrl = config.scoped["DevTools"]["devtools"].getChildValue("solrAdminUrl");
}


if (!model.explorerBaseUrl) {
	model.explorerBaseUrl = "http://localhost:8080/alfresco";
}
if (!model.solrAdminUrl) {
    model.solrAdminUrl = "https://localhost:8443/solr/alfresco/admin/";
}
