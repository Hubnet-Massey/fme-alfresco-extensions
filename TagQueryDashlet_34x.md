_**This wiki pages describes the Tag Query Dashlet for Alfresco 3.4.x**

wiki page of the Alfresco 4.x version compliant dashlet_**: [Tag Query Dashlet for Alfresco 4.x](TagQueryDashlet_4x.md)

---**

#summary tag query dashlet for Alfresco Share which displays all documents of a site that are tagged with a configurable tag


# Tag Query Dashlet for Alfresco Share #

Author: Jan Pfitzner ([alfrescian.com](http://alfrescian.com) & [twitter.com/alfrescian](http://twitter.com/alfrescian))

This project defines a tag query document dashlet for the Alfresco Dashlet Challenge 2011.
The dashlet displays a list of documents that are tagged with a configurable tag.

## Features ##

Following features are implemented:
  * display a thumbnail of the documents on mouse-over.
  * display the favorite status & allows the user to mark/unmark a document as favorite
  * list uses paging with a configurable page size
  * end user friendly configuration dialog (only accessible for SiteManagers)


### Repository Web-Script changes ###

To reuse the tag-picker control in the dashlet configuration dialog the repository webscript controller org/alfresco/repository/forms/pickeritems.post.json.js gets a small modification. It now support a text-based tag as parameter & not only a nodeRef-based tag param.

### Browser support ###
  * Chrome and Firefox have been tested and work fine


## Installation ##

The component has been developed to install on top of an existing Alfresco
3.4 installation.

You need to copy the **tag-query-dashlet.jar** to tomcat/shared/lib.


## Building from Source ##

An Ant build script is provided to build a JAR file containing the
custom files, which can then be installed into the 'tomcat/shared/lib' folder
of your Alfresco installation.


To build the JAR file, run the following command from the base project
directory.

> ant clean dist-jar

The command should build a JAR file named tag-query-dashlet.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

> ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

Once you have run this you will need to restart Tomcat so that the classpath
resources in the JAR file are picked up.

## Using the dashlet ##

Please do the following steps to get the dashlet running:

  * Log in to Alfresco Share and navigate to site dashboard where you are SiteManager Click the Customize Dashboard button to edit the contents of the dashboard and drag the dashlet into one of the columns from the list of dashlets.
Return to your site dashboard & click the configure link to open the configuration dialog of the dashlet:

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/configure-dialog.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/configure-dialog.png)

Once configured your dashlet should look like this:

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/tag-query-dashlet.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Taq%20Query%20Dashlet/documentation/tag-query-dashlet.png)

## Roadmap ##

Following features are on the roadmap:
  * add support of categories
  * add support of wiki pages, links, blog posts etc.
  * support user-dashlet mode
  * add nice & smart content preview dialog

---

powered by [fme](http://www.fme.de)