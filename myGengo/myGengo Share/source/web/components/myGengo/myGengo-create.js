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

/**
 * MyGengo create job component.
 * 
 * @namespace MyGengo
 * @class MyGengo.CreateJob
 */
if (typeof MyGengo == "undefined") MyGengo={};

(function()
		{
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom,
	Event = YAHOO.util.Event,
	Element = YAHOO.util.Element;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML,
	$date = function $date(date, format) { return Alfresco.util.formatDate(Alfresco.util.fromISO8601(date), format); };

	/**
	 * MyGengo.CreateJob constructor.
	 * 
	 * @param {String} htmlId The HTML id of the parent element
	 * @return {MyGengo.Toolbar} The new Toolbar instance
	 * @constructor
	 */
	MyGengo.CreateJob = function(htmlId)
	{
		this.name = "MyGengo.CreateJob";
		this.id = htmlId;

		/* Register this component */
		Alfresco.util.ComponentManager.register(this);

		this.widgets = {};

		/* Load YUI Components */
		Alfresco.util.YUILoaderHelper.require(["button", "container", "datasource", "datatable", "json"], this.onComponentsLoaded, this);

		/* Decoupled event listeners */
		YAHOO.Bubbling.on("deactivateAllControls", this.onDeactivateAllControls, this);

		return this;
	};
	/**
	 * Extend from Alfresco.component.Base
	 */
	YAHOO.extend(MyGengo.CreateJob, Alfresco.component.Base);


	/**
	 * Augment prototype with main class implementation, ensuring overwrite is enabled
	 */
	YAHOO.lang.augmentObject(MyGengo.CreateJob.prototype,
			{

		/**
		 * Object container for initialization options
		 *
		 * @property options
		 * @type object
		 */
		options:
		{
			/**
			 * Current siteId.
			 * 
			 * @property siteId
			 * @type string
			 */
			siteId: "",

			/**
			 * Role of current user.
			 * 
			 * @property userRole
			 * @type string
			 */
			userRole:"None",

			/**
			 * Available languages.
			 * 
			 * @property languages
			 * @type string
			 */
			languages: null

		},



		/**
		 * Fired by YUI when parent element is available for scripting.
		 * Component initialisation, including instantiation of YUI widgets and event listener binding.
		 *
		 * @method onReady
		 */
		onReady: function MyGengoCreateJob_onReady()
		{
			if (this.options.languages === null){
				Alfresco.util.PopupManager.displayPrompt(
						{
							text: this.msg("message.languages.failed")
						});
			}

			this.textElement = Dom.get(this.id + "-text");
			this.slugElement = Dom.get(this.id + "-slug");

			this.widgets.orderButton = Alfresco.util.createYUIButton(this, "orderButton", this.onOrder);
			this.widgets.quoteButton = Alfresco.util.createYUIButton(this, "quoteButton", this.onQuote);
			Alfresco.util.disableYUIButton(this.widgets.orderButton);
			Alfresco.util.disableYUIButton(this.widgets.quoteButton);

			this._initializeLanguages();

			this._initializeTiers();
			
			var params = Alfresco.util.getQueryStringParameters();
			if (params.nodeRef){
				var uri = YAHOO.lang.substitute( Alfresco.constants.PROXY_URI + "api/mygengo/content?nodeRef={nodeRef}", {
					nodeRef : params.nodeRef
				});
				
		         Alfresco.util.Ajax.request(
		         {
		            method: Alfresco.util.Ajax.GET,
		            url: uri,
		            successCallback:
		            {
		               fn: function MyGengoCreateJob_onReady_successCallback(response, config)
		               {
		            	   this.textElement.value = response.serverResponse.responseText;
		            	   this.onChangeStatusMessage();
		               },
		               scope: this
		            },
		            failureMessage: Alfresco.util.message("message.failure"),
		            scope: this
		         });
			}

			Event.addListener(this.textElement, "keyup", this.onChangeStatusMessage, null, this);
			this.onChangeStatusMessage();

			Event.addListener(this.textElement, "keyup", this.onMandatoryControlValueUpdated, null, this);
			Event.addListener(this.slugElement, "keyup", this.onMandatoryControlValueUpdated, null, this);
			this.onMandatoryControlValueUpdated();

			//Finally show the component body here to prevent UI artifacts on YUI button decoration
			Dom.setStyle(this.id + "-body", "visibility", "visible");
		},

		/**
		 * onOrder event handler
		 *
		 * @method onOrder
		 * @param layer {object} Event fired
		 * @param args {array} Event parameters (depends on event type)
		 */
		onOrder: function MyGengoCreateJob_onOrder(layer, args){
			this.onDeactivateAllControls();
			this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
					{
						text: this.msg("message.order.wait"),
						spanClass: "wait",
						displayTime: 0
					});
			var jsonPayload = {};
			jsonPayload.source = Dom.get(this.id + "-source").value;
			jsonPayload.target = Dom.get(this.id + "-target").value;
			jsonPayload.tier = this.currentTier.tier;
			jsonPayload.text = this.textElement.value;
			jsonPayload.slug = this.slugElement.value;
			jsonPayload.comment = Dom.get(this.id + "-comment").value;
			jsonPayload.autoApprove = Dom.get(this.id + "-autoApprove").checked;

			var uri = YAHOO.lang.substitute( Alfresco.constants.PROXY_URI + "api/mygengo/site/{site}/{container}/job", {
				site : Alfresco.constants.SITE,
				container: "myGengo"
			});
			var config = {
					url: uri,
					dataObj: jsonPayload,
					successCallback :{
						fn : this.onOrderSuccess,
						scope: this  
					},
					failureCallback :{
						fn : function(response){
							this.onMandatoryControlValueUpdated()
							this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
									{
										text: this.msg("message.order.failed", response.json ? response.json.message : response.message)
									});	
						},
						scope: this  
					},
			};
			Alfresco.util.Ajax.jsonPost(config);
		},

		onOrderSuccess : function MyGengoCreateJob_onOrderSuccess(response){
			this.widgets.busyMessage.destroy();
			var url = Alfresco.constants.URL_PAGECONTEXT + "site/" + this.options.siteId + "/myGengo";
			window.location.href = url;
		},
		/**
		 * onQuote event handler
		 *
		 * @method onQuote
		 * @param layer {object} Event fired
		 * @param args {array} Event parameters (depends on event type)
		 */
		onQuote: function MyGengoCreateJob_onQuote(layer, args){
			this.onDeactivateAllControls();
			var jsonPayload = {};
			jsonPayload.source = Dom.get(this.id + "-source").value;
			jsonPayload.target = Dom.get(this.id + "-target").value;
			jsonPayload.tier = this.currentTier.tier;
			jsonPayload.text = this.textElement.value;
			jsonPayload.slug = this.slugElement.value;

			var uri = YAHOO.lang.substitute( Alfresco.constants.PROXY_URI + "api/mygengo/site/{site}/{container}/quote", {
				site : Alfresco.constants.SITE,
				container: "myGengo"
			});
			var config = {
					url: uri,
					dataObj: jsonPayload,
					successCallback :{
						fn : this.onQuoteSuccess,
						scope: this  
					},
					failureCallback :{
						fn : function(){
							this.onMandatoryControlValueUpdated();
							Alfresco.util.PopupManager.displayMessage(
									{
										text: this.msg("message.quote.failed")
									});	
						},
						scope: this  
					},
			};
			Alfresco.util.Ajax.jsonPost(config);
		},

		onQuoteSuccess : function MyGengoCreateJob_onQuoteSuccess(response){

			var now = new Date();
			var currentTimeMillis = now.getTime();
			if (response.json.quote){
				var quote = YAHOO.lang.substitute("<span class='total'>${credits}</span><span> ({unitCount} {unitType}s - {etaLabel}: {eta})</span>", {
					credits : response.json.quote.credits.toFixed(2),
					unitCount: response.json.quote.unitCount,
					unitType: this.currentTier.unitType,
					etaLabel: this.msg("label.eta"),
					eta: MyGengo.util.eta( now, new Date(currentTimeMillis + (response.json.quote.eta * 1000)))
				});
				var summary = Dom.get(this.id +"-summary")
				summary.innerHTML = quote;
				//highlight summary

				YAHOO.lang.later(500, this, function(){
					Alfresco.util.Anim.pulse(summary, {outColor: Dom.getStyle(this.id +"-formfields", "backgroundColor")});
				});
			}
			this.onMandatoryControlValueUpdated();
		},

		onSourceLanguageChanged : function MyGengoCreateJob_onSourceLanguageChanged(value){
			//recalculate available target languages...
			var allowedTargets = this.sourceTargetMap[value];
			var targetLang = Dom.get(this.id + "-target");
			targetLang.options.length=0;
			var len = allowedTargets.length;
			for (var i=0; i<len; i++) {
				var targetCode = allowedTargets[i];
				targetLang.options[i]= new Option(this.targets[targetCode].language,targetCode);
			}
			this._manageAvailableTiers();
		},

		onTargetLanguageChanged : function MyGengoCreateJob_onTargetLanguageChanged(value){
			this._manageAvailableTiers();
		},
		onTierChanged : function MyGengoCreateJob_onTierChanged(){
			this._manageAvailableTiers();
		},

		/**
		 * Mandatory control value updated event handler
		 *
		 * @method onMandatoryControlValueUpdated
		 * @param layer {object} Event fired
		 * @param args {array} Event parameters (depends on event type)
		 */
		onMandatoryControlValueUpdated: function MyGengoCreateJob_onMandatoryControlValueUpdated(layer, args)
		{
			var text = YAHOO.lang.trim(this.textElement.value);
			var slug = YAHOO.lang.trim(this.slugElement.value);
			if (text.length > 0 && slug.length > 0){
				Alfresco.util.enableYUIButton(this.widgets.orderButton);
				Alfresco.util.enableYUIButton(this.widgets.quoteButton);
			}else{
				Alfresco.util.disableYUIButton(this.widgets.orderButton);
				Alfresco.util.disableYUIButton(this.widgets.quoteButton);
			}
		},

		onChangeStatusMessage : function MyGengoCreateJob_onChangeStatusMessage() {
			var element = this.textElement;
			var curLength = 0;
			var value = element.value.replace(/\[\[\[[^\]]+\]\]\]/, '');
			value = YAHOO.lang.trim(value);
			//remove [[[non translate text]]]
			value = value.replace(/\[\[\[[^\]]+\]\]\]/, '');
			if (this.currentTier.unitType === "word"){
				value = value.replace(/\s+/g, ' ');
				if (value !=""){
					curLength = value.split(" ").length;
				}
			}else{
				value = value.replace(/\s/g, '');
				var curLength = value.length;
			}
			var currentPrice = parseFloat(this.currentTier.unitPrice, 10) * curLength;
			Dom.get(this.id + "-summary").innerHTML = "<span class='total'>$" + currentPrice.toFixed(2) + "</span><span> (" + curLength + " " +  this.currentTier.unitType + "s)</span>";
		},

		/**
		 * Deactivate All Controls event handler
		 *
		 * @method onDeactivateAllControls
		 * @param layer {object} Event fired
		 * @param args {array} Event parameters (depends on event type)
		 */
		onDeactivateAllControls: function MyGengoCreateJob_onDeactivateAllControls(layer, args)
		{
			var index, widget, fnDisable = Alfresco.util.disableYUIButton;
			for (var index in this.widgets)
			{
				if (this.widgets.hasOwnProperty(index))
				{
					fnDisable(this.widgets[index]);
				}
			}
		},
		_initializeTiers: function MyGengoCreateJob__initializeTiers(){
			var tierStandardElement = Dom.get(this.id + "-tier.standard");
			var tierProElement = Dom.get(this.id + "-tier.pro");
			var tierUltraElement = Dom.get(this.id + "-tier.ultra");

			Event.on(tierStandardElement, 'click', this.onTierChanged, null, this);
			Event.on(tierProElement, 'click', this.onTierChanged, null, this);
			Event.on(tierUltraElement, 'click', this.onTierChanged, null, this);

		},

		_initializeLanguages: function MyGengoCreateJob__initializeLanguages(){
			//initialize language dropdowns
			var sourceLang = Dom.get(this.id + "-source");
			var targetLang = Dom.get(this.id + "-target");
			this.targets ={};
			this.sources ={};
			this.sourceTargetMap = {};
			this.targetSourceMap = {};
			var len = this.options.languages.languages.length;
			//Reset options ...innerHTML on select boxes doesn't work in IE!
			sourceLang.options.length=0;
			targetLang.options.length=0;
			var sourceOptions = 0;
			var targetOptions = 0;
			for(var i=0; i<len; i++) {
				var languagePair =  this.options.languages.languages[i];
				var source = languagePair.source;
				var target = languagePair.target;
				if (!this.sources[source.languageCode]){
					this.sources[source.languageCode]= source;
					sourceLang.options[sourceOptions++]= new Option(source.language, source.languageCode, source.languageCode == "en",  source.languageCode == "en");
				}
				if (!this.targets[target.languageCode]){
					this.targets[target.languageCode]=target;
					targetLang.options[targetOptions++]= new Option(target.language, target.languageCode);
				}

				//create mappings
				if (this.sourceTargetMap[source.languageCode] && YAHOO.lang.isArray(this.sourceTargetMap[source.languageCode])){
					if (!Alfresco.util.arrayContains(this.sourceTargetMap[source.languageCode],target.languageCode)){
						this.sourceTargetMap[source.languageCode].push(target.languageCode);
					}
				}else{
					this.sourceTargetMap[source.languageCode] = [];
					this.sourceTargetMap[source.languageCode].push(target.languageCode);
				}
				if (this.targetSourceMap[target.languageCode] && YAHOO.lang.isArray(this.targetSourceMap[target.languageCode])){
					if (!Alfresco.util.arrayContains(this.targetSourceMap[target.languageCode],source.languageCode)){
						this.targetSourceMap[target.languageCode].push(source.languageCode);
					}
				}else{
					this.targetSourceMap[target.languageCode] = [];
					this.targetSourceMap[target.languageCode].push(source.languageCode);
				}
			}
			
			var me = this;
			
			Event.on(sourceLang, 'change', function (e) {
				me.onSourceLanguageChanged(this.value);
			});
			Event.on(targetLang, 'change', function (e) {
				me.onTargetLanguageChanged(this.value);
			});

			this.onSourceLanguageChanged("en");
		},

		_manageAvailableTiers : function MyGengoCreateJob__manageAvailableTiers(){
			var sourceCode = Dom.get(this.id + "-source").value;
			var targetCode = Dom.get(this.id + "-target").value;
			var pricedTiers = {};
			var unitTypeTiers= {};
			var len = this.options.languages.languages.length;
			for(var i=0; i<len; i++) {
				var languagePair =  this.options.languages.languages[i];
				if (languagePair.source.languageCode === sourceCode && languagePair.target.languageCode === targetCode){
					pricedTiers[languagePair.tier] = languagePair.unitPrice; 
					unitTypeTiers[languagePair.tier] = languagePair.source.unitType;
				}
			}
			var tierStandardElement = Dom.get(this.id + "-tier.standard");
			var tierProElement = Dom.get(this.id + "-tier.pro");
			var tierUltraElement = Dom.get(this.id + "-tier.ultra");

			//a. check if selected tier is available
			var currentTier;
			if (tierStandardElement.checked){
				currentTier = tierStandardElement.value;
			}else if (tierProElement.checked){
				currentTier = tierProElement.value;
			}else if (tierUltraElement.checked){
				currentTier = tierUltraElement.value;
			}

			var cheapestTier = "standard";
			if (currentTier && pricedTiers[currentTier]){
				//selected tier is available
				cheapestTier = currentTier;
			}else{
				//no tier selected or no more available
				//a. select cheapest tier
				if (pricedTiers.standard){
					cheapestTier = "standard";

				}else if (pricedTiers.pro){
					cheapestTier = "pro";
				}
				else if (pricedTiers.ultra){
					cheapestTier = "ultra";

				}
				Dom.get(this.id + "-tier." + cheapestTier).checked = true;
			}

			tierStandardElement.disabled = !pricedTiers.standard;
			tierProElement.disabled = !pricedTiers.pro;
			tierUltraElement.disabled = !pricedTiers.ultra;

			this.currentTier = {};
			this.currentTier.tier = cheapestTier;
			this.currentTier.unitType =  unitTypeTiers[cheapestTier];
			this.currentTier.unitPrice = pricedTiers[cheapestTier];

			this.onChangeStatusMessage();
		},

		/**
		 * Displays the provided busyMessage but only in case
		 * the component isn't busy set.
		 * 
		 * @return true if the busy state was set, false if the component is already busy
		 */
		_setBusy: function MyGengoAccount__setBusy(busyMessage)
		{
			if (this.busy)
			{
				return false;
			}
			this.busy = true;
			this.widgets.busyMessage = Alfresco.util.PopupManager.displayMessage(
					{
						text: busyMessage,
						spanClass: "wait",
						displayTime: 0
					});
			return true;
		},

		/**
		 * Removes the busy message and marks the component as non-busy
		 */
		_releaseBusy: function MyGengoAccount__releaseBusy()
		{
			if (this.busy)
			{
				this.widgets.busyMessage.destroy();
				this.busy = false;
				return true;
			}
			else
			{
				return false;
			}
		}
			}, true);
		})
();