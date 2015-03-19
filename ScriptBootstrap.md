

# Script Bootstrap extension #

Author: Florian Maul

This project defines a repository extension that executes javascript files at server startup time to bootstrap content or configure the repository via Javascript. It can be used to ensure certain nodes exist, create test data at startup or perform clean up operations, whatever you need to do.

I recommend using the [Javascript Console](http://code.google.com/p/share-extras/wiki/JavascriptConsole) to help creating the javascript files that can be executed with this extension.

## Features ##

This is really simple extension that does the following:
  * run once at Alfreco server startup time (bootstrap)
  * look for javascript files in a classpath folder
  * executes all javascript files with the admin privileges

## Installation ##

The add-on has been developed to install on top of an existing Alfresco
3.4 installation.

You need to copy the **fme-script-bootstrap.jar** into the alfresco web app because it contains Java classes that need access to the Alfresco repository services. I would suggest to do the following:
  * Extract alfresco.war or let tomcat do it
  * Copy fme-script-bootstrap.jar to tomcat/webapps/alfresco/WEB-INF/lib/
  * Create the folder tomcat/shared/classes/alfresco/extension/bootstrap-scripts
  * See below on: Using the Script Bootstrap extension
  * (Re-)start Alfresco.

## Using the Script Bootstrap extension ##

  * When the jar is installed in the alfresco webapp it looks for scripts in the classpath. All scripts matching this pattern are executed: alfresco/extension/bootstrap-scripts/`*`.js
  * In the sourcecode repository you can find [two example scripts](http://code.google.com/p/fme-alfresco-extensions/source/browse/trunk/Script+Bootstrap/#Script%20Bootstrap%2Fexamples%2Fbootstrap-scripts):
![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Script%20Bootstrap/documentation/screenshot_01.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Script%20Bootstrap/documentation/screenshot_01.png)
  * The example script [create project structure.js](http://code.google.com/p/fme-alfresco-extensions/source/browse/trunk/Script+Bootstrap/examples/bootstrap-scripts/create+project+structure.js) creates a folder structure in a Share site like this:
![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Script%20Bootstrap/documentation/screenshot_02.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Script%20Bootstrap/documentation/screenshot_02.png)
  * You can put as many javascript files as you like into the tomcat/shared/classes/alfresco/extension/bootstrap-scripts/ folder or into a corresponding folder in any JAR file.
  * The scripts are executed at each startup of the Alfresco repository
    * All scripts are executed with the user "admin"
    * Each script runs in it's own transaction
    * Scripts are executed sequentially, the order is unspecified
    * Script variables document and space are both set to companyhome

## Building from Source ##

An Ant build script is provided to build a JAR file containing the
custom files, which can then be installed into the 'tomcat/alfresco/WEB-INF/lib' folder of your Alfresco installation.

To build the JAR file, run the following command from the base project
directory.

> ant clean dist-jar

The command should build a JAR file named fme-script-bootstrap.jar in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can use the hotcopy-tomcat-jar task. You will need to set the tomcat.home property in Ant.

> ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

Once you have run this you will need to restart Tomcat so that the classpath resources in the JAR file are picked up.