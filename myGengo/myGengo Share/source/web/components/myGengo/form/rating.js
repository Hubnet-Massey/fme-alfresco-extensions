/** 
   Copyright 2012, Jeff Potts & fme AG (original version slightly modified by fme)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
if (typeof MyGengo == "undefined")
{
	MyGengo = {};
} 

/**
 * MyGengo five star ratings component
 * 
 * @namespace MyGengo
 * @class MyGengo.Ratings
 */
(function()
{
    /**
     * YUI Library aliases
     */
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event;

    /**
     * Alfresco Slingshot aliases
     */
    var $html = Alfresco.util.encodeHTML,
        $hasEventInterest = Alfresco.util.hasEventInterest;

    /**
     * Ratings constructor.
     * 
     * @param {String} htmlId The HTML id of the parent element
     * @param {String} currentValueHtmlId The HTML id of the parent element
     * @return {Metaversant.Ratings} The new Ratings instance
     * @constructor
     */
    MyGengo.Ratings = function(htmlId, currentValueHtmlId, rating)
    {
    	MyGengo.Ratings.superclass.constructor.call(this, "MyGengo.Ratings", htmlId, ["button", "menu", "container", "resize", "datasource", "datatable"]);

        // Mandatory properties
        this.name = "MyGengo.Ratings";
        this.id = htmlId;
        this.currentValueHtmlId = currentValueHtmlId;
        this.rating = rating;

        /* Register this component */
        Alfresco.util.ComponentManager.register(this);

        return this;
    };
   
    YAHOO.extend(MyGengo.Ratings, Alfresco.component.Base);
    
    /**
     * Augment prototype with main class implementation, ensuring overwrite is enabled
     */
    YAHOO.lang.augmentObject(MyGengo.Ratings.prototype,
    {
        /**
         * @property rating
         * @type int
         */
        rating: null,
        
        /**
         * @property numStars
         * @type int
         */
        numStars: 5,
      
        /**
         * Object container for initialization options
         *
         * @property options
         * @type object
         */
        options:
        {           
            /**
             * Specifies whether or not a metadataRefresh event should
             * be fired after an update.
             *
             * @property fireMetadataRefresh
             * @type boolean
             */
            fireMetadataRefresh: false,
            
            /**
             * Specifies whether or not the ratings should be rendered
             * as read-only.
             *
             * @property readOnly
             * @type boolean
             */
            readOnly: false
      
        },


        /**
         * Fired by YUI when parent element is available for scripting.
         * Component initialisation, including instantiation of YUI widgets and event listener binding.
         *
         * @method onReady
         */
        onReady: function MetaversantRatings_onReady()
        {
            this.renderRatingsMarkupById(this.currentValueHtmlId);
        },

        /**
         * Given a specific ID, finds that div and calls renderRatingMarkup.
         * @method renderRatingsMarkupById
         * @param id {String} representing the ID of the div to be rendered
         */
        renderRatingsMarkupById: function MetaversantRatings_renderRatingsMarkupById(id){
            var ratingDiv = Dom.get(this.id);
            if (ratingDiv != undefined)
            {
            	ratingDiv.innerHTML="";
                this.renderRatingMarkup(ratingDiv);
            }
        },

        /**
         * Renders the rating markup for all rating elements on the page.
         *
         * @method renderRatingMarkup
         * @param ratingDiv {object} Div containing the rating widget
         */
        renderRatingMarkup: function MetaversantRatings_renderRatingMarkup(ratingDiv)
        {
        	
            var rating = this.rating; 
            if (Dom.get(this.currentValueHtmlId)){
            	rating = Dom.get(this.currentValueHtmlId).value;
            }
            
            if (rating > this.numStars || rating < 0)
            {
                return;
            }

            for (var j = 1; j <= this.numStars; j++)
            {
                var star = document.createElement('img');
                if (rating >= 1) {
                    star.setAttribute('src', Alfresco.constants.URL_RESCONTEXT + 'components/myGengo/images/rating_on.gif');
                    star.className = 'on';
                    rating--;
                } else {
                    star.setAttribute('src', Alfresco.constants.URL_RESCONTEXT + 'components/myGengo/images/rating_off.gif');
                    star.className = 'off';
                }
                var divIdEls = ratingDiv.id.split('_');
                var nodeId = divIdEls[divIdEls.length - 1];
                var widgetId = this.id + '_' + nodeId + '_' + j;
                star.setAttribute('id', widgetId);
                if (!this.options.readOnly)
                {
                    YAHOO.util.Event.addListener(widgetId, "mouseover", this.displayHover,this, this);
                    YAHOO.util.Event.addListener(widgetId, "mouseout", this.displayNormal,this, this);
                    YAHOO.util.Event.addListener(widgetId, "click", this.setRatingValue, this, this);
                }
               
                ratingDiv.appendChild(star);
            }
            ratingDiv.style.visibility = "inherit";
        },

        /**
         * Event handler for mouseover.
         * @method displayHover
         * @param e
         */
        displayHover: function MetaversantRatings_displayHover(e, obj)
        {
            var targ;
            if (!e) var e = window.event;
            if (e.target)
            {
                targ = e.target;
            }
            else if (e.srcElement)
            {
                targ = e.srcElement;
            }
            if (targ.nodeType == 3)
            {
                // defeat Safari bug
                targ = targ.parentNode;
            }

            var idEls = targ.id.split("_");
            var id = idEls[idEls.length - 2];
            var rating = idEls[idEls.length - 1];
            for (var i = 1; i <= rating; i++) {
                document.getElementById(obj.id + '_' + id + '_' + i).setAttribute('src', Alfresco.constants.URL_RESCONTEXT + 'components/myGengo/images/rating_over.gif');
            }
        },

        /**
         * Event handler for mouse out.
         * @method displayNormal
         * @param e
         */
        displayNormal: function MetaversantRatings_displayNormal(e, obj)
        {
            var targ;
            if (!e) var e = window.event;
            if (e.target)
            {
                targ = e.target;
            }
            else if (e.srcElement)
            {
                targ = e.srcElement;
            }
            if (targ.nodeType == 3)
            {
                // defeat Safari bug
                targ = targ.parentNode;
            }

            var idEls = targ.id.split("_");
            var id = idEls[idEls.length - 2];
            var rating = idEls[idEls.length - 1];
            for (var i = 1; i <= rating; i++) {
                var status = document.getElementById(obj.id + '_' + id + '_' + i).className;
                document.getElementById(obj.id + '_' + id + '_' + i).setAttribute('src', Alfresco.constants.URL_RESCONTEXT + 'components/myGengo/images/rating_' + status + '.gif');
            }
        },
        /**
         * Event handler for click.
         * @method setRatingValue
         * @param e
         */
        setRatingValue: function MetaversantRatings_setRatingValue(e, obj)
        {
            var targ;
            if (!e) var e = window.event;
            if (e.target)
            {
                targ = e.target;
            }
            else if (e.srcElement)
            {
                targ = e.srcElement;
            }
            if (targ.nodeType == 3)
            {
                // defeat Safari bug
                targ = targ.parentNode;
            }

            var idEls = targ.id.split("_");
            var id = idEls[idEls.length - 2];
            var rating = idEls[idEls.length - 1];
            if (Dom.get(this.currentValueHtmlId)){
            	Dom.get(this.currentValueHtmlId).value=rating;
            	this.renderRatingsMarkupById(this.currentValueHtmlId);
            }
        }
    }, true);
})();