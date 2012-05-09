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
       status.setCode(status.STATUS_BAD_REQUEST, " 'slug' parameter missing when ordering myGengo Job");
       return;
    }

    var source = json.get("source");
    if (source == null || source.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'source' parameter missing when ordering myGengo Job");
    	return;
    }

    var target = json.get("target");
    if (target == null || target.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'target' parameter missing when ordering myGengo Job");
    	return;
    }
    
    var text = json.get("text");
    if (text == null || text.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'text' parameter missing when ordering myGengo Job");
    	return;
    }
    
    var tier = json.get("tier");
    if (tier == null || tier.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'tier' parameter missing ordering myGengo Job");
    	return;
    }
    
    var comment = json.get("comment");
    if (comment == null || comment.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'comment' parameter missing ordering myGengo Job");
    	return;
    }
    var autoApprove = false;
    if (json.has("autoApprove")){
    	autoApprove = json.getBoolean("autoApprove");
    }
   
    
    try 
    {
    	model.job = myGengo.orderTranslation(rootNode,slug, text, source, target, tier, comment, autoApprove);
    }
    catch(e)
    {
       if (logger.isLoggingEnabled())
       {
          logger.log(e);
       }
       var exp = e.javaException;
	   if (exp instanceof Packages.com.myGengo.alfresco.account.MyGengoServiceException) {
	    	status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, exp.message);
	    	return null;
	   } else {
	    	status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, "Internal Server error");
           return null;
	   }
    }
    
    
}

main();