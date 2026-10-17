package com.mailplatform.api.template.dto;

import com.mailplatform.api.template.ReportTemplate;
import java.util.UUID;

// API 응답 계약입니다. 엔티티 구조가 바뀌어도 응답 모양은 이 record로 고정합니다.
public record TemplateResponse(UUID id, String name, String description) {

    // 엔티티에서 응답에 필요한 값만 꺼내 DTO로 바꿉니다.
    public static TemplateResponse from(ReportTemplate template) {
        return new TemplateResponse(template.getId(), template.getName(), template.getDescription());
    }
}
