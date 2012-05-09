function main()
{
	/**
     * Site and container input
     */
    var siteId = url.templateArgs.site,
       containerId = url.templateArgs.container,
       siteNode = siteService.getSite(siteId),
       storeType = url.templateArgs.store_type,
       storeId = url.templateArgs.store_id,
       id = url.templateArgs.id;
    model.success = false;
    if (siteNode === null)
    {
       status.setCode(status.STATUS_GONE, "Site not found: '" + siteId + "'");
       return null;
    }

    rootNode = siteNode.getContainer(containerId);
    if (rootNode === null)
    {
    	status.setCode(status.STATUS_GONE, "MyGengo container '" + containerId + "' not found in '" + siteId + "'. (No permission?)");
        return null;
    }

    nodeRef = storeType + "://" + storeId + "/" + id;
    var job = search.findNode(nodeRef);
    if (job === null)
    {
    	status.setCode(status.STATUS_GONE, "MyGengo job '" + nodeRef + "' not found in '" + siteId + "'. (No permission?)");
        return null;
    }
    //only approved jobs can be deleted
    if (job.properties["myGengo:status"] == "approved"){
    	job.remove();
    	model.success = true;
    }else if (job.properties["myGengo:status"] == "available"){
    	myGengo.cancelJob(job, rootNode);
    	model.success = true;
    }else{
    	status.setCode(status.STATUS_NOT_ALLOWED, "MyGengo job '" + nodeRef + "' cannot be deleted because its status is " + job.properties["myGengo:status"]);
        return null;
    }

}

main();