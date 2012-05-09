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

package com.myGengo.alfresco.model;

import org.alfresco.service.namespace.QName;

public interface MyGengoModel{
    static final String NAMESPACE_MYGENGOMODEL = "http://www.mygengo.com/model/alfresco/1.0";

    /* --- TYPES --- */
    static final QName TYPE_TRANSLATIONJOB = QName.createQName(NAMESPACE_MYGENGOMODEL, "translationJob");

    /* --- ASPECTS --- */
    static final QName ASPECT_ACCOUNT = QName.createQName(NAMESPACE_MYGENGOMODEL, "account");
    static final QName ASPECT_APPROVED = QName.createQName(NAMESPACE_MYGENGOMODEL, "approved");
    static final QName ASPECT_COMMENT = QName.createQName(NAMESPACE_MYGENGOMODEL, "comment");
    static final QName ASPECT_LANGUAGES = QName.createQName(NAMESPACE_MYGENGOMODEL, "languages");
    static final QName ASPECT_REJECTED = QName.createQName(NAMESPACE_MYGENGOMODEL, "rejected");
    static final QName ASPECT_REVISED = QName.createQName(NAMESPACE_MYGENGOMODEL, "revised");

    /* --- PROPERTIES --- */
    static final QName PROP_APPNAME = QName.createQName(NAMESPACE_MYGENGOMODEL, "appName");
    static final QName PROP_AUTOAPPROVE = QName.createQName(NAMESPACE_MYGENGOMODEL, "autoApprove");
    static final QName PROP_CAPTCHAURL = QName.createQName(NAMESPACE_MYGENGOMODEL, "captchaUrl");
    static final QName PROP_COMMENTMODIFIEDTIME = QName.createQName(NAMESPACE_MYGENGOMODEL, "commentModifiedTime");
    static final QName PROP_CREDITS = QName.createQName(NAMESPACE_MYGENGOMODEL, "credits");
    static final QName PROP_CREDITSSPENT = QName.createQName(NAMESPACE_MYGENGOMODEL, "creditsSpent");
    static final QName PROP_ETA = QName.createQName(NAMESPACE_MYGENGOMODEL, "eta");
    static final QName PROP_FEEDBACKPUBLIC = QName.createQName(NAMESPACE_MYGENGOMODEL, "feedbackPublic");
    static final QName PROP_JOBCREDITS = QName.createQName(NAMESPACE_MYGENGOMODEL, "jobCredits");
    static final QName PROP_JOBID = QName.createQName(NAMESPACE_MYGENGOMODEL, "jobId");
    static final QName PROP_LANGUAGES = QName.createQName(NAMESPACE_MYGENGOMODEL, "languages");
    static final QName PROP_MODIFIED = QName.createQName(NAMESPACE_MYGENGOMODEL, "modified");
    static final QName PROP_MYGENGOFEEDBACK = QName.createQName(NAMESPACE_MYGENGOMODEL, "myGengoFeedback");
    static final QName PROP_PREVIEWURL = QName.createQName(NAMESPACE_MYGENGOMODEL, "previewUrl");
    static final QName PROP_PRIVATEKEY = QName.createQName(NAMESPACE_MYGENGOMODEL, "privateKey");
    static final QName PROP_PUBLICKEY = QName.createQName(NAMESPACE_MYGENGOMODEL, "publicKey");
    static final QName PROP_RATING = QName.createQName(NAMESPACE_MYGENGOMODEL, "rating");
    static final QName PROP_REJECTCAPTCHA = QName.createQName(NAMESPACE_MYGENGOMODEL, "rejectCaptcha");
    static final QName PROP_REJECTCOMMENT = QName.createQName(NAMESPACE_MYGENGOMODEL, "rejectComment");
    static final QName PROP_REJECTREASON = QName.createQName(NAMESPACE_MYGENGOMODEL, "rejectReason");
    static final QName PROP_REJECTREQUEUE = QName.createQName(NAMESPACE_MYGENGOMODEL, "rejectRequeue");
    static final QName PROP_REVISECOMMENT = QName.createQName(NAMESPACE_MYGENGOMODEL, "reviseComment");
    static final QName PROP_SOURCELANGUAGE = QName.createQName(NAMESPACE_MYGENGOMODEL, "sourceLanguage");
    static final QName PROP_STATUS = QName.createQName(NAMESPACE_MYGENGOMODEL, "status");
    static final QName PROP_TARGETLANGUAGE = QName.createQName(NAMESPACE_MYGENGOMODEL, "targetLanguage");
    static final QName PROP_TEXT = QName.createQName(NAMESPACE_MYGENGOMODEL, "text");
    static final QName PROP_TIER = QName.createQName(NAMESPACE_MYGENGOMODEL, "tier");
    static final QName PROP_TITLE = QName.createQName(NAMESPACE_MYGENGOMODEL, "title");
    static final QName PROP_TRANSLATION = QName.createQName(NAMESPACE_MYGENGOMODEL, "translation");
    static final QName PROP_TRANSLATIONPREVIEW = QName.createQName(NAMESPACE_MYGENGOMODEL, "translationPreview");
    static final QName PROP_TRANSLATORFEEDBACK = QName.createQName(NAMESPACE_MYGENGOMODEL, "translatorFeedback");
    static final QName PROP_UNITCOUNT = QName.createQName(NAMESPACE_MYGENGOMODEL, "unitCount");
    static final QName PROP_UNITTYPE = QName.createQName(NAMESPACE_MYGENGOMODEL, "unitType");
    static final QName PROP_USERSINCE = QName.createQName(NAMESPACE_MYGENGOMODEL, "userSince");


}
