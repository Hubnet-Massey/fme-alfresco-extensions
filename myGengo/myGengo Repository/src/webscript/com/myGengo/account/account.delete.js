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
    
    try 
    {
    	myGengo.removeAccountInfo(rootNode);
    }
    catch(e)
    {
       if (logger.isLoggingEnabled())
       {
          logger.log(e);
       }
       status.setCode(status.INTERNAL_SERVER_ERROR, e);
       return null;
    }
    
    
}

main();