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

package com.myGengo.alfresco.account;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.service.namespace.QName;

import com.myGengo.alfresco.model.MyGengoModel;


/**
 * bean encapsulating myGengo account data 
 * 
 * @author Jan Pfitzner (fme AG)
 *
 */
public class MyGengoAccount implements Serializable{

	private static final long serialVersionUID = -1675907189223714523L;

	private String applicationName = null;
	
	private String privateKey = null;
	
	private String publicKey = null;
	
	private String credits = null;
	
	private String creditsSpent = null;
	
	private Date userSince = null;

	public MyGengoAccount() {
		
	}
	public MyGengoAccount(Map<QName, Serializable> properties) {
		this.applicationName = (String) properties.get(MyGengoModel.PROP_APPNAME);
		this.privateKey = (String) properties.get(MyGengoModel.PROP_PRIVATEKEY);
		this.publicKey = (String) properties.get(MyGengoModel.PROP_PUBLICKEY);
		this.credits = (String) properties.get(MyGengoModel.PROP_CREDITS);
		this.creditsSpent = (String) properties.get(MyGengoModel.PROP_CREDITSSPENT);
		this.userSince = (Date) properties.get(MyGengoModel.PROP_USERSINCE);
	}

	/**
	 * @return the applicationName
	 */
	public String getApplicationName() {
		return applicationName;
	}

	/**
	 * @param applicationName the applicationName to set
	 */
	public void setApplicationName(String applicationName) {
		this.applicationName = applicationName;
	}

	/**
	 * @return the privateKey
	 */
	public String getPrivateKey() {
		return privateKey;
	}

	/**
	 * @param privateKey the privateKey to set
	 */
	public void setPrivateKey(String privateKey) {
		this.privateKey = privateKey;
	}

	/**
	 * @return the publicKey
	 */
	public String getPublicKey() {
		return publicKey;
	}

	/**
	 * @param publicKey the publicKey to set
	 */
	public void setPublicKey(String publicKey) {
		this.publicKey = publicKey;
	}

	/**
	 * @return the credits
	 */
	public String getCredits() {
		return credits;
	}

	/**
	 * @param credits the credits to set
	 */
	public void setCredits(String credits) {
		this.credits = credits;
	}

	/**
	 * @return the creditsSpent
	 */
	public String getCreditsSpent() {
		return creditsSpent;
	}

	/**
	 * @param creditsSpent the creditsSpent to set
	 */
	public void setCreditsSpent(String creditsSpent) {
		this.creditsSpent = creditsSpent;
	}

	/**
	 * @return the userSince
	 */
	public Date getUserSince() {
		return userSince;
	}

	/**
	 * @param userSince the userSince to set
	 */
	public void setUserSince(Date userSince) {
		this.userSince = userSince;
	}
	public Map<QName, Serializable> getProperties() {
		Map<QName, Serializable> properties = new HashMap<QName, Serializable>(6, 1.0f);
		properties.put(MyGengoModel.PROP_APPNAME, this.applicationName);
		properties.put(MyGengoModel.PROP_CREDITS, this.credits);
		properties.put(MyGengoModel.PROP_CREDITSSPENT, this.creditsSpent);
		properties.put(MyGengoModel.PROP_USERSINCE, this.userSince);
		properties.put(MyGengoModel.PROP_PRIVATEKEY, this.privateKey);
		properties.put(MyGengoModel.PROP_PUBLICKEY, this.publicKey);
		return properties;
	}
	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((applicationName == null) ? 0 : applicationName.hashCode());
		result = prime * result + ((credits == null) ? 0 : credits.hashCode());
		result = prime * result
				+ ((creditsSpent == null) ? 0 : creditsSpent.hashCode());
		result = prime * result
				+ ((privateKey == null) ? 0 : privateKey.hashCode());
		result = prime * result
				+ ((publicKey == null) ? 0 : publicKey.hashCode());
		result = prime * result
				+ ((userSince == null) ? 0 : userSince.hashCode());
		return result;
	}
	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (!(obj instanceof MyGengoAccount)) {
			return false;
		}
		MyGengoAccount other = (MyGengoAccount) obj;
		if (applicationName == null) {
			if (other.applicationName != null) {
				return false;
			}
		} else if (!applicationName.equals(other.applicationName)) {
			return false;
		}
		if (credits == null) {
			if (other.credits != null) {
				return false;
			}
		} else if (!credits.equals(other.credits)) {
			return false;
		}
		if (creditsSpent == null) {
			if (other.creditsSpent != null) {
				return false;
			}
		} else if (!creditsSpent.equals(other.creditsSpent)) {
			return false;
		}
		if (privateKey == null) {
			if (other.privateKey != null) {
				return false;
			}
		} else if (!privateKey.equals(other.privateKey)) {
			return false;
		}
		if (publicKey == null) {
			if (other.publicKey != null) {
				return false;
			}
		} else if (!publicKey.equals(other.publicKey)) {
			return false;
		}
		if (userSince == null) {
			if (other.userSince != null) {
				return false;
			}
		} else if (!userSince.equals(other.userSince)) {
			return false;
		}
		return true;
	}
	
	

}
