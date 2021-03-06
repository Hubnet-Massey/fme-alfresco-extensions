Gallery Plus dashlet for Alfresco Share
=======================================

Author: Florian Maul (fme AG)

This project defines a custom dashlet that displays an image gallery and an 
image preview dialog.


Installation
------------

The add-on has been developed to install on top of an existing Alfresco
3.4 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation. Since this dashlet also contains repository 
extends (Action, Behaviour) you also have to copy the jar file to the 
'tomcat/webapps/alfresco/WEB-INF/lib' folder.

To build the JAR file, run the following command from the base project 
directory.

    ant -Dalfereco.sdk.dir=<path to Alfreso SDK> clean dist-jar

The command should build a JAR file named fme-gallery-plus-dashlet.jar
in the 'build/dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the dashlet
-----------------

Log in to Alfresco Share and navigate to your user or a site dashboard. 
Click the Customize Dashboard button to edit the contents of the dashboard 
and drag the dashlet into one of the columns from the list of dashlets.

