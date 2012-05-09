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

package com.myGengo.alfresco.webscripts;

import java.io.IOException;
import java.util.Date;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.transform.ContentTransformer;
import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.ContentIOException;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.apache.commons.httpclient.HttpStatus;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

/**
 * A web service to return the text content (transformed if required) of a node's
 * content property.
 * 
 * source is copied from current Alfesco 4.0 trunk
 * 
 * @since 4.0
 */
public class NodeContentGet extends StreamContent
{
    
    public void setNodeService(NodeService nodeService)
    {
        this.nodeService = nodeService;
    }

    public void setContentService(ContentService contentService)
    {
        this.contentService = contentService;
    }

    
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException
    {
        ContentReader textReader = null;
        Exception transformException = null;

        String nodeRef = req.getParameter("nodeRef");
        if(nodeRef == null)
        {
            throw new WebScriptException("nodeRef parameter is required for GetNodeContent");
        }
        

        
        ContentReader reader = contentService.getReader(new NodeRef(nodeRef), ContentModel.PROP_CONTENT);
        if(reader == null)
        {
            res.setStatus(HttpStatus.SC_NO_CONTENT);
            return;            
        }

        // Perform transformation catering for mimetype AND encoding
        ContentWriter writer = contentService.getTempWriter();
        writer.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
        writer.setEncoding("UTF-8");                            // Expect transformers to produce UTF-8

        ContentTransformer transformer = contentService.getTransformer(reader.getMimetype(), MimetypeMap.MIMETYPE_TEXT_PLAIN);
        if(transformer == null)
        {
            res.setStatus(HttpStatus.SC_NO_CONTENT);
            return;
        }

        try
        {
            transformer.transform(reader, writer);
        }
        catch (ContentIOException e)
        {
            transformException = e;
        }

        if(transformException == null)
        {
            // point the reader to the new-written content
            textReader = writer.getReader();
            // Check that the reader is a view onto something concrete
            if (textReader == null || !textReader.exists())
            {
                transformException = new ContentIOException(
                        "The transformation did not write any content, yet: \n"
                        + "   transformer:     " + transformer + "\n" + "   temp writer:     " + writer);
            }
        }

        if(transformException != null)
        {
            res.setStatus(HttpStatus.SC_NO_CONTENT);
        }
        else
        {
            res.setStatus(HttpStatus.SC_OK);
            Date modified = new Date();
            streamContentImpl(req, res, textReader, false, modified, String.valueOf(modified.getTime()), null);            
        }
    }
}
