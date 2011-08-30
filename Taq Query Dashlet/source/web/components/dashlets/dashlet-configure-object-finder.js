/**
 * Copyright (C) 2011 fme alfresco extensions project
 *
 * This file is part of the fme alfresco extensions project.
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
 *
 * You should have received a copy of the Apache 2.0 license along with
 * this project. If not, see <http://www.apache.org/licenses/LICENSE-2.0>.
 */
if (typeof(FME) == "undefined") FME={};

(function()
{
   /**
   * YUI Library aliases
   */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      KeyListener = YAHOO.util.KeyListener;

   FME.DashletObjectFinder = function(htmlId,currentValueHtmlId)
   {
	  FME.DashletObjectFinder.superclass.constructor.call(this, htmlId, currentValueHtmlId);
	  this.onTagChange = new YAHOO.util.CustomEvent("onTagChange");
      return this ;
   };

   /**
    * Extend Alfresco.ObjectFinder 
    */
   YAHOO.extend(FME.DashletObjectFinder, Alfresco.ObjectFinder);

   
   /**
    * Augment prototype with main class implementation, ensuring overwrite is enabled
    */
   YAHOO.lang.augmentObject(FME.DashletObjectFinder.prototype,
   {
	  /**
       * Returns currently selected item names
       *
       * @method getSelectedItems
       * @return {array}
       */
      getSelectedItemNames: function DashletObjectFinder_getSelectedItemNames()
      {
         var selectedItems = [];

         for (var item in this.selectedItems)
         {
            if (this.selectedItems.hasOwnProperty(item))
            {
               selectedItems.push(this.selectedItems[item].name);
            }
         }
         return selectedItems;
      },
	  
      /**
       * Adjust the current values, added, removed input elements according to the new selections
       * and fires event to notify form listeners about the changes.
       *
       * @method _adjustCurrentValues
       */
      _adjustCurrentValues: function ObjectFinder__adjustCurrentValues()
      {
         if (!this.options.disabled)
         {
            var addedItems = this.getAddedItems(),
               removedItems = this.getRemovedItems(),
               selectedItems = this.getSelectedItems(),
               selectedItemNames = this.getSelectedItemNames();

            if (this.options.maintainAddedRemovedItems)
            {
               Dom.get(this.id + "-added").value = addedItems.toString();
               Dom.get(this.id + "-removed").value = removedItems.toString();
            }
            Dom.get(this.currentValueHtmlId).value = selectedItemNames.toString();
            if (Alfresco.logger.isDebugEnabled())
            {
               Alfresco.logger.debug("Hidden field '" + this.currentValueHtmlId + "' updated to '" + selectedItemNames.toString() + "'");
            }
                                 
            // inform the forms runtime that the control value has been updated (if field is mandatory)
            if (this.options.mandatory)
            {
               YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);
            }

            this._enableActions();
         }
      }
      
   }, true);
})();
