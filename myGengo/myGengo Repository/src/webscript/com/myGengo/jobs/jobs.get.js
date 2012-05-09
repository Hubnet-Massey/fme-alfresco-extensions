<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/comments/comments.lib.js">
function main()
{
	/**
     * Site and container input
     */
    var siteId = url.templateArgs.site,
       containerId = url.templateArgs.container,
       siteNode = siteService.getSite(siteId);

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
    
    //refresh Jobs?
    if (args.refresh && args.refresh == "true"){
    	try{
    		myGengo.refreshJobs(rootNode, false);
    	}catch (e){
    		var exp = e.javaException;
    	    if (exp instanceof Packages.org.alfresco.repo.lock.LockAcquisitionException) {
    	    	status.setCode(423, "another refresh is running...try later");
                return null;
    	    } else {
    	    	status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, "Internal Server error");
                return null;
    	    }
    		
    	}
    }
    
    var jobs = rootNode.children;
    var items = [];
    for each(job in jobs){
    	var item={};
    	item.job = job;
    	item.commentsCount = getComments(job).length;
    	items.push(item);
    }
    model.items = items;
}

main();