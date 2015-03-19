

# Alfresco Share Developer Tools Menu #

Author: Florian Maul

This project adds a developers menu to the Alfresco Share menu to make all the
most important developer tools available on every page of Alfresco share.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Devtools%20Menu/fme-alfresco-devtools-share/screenshots/devtools-menu-01.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Devtools%20Menu/fme-alfresco-devtools-share/screenshots/devtools-menu-01.png)


## Installation ##

The component has been developed to install on top of an existing Alfresco
4.x installation. There are two different version in this archive with
a specific folder for each of the Alfresco version.

The extensions is distributed as a single jar file that can be copied to the shared folder. It only contains Share extensions and no extensions to the Alfresco repository (at least at the moment).

The file fme-alfresco-devtools-share-0.1.jar needs to be copied to:

> tomcat/shared/lib/

If you are running this extension on a different host/port than localhost:8080
you might want to change the URLs used within the developer menu. Add the
following entry to your share-custom-config.xml and change the URLs to reflect
your Alfresco setup:

> `<config evaluator="string-compare" condition="DevTools">`
> > `<devtools>`
> > > `<explorerBaseUrl>http://127.0.0.1:8080/alfresco</explorerBaseUrl>`
> > > `<solrAdminUrl>https://127.0.0.1:8443/solr/alfresco/admin/</solrAdminUrl>`

> > `</devtools>`

> `</config>`

Most of the time the devtools menu used Share's proxy to access the repository
but for some links these URLs are needed.

## Using the component ##

  * The devtools menu is implemented as a Share module, that means you have to go to http://localhost:8080/share/page/modules/deploy to enable the menu.

  * After enabling the "fme Devtools Menu" module, the menu will appear in the Share
header.

## Building ##

To build the individual JAR files, run the following command from the base
project directory.

> ant -Dalfresco.sdk.dir=c:\dev\sdks\alfresco-enterprise-sdk-4.0.0 clean dist-jar

The command should build a JAR file named fme-alfresco-devtools-share-0.1.jar

To deploy the extension files into a local Tomcat instance for testing, you can
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

> ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

Once you have run this you will need to restart Tomcat so that the classpath
resources in the JAR file are picked up.