package com.myGengo.alfresco.translate;
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

import java.io.Serializable;
/**
 * bean representing a myGengo quotation encapsulating unitCount, credits &amp; eta (estimated time) data
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoQuote implements Serializable{

	private static final long serialVersionUID = -7263691171552849252L;
	
	private final long unitCount;
	private final double credits;
	private final long eta;
	
	public MyGengoQuote(final long unitCount, final double credits, final long eta){
		this.unitCount = unitCount;
		this.credits = credits;
		this.eta = eta;
	}

	public long getUnitCount() {
		return unitCount;
	}
	public long getEta() {
		return eta;
	}
	public double getCredits() {
		return credits;
	}
}
