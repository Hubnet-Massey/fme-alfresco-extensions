
# TOPX Dashlet for Alfresco Share #

Author: Jens Goldhammer

This project defines a top x documents dashlet for the Alfresco Dashlet Challenge 2011.
The dashlet displays the most downloaded documents in the repository
by using a custom aspect "topx:countable". Only documents with a hitcounter
bigger than 3 are displayed in the list.

## Features ##

The dashlet shows the documents with the biggest hitcount (property of custom aspect).

Following features are implemented:
  * display thumbnail of the documents with hover effect and hit image in it.
  * download the document directly with tooltip (content size and mimetype)
  * jump to the parent folder of the document with tooltip (display path of the folder)
  * jump to the document details of the documents
  * displays the hitcount, creation/modify date and creator /modifier of the document

Caveeats:
  * Maxitems is fix at the moment (no configuration provided)

### Repository Backend ###

To track the downloads, a java behaviour for the custom aspect was written
which gets informed about the download of a node. Please note that the behaviour only counts one download of a user per day for a certain document.

Please note that downloading content from admin users does not increase the counter!
**Please test with a normal user account!!!**

### Browser support ###
  * Chrome and Firefox have been tested and work fine


## Installation ##

The component has been developed to install on top of an existing Alfresco
3.4 installation.

You need to copy the **fme-topx-dashlet.jar** to two places because it contains Java classes that have to go into the Alfresco repository. I would suggest to do the following:
  * Extract alfresco.war or let tomcat do it
  * Unpack the fme-topx-dashlet-0.1.zip
  * Copy fme-topx-dashlet-0.1.jar to tomcat/webapps/alfresco/WEB-INF/lib/
  * Copy the jackson librars to tomcat/webapps/alfresco/WEB-INF/lib/ - they are needed by the webscript.
  * Copy fme-topx-dashlet-0.1.jar to tomcat/shared/lib – this is where Share will pick it up.
  * Edit tomcat/shared/classes/web-extension/share-config-custom.xml and add the countable aspect
  * (Re-)start Alfresco.


## Building from Source ##

An Ant build script is provided to build a JAR file containing the
custom files, which can then be installed into the 'tomcat/shared/lib' folder
of your Alfresco installation.


To build the JAR file, run the following command from the base project
directory.

> ant clean dist-jar

The command should build a JAR file named node-browser.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

> ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

Once you have run this you will need to restart Tomcat so that the classpath
resources in the JAR file are picked up.

## Using the dashlet ##

Please do the following steps to get the dashlet running:

  * Log in to Alfresco Share and navigate to your user dashboard. Click the Customize Dashboard button to edit the contents of the dashboard and drag the dashlet into one of the columns from the list of dashlets. As well as user dashboards the dashlet can also be used on site dashboards. The dashlet should look like below.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/TopX%20Dashlet/documentation/(1)%20Alfresco%20Share%20%C2%BB%20User%20Dashboard%20-%20TOPX%20Dashlet.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/TopX%20Dashlet/documentation/(1)%20Alfresco%20Share%20%C2%BB%20User%20Dashboard%20-%20TOPX%20Dashlet.png)

  * Create a example site, navigate to the documents-folder (documentLibrary) and create a rule for this folder.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/TopX%20Dashlet/documentation/(2)attach_hitcounter_rule_share.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/TopX%20Dashlet/documentation/(2)attach_hitcounter_rule_share.png)

  * Upload some example documents in the share site. Try to download the file several times (Caveat: Share or Repository caches the downloaded file, so the download of a file will only count the first time!!)

  * You can use the javascript file to add some example hitcount values to your example documents.

Please modify the path variable in line 4
-- var path='PATH:"/app:company\_home/st:sites/cm:demosite/cm:documentLibrary//**"'; --**


## Testing ##

Testing the search webscript via url

http://localhost:8080/alfresco/service/de/fme/dashlet/topx/find?queryType=d&maxItems=10

## Roadmap ##

Following features are on the roadmap:
  * clicking on the thumbnail should open the web previewer to display a preview of the document
  * provide a configuration dialog