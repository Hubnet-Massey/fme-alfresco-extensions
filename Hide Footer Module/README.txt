Hide Footer Module for Alfresco Share
=======================================

Author: Florian Maul (fme AG)

This project demonstrates the use of the new Share Module extensions
in Alfresco 4.0 to remove the footer in Alfresco Share. 

Installation
------------

The add-on has been developed to install on top of an existing Alfresco
4.0 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation. 

To build the JAR file, run the following command from the base project 
directory.

    ant -Dalfereco.sdk.dir=<path to Alfreso SDK> clean dist-jar

The command should build a JAR file named fme-hide-footer.jar
in the 'build/dist' directory within your project.

To deploy the files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the Module
-----------------

Log in to Alfresco Share and enjoy more screen real estate in Alfresco Share
as the Module is automatically enabled. To disable the Module go to:
http://localhost:8080/share/page/modules/deploy

