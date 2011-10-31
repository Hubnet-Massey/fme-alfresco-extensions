<#assign el=args.htmlid?html>
<div id="${el}-imageViewDialog" class="darkpanel">
  <div class="hd"></div> 
  <div class="bd">
	<div class="commentarea">
		<div id="${el}-comments" class="comments"></div>
		<div id="${el}-newcomment" class="newcomment">
			<div class="avatar">
	            <#if user.properties.avatar??>
	               <img src="${url.context}/proxy/alfresco/api/node/${user.properties.avatar?replace('://','/')?html}/content/thumbnails/avatar?c=force" alt="" />
	            <#else>
	               <img src="${url.context}/res/components/images/no-user-photo-64.png" alt="" />
	            </#if>
	            <img id="speecharrow" src="${url.context}/res/fme/modules/preview/speechbubble.png">
			</div>
            <div class="speechbubble">
				<textarea id="${el}-newcommenttext"></textarea>
			</div>
			<div class="commentbuttons">
				<button id="${el}-newcomment-button">${msg("label.submit.comment")}</button>
			</div>
		</div>
	</div>
	<div class="imagearea">
		<div id="${el}-imageTitle" class="title"></div>
		<div class="imageborder">
			<img id="${el}-image" class="imagepreview"/>
			<div id="${el}-left" class="leftarrow"></div>
			<div id="${el}-right" class="rightarrow"></div>
		</div>
		<div class="imagefooter">
			<div class="actions">
				<div id="${el}-like" class="likeAction"></div>
			    <a id="${el}-detailsAction" href="#" class="detailsAction">${msg("label.action.details")}</a>
			    <a id="${el}-downloadAction" href="#" target="_new" class="downloadAction">${msg("label.action.download")}</a>
		    </div>
			<b>${msg("label.description")}</b>
			<div id="${el}-imageDescription"></div>
		</div>	
	</div>
		
  </div> 
  <div class="ft"></div> 
</div>