/**
 * Copyright (C) 2012 fme AG.
 *
 * This file is part of the myGengo Alfresco integration implmented by fme AG (http://alfresco.fme.de).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (typeof MyGengo == "undefined") MyGengo={};
MyGengo.util = MyGengo.util || {};

MyGengo.util.getLanguageName = function (languages, languageCode){
	var language = MyGengo.util.getLanguage(languages, languageCode);
	if (language){
		return language.language;
	}
	return languageCode;
};
MyGengo.util.getLanguage = function (languages, languageCode){
	var len =languages.length;
	for(var i=0; i<len; i++) {
		var languagePair = languages[i];
		var source = languagePair.source;
		var target = languagePair.target;
		if (source.languageCode === languageCode){
			return source;
		}
		if (target.languageCode === languageCode){
			return target;
		}
	};
	return languageCode;
};
MyGengo.util.eta = function (from, to){
	var $msg = Alfresco.util.message
	if (YAHOO.lang.isUndefined(to))
	{
		to = new Date();
	}

	var in_seconds = ((to - from) / 1000),
	in_minutes = Math.floor(in_seconds / 60);

	if (in_minutes <= 0)
	{
		return $msg("myGengo.relative.seconds",this, in_seconds);
	}
	if (in_minutes == 1)
	{
		return $msg("myGengo.relative.minute",this);
	}
	if (in_minutes < 45)
	{
		return $msg("myGengo.minutes",this, in_minutes);
	}
	if (in_minutes < 90)
	{
		return $msg("myGengo.relative.hour",this);
	}
	var in_hours  = Math.round(in_minutes / 60);
	if (in_minutes < 1440)
	{
		return $msg("myGengo.relative.hours",this, in_hours);
	}
	if (in_minutes < 2880)
	{
		return $msg("myGengo.relative.day",this);
	}
	var in_days  = Math.round(in_minutes / 1440);
	if (in_minutes < 43200)
	{
		return $msg("myGengo.relative.days",this, in_days);
	}
	if (in_minutes < 86400)
	{
		return $msg("myGengo.relative.month",this);
	}
	var in_months  = Math.round(in_minutes / 43200);
	if (in_minutes < 525960)
	{
		return $msg("myGengo.relative.months",this, in_months);
	}
	if (in_minutes < 1051920)
	{
		return $msg("myGengo.relative.year",this);
	}
	var in_years  = Math.round(in_minutes / 525960);
	return $msg("myGengo.relative.years",this, in_years);
};

/**
 * Creates a "disclosure twister" UI control from existing mark-up.
 *
 * @method MyGengo.util.createTwister
 * @param p_controller {Element|string} Element (or DOM ID) of controller node
 * <pre>The code will search for the next sibling which will be used as the hideable panel, unless overridden below</pre>
 * 
 * @param p_config {object} Optional additional configuration to override the defaults
 * <pre>
 *    panel {Element|string} Use this panel as the hideable element instead of the controller's first sibling
 *    collapsed {boolean} Whether the twister should be drawn collapsed upon creation
 * </pre>
 * @return {boolean} true = success
 */
MyGengo.util.createTwister = function(p_controller, p_config)
{
   var defaultConfig =
   {
      panel: null,
      collapsed: null,
      CLASS_BASE: "alfresco-twister",
      CLASS_OPEN: "alfresco-twister-open",
      CLASS_CLOSED: "alfresco-twister-closed"
   };
   
   var elController, elPanel,
      config = YAHOO.lang.merge(defaultConfig, p_config || {});
   
   // Controller element
   elController = YUIDom.get(p_controller);
   if (elController === null)
   {
      return false;
   }
   
   // Panel element - next sibling or specified in configuration
   if (config.panel && YUIDom.get(config.panel))
   {
      elPanel = YUIDom.get(config.panel);
   }
   else
   {
      // Find the first sibling node
      elPanel = elController.nextSibling;
      while (elPanel.nodeType !== 1 && elPanel !== null)
      {
         elPanel = elPanel.nextSibling;
      }
   }
   if (elPanel === null)
   {
      return false;
   }

   
   if (config.collapsed === null)
   {
      config.collapsed = true;
   }

   // Initial State
   YUIDom.addClass(elController, config.CLASS_BASE);
   YUIDom.addClass(elController, config.collapsed ? config.CLASS_CLOSED : config.CLASS_OPEN);
   YUIDom.setStyle(elPanel, "display", config.collapsed ? "none" : "block");
   
   YUIEvent.addListener(elController, "click", function(p_event, p_obj)
   {
      // Update UI to new state
      var collapse = YUIDom.hasClass(p_obj.controller, config.CLASS_OPEN);
      if (collapse)
      {
         YUIDom.replaceClass(p_obj.controller, config.CLASS_OPEN, config.CLASS_CLOSED);
      }
      else
      {
         YUIDom.replaceClass(p_obj.controller, config.CLASS_CLOSED, config.CLASS_OPEN);
      }
      YUIDom.setStyle(p_obj.panel, "display", collapse ? "none" : "block");

   },
   {
      controller: elController,
      panel: elPanel
   });
};