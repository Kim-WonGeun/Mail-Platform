package com.mailplatform.api.template.domain;

// 양식 상태를 문자열 대신 enum으로 다뤄 잘못된 값이 들어오지 않게 합니다.
public enum ReportTemplateStatus {
    DRAFT,
    ACTIVE,
    ARCHIVED
}
