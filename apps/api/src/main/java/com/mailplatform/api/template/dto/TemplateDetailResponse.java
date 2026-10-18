package com.mailplatform.api.template.dto;

import com.mailplatform.api.template.domain.ReportTemplate;
import com.mailplatform.api.template.domain.ReportTemplateVersion;
import java.util.UUID;
import tools.jackson.databind.JsonNode;

// 상세 응답입니다. 목록 응답(TemplateResponse)은 가볍게 두고, 상세에서만 양식 스키마를 내려줍니다.
// 아직 발행된 버전이 없는 양식은 version과 schema가 null입니다.
public record TemplateDetailResponse(
        UUID id,
        String name,
        String description,
        Integer version,
        JsonNode schema) {

    public static TemplateDetailResponse of(ReportTemplate template, ReportTemplateVersion currentVersion) {
        return new TemplateDetailResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                currentVersion == null ? null : currentVersion.getVersion(),
                currentVersion == null ? null : currentVersion.getSchemaSnapshot());
    }
}
