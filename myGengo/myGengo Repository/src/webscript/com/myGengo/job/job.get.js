<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/comments/comments.lib.js">
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
    if (args.refresh && args.refresh == "true"){
    	myGengo.refreshJob(job, rootNode);
    }
    
    var item={};
    item.job = job;
    item.commentsCount = getComments(job).length;
    
    model.item = item;
}

main();