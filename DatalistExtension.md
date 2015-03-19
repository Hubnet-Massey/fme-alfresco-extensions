_**This wiki pages describes the datalist extensions for Alfresco 3.4.x**

Please feel free to contribute a 4.0 compliant version or contact us if you like to sponsor such an upgrade.

---_


# Datalist Extensions for Alfresco Share #

Author: Jan Pfitzner ([alfrescian.com](http://alfrescian.com) & [twitter.com/alfrescian](http://twitter.com/alfrescian) & j.pfitzner(at)fme.de)

This Extension was made for an Alfresco customer of [fme AG](http://www.fme.de)

## Features ##
### Automatic ID generation ###
automatic generation of an ID for each item of a datalist. These IDs are generated using a separate ID sequence on each datalist.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-IDs.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-IDs.png)

### Read-only/view dialog ###
Double clicking an item displays a view-mode form using Alfresco FormService.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-view-mode-Form.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-view-mode-Form.png)

### Auto versioning ###
Aspect cm:versionable with auto-version on property changes is applied to each datalist item. A custom policy triggers versioning if an association was modified  - e.g. dl:assignee.

To display the version history of a datalist item a new FormService control was implemented. The show version link will open the selected version in another view-mode dialog.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-version-control.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-version-control.png)

### Comments thread ###

Alfresco only supports a simple comment field, but you often like to have a discussion thread as you have in the document library. Hence we added support of fm:discussable aspect to datalist items including the necessary form controls & FormFilters.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-comment-control.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-comment-control.png)

### Ellipsis for long text ###
Per default the whole text of a property is displayed in the datagrid. If you’ve a longer text – e.g. in cm:description – your datagrid layout will be suboptimal.

Thus, we added an ellipsis feature for text longer than 40 chars. The whole text will be displayed as tooltip on mouse over.
![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-ellipsis.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-ellipsis.png)

### Upload & Attach ###

To support the direct attachment of a file to a datalist item that isn’t already stored in the repo an upload&attach action was added to cm:attachment-control.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-uploadattach.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-uploadattach.png)

### XLS Export ###
Nick Burch had already developed a basic XLS-export WebScript. We resused that one & added support for fm:discussable comment threads.

XLS-Export button is displayed in the datalist toolbar.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-xls-export.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-xls-export.png)

### Filters ###
We added form based filters for each type of datalists to allow an user-friendly filtering of datalist items. These filters are also based on Alfresco's FormService and browser history & URL addressability are suppported.

![http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-filter-form.png](http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/documentation/Screenshot-datalist-filter-form.png)

## Screencam ##
<a href='http://www.youtube.com/watch?feature=player_embedded&v=NWrReztc9BA' target='_blank'><img src='http://img.youtube.com/vi/NWrReztc9BA/0.jpg' width='425' height=344 /></a>


## Browser support ##
  * Chrome, IE8 and Firefox have been tested and should work fine


## Installation ##

The component has been developed to install on top of an existing Alfresco 3.4.2 (Enterprise)

You need to copy the [fme-datalist-extension-repository.jar](http://code.google.com/p/fme-alfresco-extensions/downloads/detail?name=fme-datalist-extension-repository.jar) to tomcat/webapps/alfresco/WEB-INF/lib and [fme-datalist-extension-share.jar](http://code.google.com/p/fme-alfresco-extensions/downloads/detail?name=fme-datalist-extension-share.jar) to tomcat/webapps/share/WEB-INF/lib.

To avoid warnings generated by poi lib when exporting datalists you should add the following config to your JAVA\_OPTS to enable awt headless mode:
`-Djava.awt.headless=true`

## Migration of existing datalists ##
Existing datalists have to be migrated/upgrade to be used within this extension.

Use http://code.google.com/p/share-extras/wiki/JavascriptConsole to execute http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/fme%20extended%20Datalist%20-%20Repository/post-deploy/migrate-datalist.js

## Source Code ##
Thus these extension aren't compatible with Alfresco 4.x the Source Code is available in our pre-4x. branch:
`http://fme-alfresco-extensions.googlecode.com/svn/branches/pre-4.x/`


---

powered by [fme](http://www.fme.de)

