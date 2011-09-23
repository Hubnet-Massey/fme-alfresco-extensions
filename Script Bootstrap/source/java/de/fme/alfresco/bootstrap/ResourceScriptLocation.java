/*
 * Copyright (C) 2011 fme AG
 * 
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
package de.fme.alfresco.bootstrap;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.scripts.ScriptException;
import org.alfresco.service.cmr.repository.ScriptLocation;
import org.springframework.core.io.Resource;

/**
 * Implements a script location that points to a Spring {@link Resource}.
 * 
 * @author Florian Maul (fme AG)
 */
public class ResourceScriptLocation implements ScriptLocation {

	private final Resource resource;

	public ResourceScriptLocation(Resource resource) {
		this.resource = resource;
	}

	@Override
	public InputStream getInputStream() {
		try {
			return resource.getInputStream();
		} catch (Throwable err) {
			throw new ScriptException("Failed to load resource '" + resource
					+ "': " + err.getMessage(), err);
		}
	}

	@Override
	public Reader getReader() {
		Reader reader = null;
		try {
			InputStream stream = resource.getInputStream();
			if (stream == null) {
				throw new AlfrescoRuntimeException("Unable to load resource: "
						+ resource);
			}
			reader = new InputStreamReader(stream);
		} catch (Throwable err) {
			throw new ScriptException("Failed to load resource '" + resource
					+ "': " + err.getMessage(), err);
		}

		return reader;
	}

	@Override
	public String getPath() {
		try {
			return resource.getURI().toString();
		} catch (Throwable err) {
			throw new ScriptException("Failed to get resource path '"
					+ resource + "': " + err.getMessage(), err);
		}
	}

	@Override
	public boolean isCachable() {
		return true;
	}

	@Override
	public boolean isSecure() {
		return true;
	}

}
