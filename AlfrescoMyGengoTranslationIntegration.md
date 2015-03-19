
# Alfresco myGengo translation integration #

Author: fme AG ([alfresco.fme.de](http://alfresco.fme.de) & alfresco(at)fme.de)

This module was made for [myGengo.com](http://mygengo.com) to integrate myGengo's translation service into Alfresco & enabling Alfresco users to order fast, cost-effective, and professional translations of any content stored in their Alfresco Repository using Alfresco Share.

## Features ##

### Add myGengo Page component ###
A SiteManager of an Alfresco Share Site can add the myGengo component to a Site using the standard Customize-Site functionalities.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/customize-site.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/customize-site.png)

### Sign in to myGengo ###
Only a SiteManager of an Alfresco Share Site is able to manage the site specific myGengo account settings (myGengo API credentials) using myGengo Passport:

The myGengo API, like many others, relies on a system of API keys to sign and authenticate requests with. By authorizing the module via myGengo Passport these API keys are getting stored in the Alfresco Repository and will be used for any further myGengo API calls by the module in the scope of the current site.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/account.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/account.png)

Currently the Passport mechanismn is not supported by myGengo's sandbox (test system). If like to test the module using the myGengo sandbox, then you've to set the API-Keys manually, e.g. by configuring & running the following script in the JavaScript Console:
```
//Provide your settings here
var site = ""; //Site shortname
var publicKey = "" // http://sandbox.mygengo.com/account/api_settings
var privateKey = "" // http://sandbox.mygengo.com/account/api_settings

//We need to set API keys here manually because passport authentication is not supported in myGengo's sandbox (test environment)
var node = siteService.getSite(site).getContainer("myGengo");
var account = myGengo.loadAccountInfo(publicKey, privateKey, "fme-Alfresco-myGengo-mygengo");
myGengo.saveAccount(node, account);
myGengo.loadLanguages(node);
print("API Key set & language pairs loaded");
```

### Ordering a new Translation ###

Once, the myGengo credentials are provided every member of the Site having at least SiteContributor permissions is able to request a new translation.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-order.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-order.png)

### List of translations ###
The translation list is the central UI component of the module and lists all requested translations of the site. As usual within Share a list of actions is rendered on mouse-over event of a translation. The _View..._ action can also be triggered using a double click.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-list.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-list.png)

### View a translation ###
When executing the _View..._action of a translation it will be displayed within a popup dialog that is rendered by Alfresco's FormService.

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-view.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-view.png)

### Comment a translation ###
![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-comment.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-comment.png)

### Approve a translation ###
![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-approve.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/job-approve.png)

### Translate a document ###
![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/document-translate.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/documentation/document-translate.png)


## Compatibility ##
In general, the extension is compatible with Alfresco 3.4.x & 4.0.x.
The _Translate..._ Document Library action uses Alfresco Share's 4.0 extension capabilities & won't be visible in an 3.4.x system.

## Installation & Configuration ##
You need to copy:
  * **fme-myGengo-share.jar** to tomcat/shared/lib or tomcat/webapps/share/WEB-INF/lib
  * **fme-myGengo-repository.jar** to tomcat/webapps/alfresco/WEB-INF/lib.

If you like to use the myGengo sandbox (http://sandbox.mygengo.com/) & not the Live system, then simply add the following config to your _alfresco-global.properties_:
  * **`mygengo.sandbox=true`**

Per default your Alfresco system will poll the myGengo API for translation updates every 5 minutes. You can adjust the setting to your needs by modifying the following property in your _alfresco-global.properties_:
  * **`mygengo.polling.interval=5`**

## Source Code ##
`http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo`


---

powered by [fme](http://www.fme.de)

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/source/web/themes/myGengoTheme/images/app-logo.png](http://fme-alfresco-extensions.googlecode.com/svn/trunk/myGengo/myGengo%20Share%20Theme/source/web/themes/myGengoTheme/images/app-logo.png) ![http://www.fme.de/uploads/pics/fmergb_38.jpg](http://www.fme.de/uploads/pics/fmergb_38.jpg)

