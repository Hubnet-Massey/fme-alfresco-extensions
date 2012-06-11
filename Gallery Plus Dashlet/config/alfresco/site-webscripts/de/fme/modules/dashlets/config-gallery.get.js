
function main()
{

   var connector = remote.connect("alfresco");

   var remoteUrl = "/de/fme/dashlets/gallery-albums";
   
   if (args.site) {
	   remoteUrl += "?site=" + args.site;   
   }
   
   var result = connector.get(remoteUrl);
   if (result.status != status.STATUS_OK)
   {
      status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, "Unable to call doclist data webscript. " +
                     "Status: " + result.status + ", response: " + result.response);
      return null;
   }
   
   var data = eval('(' + result.response + ')');
   
   model.albums = data.albums;
}

main();
