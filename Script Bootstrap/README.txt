Script Bootstrap for Alfresco Repository
========================================

Author: Florian Maul (fme AG)

This project defines a repository extension that executes javascript files at 
startup time to bootstrap content or configure the repository via Javascript.


Installation
------------

The add-on has been developed to install on top of an existing Alfresco
3.4 installation.

An Ant build script is provided to build a JAR file containing the 
custom files. As this is a Java based repository extension you have to copy 
the jar file to the 'tomcat/webapps/alfresco/WEB-INF/lib' folder.

To build the JAR file, run the following command from the base project 
directory.

    ant -Dalfresco.sdk.dir=<path to Alfreso SDK> clean dist-jar

The command should build a JAR file named fme-script-bootstrap.jar
in the 'build/dist' directory within your project.

To deploy the extension files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the Script Bootstrap extension
------------------------------------

1. When the jar is installed in the alfresco webapp it looks for scripts in
   the classpath. All scripts matching this pattern are executed:

   alfresco/extension/bootstrap-scripts/*.js

2. You can put as many javascript files as you like into the 
   tomcat/shared/classes/alfresco/extension/bootstrap-scripts/ folder or
   into a corresponding folder in a JAR file.
   
3. The scripts are executed at each startup of the Alfresco repo:
   - All scripts are executed with the user "admin"
   - Each script runs in it's own transaction
   - Scripts are executed sequentially, the order is unspecified
   - Script variables document and space are both set to companyhome
   
4. See the examples directory in the source control for example scripts.
   
