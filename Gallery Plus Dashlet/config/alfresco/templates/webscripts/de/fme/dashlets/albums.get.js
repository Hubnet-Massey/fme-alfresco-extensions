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

	var filter = "";
	if (args.filterPath) {
		if (args.filterPath.indexOf("workspace://")==0) {
			var filterPathNode = search.findNode(args.filterPath);
			filter = "+PATH:\""+(filterPathNode.qnamePath+"//*") +"\" ";
		}
		else {
			filter = "+PATH:\"" + args.filterPath.replace(/:/g, "\\:")+"\" ";
		}
	}
		
	// DEBUG logger.warn(filter);
	
	if (args.filterTags) {
		 filter += " +PATH:\"/cm:taggable/cm:" + search.ISO9075Encode(args.filterTags) + "/member\" ";
	}
	
	// The search query to search for albums
	var searchQuery = {
		query : "+ASPECT:galp\\:album " + filter,
		sort : [{
			column: "@cm:name",
			ascending: true
		}],
		page: {
			"maxItems": 100
		}
	};
	
	/*
	 * Builds a query definition for querying for preview thumbnail images
	 * for an album.
	 * 
	 * Notes (with 3.4):
	 *  - using lucene query to query preview images for each album.
	 *  - album.children to query images is slower for large albums
	 *    If the album would store the approx number of images
	 *    the query could be optimized album.children when <100 pics, lucene when > 100 pics
	 *  - search seems to be faster with sorting by cm:modified, than without
	 */
	var getChildrenQuery = function(albumNodeRef){
		return {
			query : "+@cm\\:content.mimetype:image* +TYPE:cm\\:content -ASPECT:rn\\:rendition " + 
			        "+PARENT:\"" + albumNodeRef.replace(/:/g, "\\:")+"\" ",
			sort : [{
				column: "@cm\\:modified",
				ascending: false
			}],
			page: {
				"maxItems": 3 // we only need 3 preview images
			}
		};
	};
	
	var nodes = search.query(searchQuery);
	var albums = [];
	
	for each(n in nodes) {
			var previews = [];

			// query for preview thumbnails for an image
			var childQuery = getChildrenQuery(""+n.nodeRef);
			var children = search.query(childQuery);
			for (var c in children) {
				previews.push(""+children[c].nodeRef);
			}
			
			albums.push({
				"name" : n.name,
				"previews" : previews,
				"title" : n.properties["cm:title"] ? n.properties["cm:title"] : n.name,
				"description" : n.properties["cm:description"],
				"nodeRef" : "" + n.nodeRef
			});
	}
	
	model.albums =  jsonUtils.toJSONString(albums);

})();
  