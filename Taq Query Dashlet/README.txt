Tag Query dashlet for Alfresco Share
===============================================

Author: Jan Pfitzner (jan@alfrescian.com) supported by fme.de

This project defines a custom site-dashlet that displays a document list using a tag query
Installation
------------

The dashlet has been developed to install on top of an existing Alfresco
3.4 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' or tomcat/webapps/share/WEB-INF/lib folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named tag-query-dashlet.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the dashlet
-----------------

Log in to Alfresco Share and navigate to the  dashboard of a site where you are SiteManager. Click the 
Customize Dashboard button to edit the contents of the dashboard and drag 
the dashlet into one of the columns from the list of dashlets.
An "configure" link will be shown to all SiteManagers of the site. It's possible to configure the following:
- Dashlet title
- tag to list documents for
- rows per page - the number of documents that should be displayed on one page