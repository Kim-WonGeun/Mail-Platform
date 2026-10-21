package com.mailplatform.api.template.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

// 엔티티는 report_templates 테이블의 한 행을 나타내는 객체입니다.
// 이 객체는 서비스 내부에서만 사용하고, 응답으로는 DTO를 내보냅니다.
@Entity
@Table(name = "report_templates")
public class ReportTemplate {

    @Id
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    private String description;

    // DB에는 enum 이름(ACTIVE 등)을 문자열로 저장합니다.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportTemplateStatus status;

    // 최신 발행 버전을 가리킵니다. 발행 전이면 null입니다.
    private UUID currentVersionId;

    // JPA가 조회 결과로 객체를 만들 때 사용하는 기본 생성자입니다.
    protected ReportTemplate() {
    }

    private ReportTemplate(UUID id, String name, String description, ReportTemplateStatus status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
    }

    // 새 양식을 만드는 방법을 한곳에 모읍니다. id는 설계 문서대로 애플리케이션에서 생성합니다.
    // 새 양식은 한 번도 발행하지 않았으므로 DRAFT로 시작하고, 보고서 작성 목록(ACTIVE)에는 아직 나오지 않습니다.
    // created_at, updated_at은 엔티티에 없으므로 DB의 기본값(now())이 채웁니다.
    public static ReportTemplate create(String name, String description) {
        return new ReportTemplate(UUID.randomUUID(), name, description, ReportTemplateStatus.DRAFT);
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public ReportTemplateStatus getStatus() {
        return status;
    }

    public UUID getCurrentVersionId() {
        return currentVersionId;
    }
}
