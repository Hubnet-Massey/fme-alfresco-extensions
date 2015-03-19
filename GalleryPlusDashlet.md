

# Introduction #

The Gallery Plus dashlet was developed for the [2011 Alfresco dashlet challenge](http://www.alfresco.com/community/resources/tools/dashlet-challenge/) by [Florian Maul](http://twitter.com/fmaul). It is an image gallery dashlet that features a thumbnail view, an albums view and an popup dialog with an image preview.

**Update 2011-11-01:** Some background on the programming logic of the grid rendering can be found in my blog: http://www.techbits.de/2011/10/25/building-a-google-plus-inspired-image-gallery/

<a href='http://www.youtube.com/watch?feature=player_embedded&v=gtzGvTRXt24' target='_blank'><img src='http://img.youtube.com/vi/gtzGvTRXt24/0.jpg' width='425' height=344 /></a>

## Features ##

### The thumbnail view ###
  * Self-aligning grid that neatly aligns images of all dimensions
  * Images reflow when the window is resized and support dashlets of any size.
  * Automatic reloading while scrolling
  * Number of comments displayed in a small badge
  * Two different sizes of thumbnails (120px height and 200px height)
  * Images can be filtered by path or tags
  * Images can be sorted by an arbitrary property
  * Fade in/out animations to make things look smoother

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-01.jpg](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-01.jpg)

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-04.jpg](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-04.jpg)

### The album view ###
  * Gives an overview over all album (aspect) folders in the repository
  * Displays albums with an image stack effect
  * Albums can be filtered by folder path

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-02.jpg](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-02.jpg)

### The image preview ###
  * The image preview gives a 800x600 view of the image
  * Images can be navigates by mouse (click the arrows), keyboard cursor keys and mouse wheel.
  * It displays the title and description of the image
  * It provides actions to jump to the document details page and to download the original image file.
  * On the right hand side it presents all comments for an image lets the user add a comment (if he has the permissions to do so).

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-03.jpg](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-03.jpg)

### General ###
  * can be used as user or site dashlet
  * no restriction to a site, so images can be from any folder in the repository
  * Localizable, ships with english and german language
  * Can be used in mutliple instances on a single dashboard:

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-05.jpg](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-05.jpg)


### Repository Backend ###
  * Thumbnails can be created on demand but usually it is better to habe them created initially. A special Album aspect and a custom Action is provided to make thumbnail generation very easy.
  * The Album aspect is used to mark folders as albums and images placed in an album folder are automatically “thumbnailed”.

### Browser support ###
  * Chrome, Firefox, Safari have been tested and work fine
  * IE9 would work quite well, but is not fully supported by 3.4.x (ALF-9282)
  * IE9 (compatibility mode), IE8 work somehow but you are missing all of the bling.
  * Safari on iOS works, but quite slowly


# Installation #

The component has been developed to install on top of an existing Alfresco 3.4 installation.

You need to copy the **fme-gallery-plus-dashlet.jar** to two places because it contains Java classes that have to go into the Alfresco repository. I would suggest to do the following:
  * Extract alfresco.war or let tomcat do it
  * Copy fme-gallery-plus-dashlet.jar to tomcat/webapps/alfresco/WEB-INF/lib/
  * Copy fme-gallery-plus-dashlet.jar to tomcat/shared/lib – this is where Share will pick it up.
  * (Re-)start Alfresco.

# Using the Gallery Plus Dashlet #

  * The easiest way is to just add the dashlet to your user or site dashboard. By default it will display all images in your repository. Since it needs to generate thumbnails for your images this can take some time at the first run.
  * You can use the dashlet configuration dialog to further filter the images. See GalleryPlusDashletConfiguration for more info on the options.
  * It is recommended to make use of the Album aspect. If you add the Album aspect to a folder thumbnails are automatically generated for all the images inside of that folder.
  * All folders that have to album aspect assigned, will show up as image stacks in the album view.

# Building from Source #

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