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

import com.mygengo.client.enums.Tier;

/**
 * bean representing a myGengo language pair encapsulating source &amp; target language, tier and the unitPrice
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoLanguagePair implements Serializable, JSONString{

	/**
     * Logger instance.
     */
	private static final Log LOGGER = LogFactory.getLog(MyGengoLanguagePair.class);
	
	private static final long serialVersionUID = 8642383773490293845L;
	
	private MyGengoLanguage source;
	private MyGengoLanguage target;
	private Tier tier;
	private String unitPrice;
	
	public MyGengoLanguagePair(){
	}
	
	public MyGengoLanguagePair(JSONObject jsonObject) throws JSONException{
		this.source = new MyGengoLanguage(jsonObject.getJSONObject("source"));
		this.target = new MyGengoLanguage(jsonObject.getJSONObject("target"));
		this.tier = Tier.valueOf(jsonObject.getString("tier").toUpperCase());
		this.unitPrice = jsonObject.getString("unitPrice");
	}
	/**
	 * @return the source
	 */
	public MyGengoLanguage getSource() {
		return source;
	}
	/**
	 * @param source the source to set
	 */
	public void setSource(MyGengoLanguage source) {
		this.source = source;
	}
	/**
	 * @return the target
	 */
	public MyGengoLanguage getTarget() {
		return target;
	}
	/**
	 * @param target the target to set
	 */
	public void setTarget(MyGengoLanguage target) {
		this.target = target;
	}
	/**
	 * @return the tier
	 */
	public Tier getTier() {
		return tier;
	}
	/**
	 * @param tier the tier to set
	 */
	public void setTier(Tier tier) {
		this.tier = tier;
	}
	/**
	 * @return the unitPrice
	 */
	public String getUnitPrice() {
		return unitPrice;
	}
	/**
	 * @param unitPrice the unitPrice to set
	 */
	public void setUnitPrice(String unitPrice) {
		this.unitPrice = unitPrice;
	}
	
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("MyGengoLanguagePair [source=");
		builder.append(source);
		builder.append(", target=");
		builder.append(target);
		builder.append(", tier=");
		builder.append(tier);
		builder.append(", unitPrice=");
		builder.append(unitPrice);
		builder.append("]");
		return builder.toString();
	}
	
	public String toJSONString(){
		JSONStringer stringer = new JSONStringer();
		try {
			stringer.object()
				.key("source").value(source)
				.key("target").value(target)
				.key("unitPrice").value(unitPrice)
				.key("tier").value(tier)
			.endObject();
			return stringer.toString();
		} catch (JSONException e) {
			LOGGER.error("Failed to serialize JSON", e);
			return "{}";
		}
	}
	
}
