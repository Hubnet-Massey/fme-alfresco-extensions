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
     * API Keys
     */
    var privateKey = json.get("privateKey");
    if (privateKey == null || privateKey.length === 0)
    {
       status.setCode(status.STATUS_BAD_REQUEST, " 'privateKey' parameter missing when posting myGengo AccountInfo");
       return;
    }

    var publicKey = json.get("publicKey");
    if (publicKey == null || publicKey.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'publicKey' parameter missing when posting myGengo AccountInfo");
    	return;
    }

    var appName = json.get("appName");
    if (publicKey == null || publicKey.length === 0)
    {
    	status.setCode(status.STATUS_BAD_REQUEST, " 'appName' parameter missing when posting myGengo AccountInfo");
    	return;
    }
    try 
    {
    	var accountInfo = myGengo.loadAccountInfo(publicKey, privateKey, appName);
    	myGengo.saveAccount(rootNode, accountInfo);
    	model.accountInfo = accountInfo;
    	model.languagePairs = myGengo.loadLanguages(rootNode);
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