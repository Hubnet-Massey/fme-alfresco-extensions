_**This wiki pages describes the Tag Query Dashlet for Alfresco 4.x**

wiki page of the Alfresco 3.4.x version compliant dashlet_**:
[Tag Query Dashlet for Alfresco 3.4.x](TagQueryDashlet_34x.md)

---**



# Tag Query Dashlet for Alfresco Share #

Author: Jan Pfitzner ([alfrescian.com](http://alfrescian.com) & [twitter.com/alfrescian](http://twitter.com/alfrescian))

This project defines a tag query document dashlet for the Alfresco Dashlet Challenge 2011.
The dashlet displays a list of documents that are tagged with a configurable tag.
**version 0.3.1 also displays tagged folders**

## Features ##
Dashlet now uses the new Alfresco 4.x Dashlet layout/features:

Following features are implemented:
  * simple & detail view
  * display a thumbnail of the documents (simple view: on mouse-over).
  * display the favorite status & allows the user to mark/unmark a document as favorite (detail view only)
  * display the likes & allows the user to like/unlike a document (detail view only)
  * display a link to comment on a document (detail view only)
  * list uses paging with a configurable page size
  * end user friendly configuration dialog (only accessible for SiteManagers)


### Repository Web-Script changes ###

To reuse the tag-picker control in the dashlet configuration dialog the repository webscript controller org/alfresco/repository/forms/pickeritems.post.json.js gets a small modification. It now support a text-based tag as parameter & not only a nodeRef-based tag param.

### Browser support ###
  * Chrome and Firefox have been tested and work fine


## Installation ##

The component has been developed to install on top of an existing Alfresco 4.0.b (Community)

You need to copy the **tag-query-dashlet.jar** to tomcat/shared/lib.

## Using the dashlet ##

Please do the following steps to get the dashlet running:

  * Log in to Alfresco Share and navigate to site dashboard where you are Site-Manager Click the Customize Dashboard button to edit the contents of the dashboard and drag the dashlet into one of the columns from the list of dashlets.
Return to your site dashboard & click the configure/edit icon in the dashlet header to open the configuration dialog of the dashlet:

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/tag-query-dashlet-config-4.x.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/tag-query-dashlet-config-4.x.png)

Once configured your dashlet should look like this:

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/tag-query-dashlet-4.x.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/tag-query-dashlet-4.x.png)

## Roadmap ##

Following features are on the roadmap:
  * add support of categories
  * add support of wiki pages, links, blog posts etc.
  * support user-dashlet mode
  * add nice & smart content preview dialog

---

powered by [fme](http://www.fme.de)