TOP X Dashlet for Alfresco Share
=======================================================

Author: Jens Goldhammer

This project defines a top x documents dashlet for the Alfresco Dashlet Challenge 2011.
The dashlet displays the most downloaded documents in the repository 
by using a custom aspect "topx:countable". Only documents with a hitcounter 
bigger than 3 are displayed in the list.

To track the downloads, a java behaviour for the custom aspect was written 
which gets informed about the download of a node. Please note that the behaviour 
only counts one download of a user per day for a certain document. 

Features
---------

The dashlet shows the documents with the biggest hitcount (property of custom aspect).
Following features are implemented:
- display thumbnail of the documents with hover effect and hit image in it.
- download the document directly with tooltip (content size and mimetype)
- jump to the parent folder of the document with tooltip (display path of the folder) 
- jump to the document details of the documents
- displays the hitcount, creation/modify date and creator /modifier of the document

Caveeats:
- Maxitems is fix at the moment (no configuration provided)


Installation
------------

The component has been developed to install on top of an existing Alfresco
3.4 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named node-browser.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the dashlet
-----------------

Please do the following steps to get the dashlet running:
(1) Log in to Alfresco Share and navigate to your user dashboard. Click the 
Customize Dashboard button to edit the contents of the dashboard and drag 
the dashlet into one of the columns from the list of dashlets. As well as user dashboards 
the dashlet can also be used on site dashboards. The dashlet should look like in file '(1) Alfresco Share � User Dashboard - TOPX Dashlet.png' 
(2) Create a example site, navigate to the documents-folder (documentLibrary) and 
create a rule (as can be seen in documentation/(2)attach_hitcounter_rule_share.png) for this folder.
(3) Upload some example documents in the share site. Try to download the file 
several times (Caveat: Share or Repository caches the downloaded file, 
so the download of a file will only count the first time!!)
(3a) You can use the javascript file to add some example hitcount values to your example documents. 
Please modify the path variable in line 4
-- var path='PATH:"/app:company_home/st:sites/cm:demosite/cm:documentLibrary//*"'; --  

Testing
---------

Testing the search webscript via url
http://localhost:8080/alfresco/service/de/fme/dashlet/topx/find?queryType=d&parentId=workspace://SpacesStore/b14f1728-9ff8-4762-bf27-d47289d93da5&maxItems=50

Roadmap
-------
Following features are on the roadmap:
- clicking on the thumbnail should open the web previewer 
to display a preview of the document
- better configuration


