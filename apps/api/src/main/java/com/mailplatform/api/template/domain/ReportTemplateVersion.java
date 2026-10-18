package com.mailplatform.api.template.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

// report_template_versions 테이블의 한 행입니다. 양식의 섹션·필드는 schemaSnapshot에 통째로 들어 있습니다.
@Entity
@Table(name = "report_template_versions")
public class ReportTemplateVersion {

    @Id
    private UUID id;

    // 다른 엔티티와 연관관계(@ManyToOne)를 맺지 않고 id만 들고 있어 조회 흐름을 단순하게 둡니다.
    @Column(nullable = false)
    private UUID templateId;

    // DRAFT는 번호가 없으므로 기본형 int가 아닌 Integer(null 허용)를 씁니다.
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportTemplateVersionStatus status;

    // @JdbcTypeCode(SqlTypes.JSON)은 이 필드를 jsonb 컬럼과 JSON으로 주고받게 합니다.
    // JsonNode로 받으면 API 응답에 문자열이 아닌 JSON 객체 그대로 내보낼 수 있습니다.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private JsonNode schemaSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportTemplateVersionOrigin origin;

    private Instant publishedAt;

    protected ReportTemplateVersion() {
    }

    public UUID getId() {
        return id;
    }

    public UUID getTemplateId() {
        return templateId;
    }

    public Integer getVersion() {
        return version;
    }

    public ReportTemplateVersionStatus getStatus() {
        return status;
    }

    public JsonNode getSchemaSnapshot() {
        return schemaSnapshot;
    }

    public ReportTemplateVersionOrigin getOrigin() {
        return origin;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
