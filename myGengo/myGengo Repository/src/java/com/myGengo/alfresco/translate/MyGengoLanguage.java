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

package com.myGengo.alfresco.translate;

import java.io.Serializable;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONString;
import org.json.JSONStringer;

/**
 * bean representing a myGengo language encapsulating language, localName, languageCode &amp; unitType data
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoLanguage implements Serializable, JSONString{

	private static final Log LOGGER = LogFactory.getLog(MyGengoLanguage.class);
	
	private static final long serialVersionUID = 1043900586198347984L;
	
	private String language;;
	private String localizedName;
	private String languageCode;
	private String unitType;
	
	public MyGengoLanguage(){
	}
	
	public MyGengoLanguage(JSONObject json) throws JSONException{
		this.language = json.getString("language");
		this.localizedName = json.getString("localizedName");
		this.languageCode = json.getString("languageCode");
		this.unitType = json.getString("unitType");
	}
	/**
	 * @return the language
	 */
	public String getLanguage() {
		return language;
	}
	/**
	 * @param language the language to set
	 */
	public void setLanguage(String language) {
		this.language = language;
	}
	/**
	 * @return the localizedName
	 */
	public String getLocalizedName() {
		return localizedName;
	}
	/**
	 * @param localizedName the localizedName to set
	 */
	public void setLocalizedName(String localizedName) {
		this.localizedName = localizedName;
	}
	/**
	 * @return the languageCode
	 */
	public String getLanguageCode() {
		return languageCode;
	}
	/**
	 * @param languageCode the languageCode to set
	 */
	public void setLanguageCode(String languageCode) {
		this.languageCode = languageCode;
	}
	/**
	 * @return the unitType
	 */
	public String getUnitType() {
		return unitType;
	}
	/**
	 * @param unitType the unitType to set
	 */
	public void setUnitType(String unitType) {
		this.unitType = unitType;
	}
	
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("MyGengoLanguage [language=");
		builder.append(language);
		builder.append(", localizedName=");
		builder.append(localizedName);
		builder.append(", languageCode=");
		builder.append(languageCode);
		builder.append(", unitType=");
		builder.append(unitType);
		builder.append("]");
		return builder.toString();
	}
	@Override
	public String toJSONString() {
		JSONStringer stringer = new JSONStringer();
		try {
			stringer.object()
				.key("language").value(language)
				.key("localizedName").value(localizedName)
				.key("languageCode").value(languageCode)
				.key("unitType").value(unitType)
			.endObject();
			return stringer.toString();
		} catch (JSONException e) {
			LOGGER.error("Failed to serialize JSON", e);
			return "{}";
		}
	}
	
}