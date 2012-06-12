/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {

	// -- utility functions -----------------------------------
	
	var nz = function(value, defaultvalue) {
		if (typeof(value) === undefined || value == null) {
			return defaultvalue;
		}
		return value;
	}; 
	
	var getRealNameForUser = function(username) {
		var p = people.getPerson(username);
		if (p) {
			return p.properties["cm:firstName"] + " " + p.properties["cm:lastName"];
		}
		else {
			return username;
		}
	}

	var getCommentCount = function(node) {
		var discussionChildAssoc = node.childAssocs["fm:discussion"];
		
		if(discussionChildAssoc) {
			var discussionNode = discussionChildAssoc[0];
			var commentsContainer = discussionNode.children[0];
			if (commentsContainer) {
				var comments = commentsContainer.children;
				if (comments) {
					return comments.length;
				}
			} 
		}
		return 0;
	}

	// -- args handling -----------------------------------

	var thumbName = nz(args.thumbName, "galpThumb120");
	var maxItems =  parseInt(nz(args.max, 400));
	var skipCount =  parseInt(nz(args.skip, 0));
	var sortColumn = nz(args.sort, "cm:name");
	var sortOrder = nz(args.sortOrder, "asc");

	// logger.warn("maxItems:"+maxItems);
	// logger.warn("skipCount:"+skipCount);

	var filter = "";
	if (args.filterPath) {
		if (args.filterPath.indexOf("workspace://")==0) {
			var filterPathNode = search.findNode(args.filterPath);
			filter += "+PATH:\""+(filterPathNode.qnamePath+"//*") +"\"";
		}
		else {
			filter += "+PATH:\"" + args.filterPath.replace(/:/g, "\\:")+"\" ";
		};
	}
	else {
		// if no filterPath is set use the current site as a default 
		if (args.site) {
			var siteNode = siteService.getSite(args.site).node;
			if (siteNode) {
				filter += "+PATH:\""+(siteNode.qnamePath+"//*") +"\"";	
			}
		};
	}

	// DEBUG logger.warn(filter);
	
	if (args.albumNodeRef) {
		filter += "+PARENT:\"" + args.albumNodeRef.replace(/:/g, "\\:")+"\" ";
	}

	if (args.filterTags) {
		 filter += " +PATH:\"/cm:taggable/cm:" + search.ISO9075Encode(args.filterTags) + "/member\" ";
	}

	// -- lucene image search -----------------------------------
	
	var searchQuery = {
		query : "+@cm\\:content.mimetype:image* +TYPE:cm\\:content -ASPECT:rn\\:rendition " + filter,
		sort : [{
			column: "@"+sortColumn,
			ascending: (sortOrder == "asc")
		}]
	}
	
	if (sortColumn == "cm:name") {
		// use skipCount with cm:name with other fields (like cm:modified) skipcount seems not to work
		searchQuery.page = { "maxItems": maxItems, "skipCount": skipCount };
	}
	else {
		searchQuery.page = { "maxItems": maxItems + skipCount };
	}
	
	// execute query
	var nodes = search.query(searchQuery);

	// if not sorting by name, cut the requested "page" from the result.
	if (sortColumn != "cm:name") {
		nodes = nodes.slice(skipCount, skipCount + maxItems);
	}
	
	var thumbs = [];

	for each(n in nodes) {
		var thumb = n.getThumbnail(thumbName);
		if (!thumb) {
			// Thumbnail not found, create it on the fly with the action
			var action = actions.create("galleryPlusThumbnailDimensionAction");
			action.parameters["thumbnailName"] = thumbName;
			action.execute(n);
			thumb = n.getThumbnail(thumbName);
		}

		if (thumb) {
			var nodeRefUrl = (""+n.nodeRef).replace(":/", "");
		  
			thumbs.push({
				"name" : n.name,
				"title" : n.properties["cm:title"] ? n.properties["cm:title"] : n.name,
				"description" : n.properties["cm:description"],
				"author" : getRealNameForUser(n.properties["cm:modifier"]),
				"nodeRef" : "" + n.nodeRef,
				"twidth" : nz(thumb.properties["exif:pixelXDimension"],120),
				"theight" : nz(thumb.properties["exif:pixelYDimension"], 120),
				"thumbUrl" : "api/node/"+nodeRefUrl+"/content/thumbnails/"+thumbName,
				"comments" : getCommentCount(n)
			});
		}
		else {
		  logger.warn("Thumbnail generation failed for node: " + n.nodeRef);
		}
	}
	
	model.thumbs =  jsonUtils.toJSONString(thumbs);

})();
  