<#assign el=args.htmlid?html>

<div id="${el}-configDialog" class="config-dashlet">
   <div class="hd">${msg("label.configure")}</div>
   <div class="bd">
      <form id="${el}-form" action="" method="POST">

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-title">${msg("label.title")}:</label></div>
            <div class="yui-u"><input id="${el}-title" type="text" name="title" value=""/>&nbsp;*</div>
         </div>

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-viewmode">${msg("label.viewmode")}:</label></div>
            <div class="yui-u">
            	<input id="${el}-viewmode" name="viewmode" type="hidden" value=""/>
            	<select class="inline-display" id="${el}-viewmode-list" onChange="document.getElementById('${el}-viewmode').value = this.options[this.selectedIndex].value; if(this.options[this.selectedIndex].value == 'images'){document.getElementById('single-album-ref').style.display = 'block';} else if(this.options[this.selectedIndex].value == 'albums'){document.getElementById('single-album-ref').style.display = 'none';}">
            		<option value="images" selected="selected">${msg("label.viewmode.images")}</option>
            		<option value="albums">${msg("label.viewmode.albums")}</option>
	           	</select>
	            <div class="dashlet-plus-help-tip">
                    <div><h3 style="text-decoration:underline;">${msg("label.viewmode.images")}</h3><p>Displays all images in the site document library that the user is permitted to view.</p><h3 style="text-decoration:underline;">${msg("label.viewmode.albums")}</h3><p>Displays all the Albums in the site document library.</p><h3 style="text-decoration:underline;">To create an Album</h3><ul><li>Create a folder containing images in the site document library</li><li>Select "Manage Aspects" from the list of actions for the folder</li><li>Add the "Album for the image gallery" Aspect</li><li>The folder is now an Album</li></ul></div>
                </div>
            </div>
         </div>

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-thumbName">${msg("label.thumbsize")}:</label></div>
            <div class="yui-u">
            	<input id="${el}-thumbName" name="thumbName" type="hidden" value=""/>
            	<select id="${el}-thumbName-list" onChange="document.getElementById('${el}-thumbName').value = this.options[this.selectedIndex].value;">
            		<option value="galpThumb120">${msg("label.thumbsize.normal")}</option>
            		<option value="galpThumb200">${msg("label.thumbsize.big")}</option>
	           	</select>
            </div>
         </div>

         <div class="yui-gd" id="single-album-ref">
            <div class="yui-u first"><label for="${el}-singleAlbumNodeRef">${msg("label.singleAlbumNodeRef")}:</label></div>
            <div class="yui-u">
            	<input id="${el}-singleAlbumNodeRef" type="hidden" name="singleAlbumNodeRef" value=""/>
            	<select class="inline-display" id="${el}-singleAlbumNodeRef-list" onChange="document.getElementById('${el}-singleAlbumNodeRef').value = this.options[this.selectedIndex].value;">
            		<option value="all">${msg("label.album.all")}</option>
            		<#list albums as album>
            		<option value="${album.nodeRef}">${album.name}</option>
					</#list>
	           	</select>
	           	<div class="dashlet-plus-help-tip">
                    <div><h3 style="text-decoration:underline;">${msg("label.singleAlbumNodeRef")}</h3><p>Images can be filtered by specifying one single album. By default, all images and albums are displayed.</p></div>
                </div>
            </div>
         </div>	
         <#-- <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-filterPath">${msg("label.filterPath")}:</label></div>
            <div class="yui-u">
            	<input id="${el}-filterPath" type="hidden" name="filterPath" value=""/>
				<div id="${el}-filterPathView"></div>
            	<button id="${el}-selectFilterPath-button">${msg("label.selectFilterPath")}</button>
            	<button id="${el}-clearFilterPath-button">${msg("label.clearFilterPath")}</button>
            </div>
         </div> -->

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-filterTags">${msg("label.filterTags")}:</label></div>
            <div class="yui-u"><input id="${el}-filterTags" type="text" name="filterTags" value=""/>&nbsp;*</div>
         </div>

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-sort">${msg("label.sort")}:</label></div>
            <div class="yui-u"><input id="${el}-sort" type="text" name="sort" value=""/>&nbsp;*</div>
         </div>
         
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-sortOrder">${msg("label.sortOrder")}:</label></div>
            <div class="yui-u">
            	<input id="${el}-sortOrder" name="sortOrder" type="hidden" value=""/>
            	<select id="${el}-sortOrder-list" onChange="document.getElementById('${el}-sortOrder').value = this.options[this.selectedIndex].value;">
            		<option value="asc">${msg("label.sortOrder.asc")}</option>
            		<option value="desc">${msg("label.sortOrder.desc")}</option>
	           	</select>
            </div>
         </div>

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-pageSize">${msg("label.pageSize")}:</label></div>
            <div class="yui-u"><input id="${el}-pageSize" type="text" name="pageSize" value=""/>&nbsp;*</div>
         </div>

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-maxImages">${msg("label.maxImages")}:</label></div>
            <div class="yui-u"><input id="${el}-maxImages" type="text" name="maxImages" value=""/>&nbsp;*</div>
         </div>

         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-background">${msg("label.background")}:</label></div>
            <div class="yui-u"><input id="${el}-background" type="text" name="background" value=""/></div>
         </div>

         <div class="bdft">
            <input type="submit" id="${el}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${el}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
   <div id="${el}-selectFilterPath"></div>
</div>
   