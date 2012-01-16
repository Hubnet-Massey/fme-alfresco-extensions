var nodes = search.luceneSearch("TYPE:\"{http://www.alfresco.org/model/datalist/1.0}dataList\"");

var ctx = Packages.org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext();
var policyComponent = ctx.getBean("policyBehaviourFilter");
policyComponent.disableBehaviour(Packages.org.alfresco.service.namespace.QName.createQName(Packages.org.alfresco.service.namespace.NamespaceService.CONTENT_MODEL_1_0_URI, "auditable"));

for each(n in nodes) {
  print(n.properties.title + " (" + n.typeShort + ") " + n.nodeRef);
  if(!n.hasAspect("cm:countable")){
  	n.addAspect("cm:countable");
  }

  var items = search.luceneSearch("TYPE:\"{http://www.alfresco.org/model/datalist/1.0}dataListItem\" +PARENT:\""+n.nodeRef+"\"",  "@cm:created", false);
  for each (item in items){
 	print(item.properties.title + " (" + item.typeShort + ") " + item.nodeRef);
    	if(!item.hasAspect("dl:dataListItemId")){
	        item.addAspect("dl:dataListItemId");
    		datalistIDService.setNextId(item.nodeRef);
        }
    	if(!item.hasAspect("cm:versionable")){
	        item.addAspect("cm:versionable");
          	item.properties["cm:autoVersionOnUpdateProps"]=true;
                item.save();
        }
   	if(!item.hasAspect("fm:discussable")){
	        item.addAspect("fm:discussable");
        }
    	var discussion = item.childAssocs["fm:discussion"][0];
    	print(discussion.typeShort);
        if(discussion){
          var topics = discussion.childAssocs["cm:contains"];
          var topic;
          if(topics && topics.length > 0){
          	print("topic found " + topics[0].typeShort);
            	topic = topics[0];
          }else{
            var topic = commentService.createCommentsFolder(item);
          }
          if (item.typeShort == "dl:simpletask" && topic.childByNamePath("oldComment")==null ){
              print("adding old comment")
              var oldComment = item.properties["dl:simpletaskComments"];
              if (oldComment != null && oldComment != ""){
                var newComment= topic.createNode("oldComment", "fm:post" , "cm:contains");
                newComment.content = oldComment;
                newComment.properties["cm:creator"]="admin";
                newComment.properties["cm:modifier"]="admin";
                newComment.save();
              }
          }
          else if (item.typeShort == "dl:task" && topic.childByNamePath("oldComment")==null ){
              print("adding old comment")
              var oldComment = item.properties["dl:taskComments"];
              if (oldComment != null && oldComment != ""){
                var newComment= topic.createNode("oldComment", "fm:post" , "cm:contains");
                newComment.content = oldComment;
                newComment.properties["cm:creator"]="admin";
                newComment.properties["cm:modifier"]="admin";
                newComment.save();
              }
          }
          else if (item.typeShort == "dl:issue" && topic.childByNamePath("oldComment")==null ){
              print("adding old comment")
              var oldComment = item.properties["dl:issueComments"];
              if (oldComment != null && oldComment != ""){
                var newComment= topic.createNode("oldComment", "fm:post" , "cm:contains");
                newComment.content = oldComment;
                newComment.properties["cm:creator"]="admin";
                newComment.properties["cm:modifier"]="admin";
                newComment.save();
              }
          }
        }
  }
}

policyComponent.enableAllBehaviours();