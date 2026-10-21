package com.mailplatform.api.template.domain;

// 양식 버전의 상태입니다. DRAFT는 편집 중, PUBLISHED는 보고서 생성에 쓸 수 있는 확정본입니다.
public enum ReportTemplateVersionStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
