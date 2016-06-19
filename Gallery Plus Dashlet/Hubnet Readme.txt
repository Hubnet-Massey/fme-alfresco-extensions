Changes To Galley Plus Dashlet Specific to Hubnet

The Build.xml has been altered to use the required libraries from the extracted contents of the unaltered alfresco.war file.
The following parameter is required when running the build script:

 "-Dalfresco.war=${alfresco.war}"
 
Where ${alfresco.war} is the path to the directory containing the extracted contents of the war file.

