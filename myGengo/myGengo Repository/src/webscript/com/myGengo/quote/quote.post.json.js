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
    
    /*
     * Quote data
     */
    var slug = json.get("slug");
    if (slug == null || slug.length === 0)
    {
       status.setCode(status.STATUS_BAD_REQUEST, " 'slug' parameter missing when getting myGengo Quote");
       return;
    }

    var source = json.get("source");
    if (source == null || source.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'source' parameter missing when getting myGengo Quote");
    	return;
    }

    var target = json.get("target");
    if (target == null || target.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'target' parameter missing when getting myGengo Quote");
    	return;
    }
    
    var text = json.get("text");
    if (text == null || text.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'text' parameter missing when getting myGengo Quote");
    	return;
    }
    
    var tier = json.get("tier");
    if (tier == null || tier.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'tier' parameter missing when getting myGengo Quote");
    	return;
    }
    
    try 
    {
    	model.quote = myGengo.getQuote(rootNode,slug, text, source, target, tier);
    	
    }
    catch(e)
    {
       if (logger.isLoggingEnabled())
       {
          logger.log(e);
       }
       status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, e);
       return null;
    }
    
    
}

main();