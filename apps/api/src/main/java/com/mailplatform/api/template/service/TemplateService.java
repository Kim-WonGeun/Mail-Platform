package com.mailplatform.api.template.service;

import com.mailplatform.api.template.domain.ReportTemplate;
import com.mailplatform.api.template.domain.ReportTemplateStatus;
import com.mailplatform.api.template.domain.ReportTemplateVersion;
import com.mailplatform.api.template.domain.StarterSchema;
import com.mailplatform.api.template.dto.CreateTemplateRequest;
import com.mailplatform.api.template.dto.TemplateDetailResponse;
import com.mailplatform.api.template.dto.TemplateResponse;
import com.mailplatform.api.template.exception.TemplateNotFoundException;
import com.mailplatform.api.template.repository.ReportTemplateRepository;
import com.mailplatform.api.template.repository.ReportTemplateVersionRepository;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service는 업무 규칙을 담습니다.
// - 보고서 작성 목록에는 발행된(ACTIVE) 양식만 보여줍니다.
// - 상세는 편집 중인(DRAFT) 양식도 보여주고, 보관된(ARCHIVED) 양식은 숨깁니다.
@Service
public class TemplateService {

    // EnumSet은 enum 값만 담는 Set입니다. 상세 조회에서 허용하는 상태를 한곳에 둡니다.
    private static final EnumSet<ReportTemplateStatus> VISIBLE_STATUSES =
            EnumSet.of(ReportTemplateStatus.DRAFT, ReportTemplateStatus.ACTIVE);

    private final ReportTemplateRepository reportTemplateRepository;
    private final ReportTemplateVersionRepository reportTemplateVersionRepository;

    // 생성자로 의존성을 받으면 Spring이 Repository 구현체를 넣어 줍니다.
    public TemplateService(
            ReportTemplateRepository reportTemplateRepository,
            ReportTemplateVersionRepository reportTemplateVersionRepository) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.reportTemplateVersionRepository = reportTemplateVersionRepository;
    }

    // 조회만 하므로 readOnly 트랜잭션으로 실행합니다.
    @Transactional(readOnly = true)
    public List<TemplateResponse> findActiveTemplates() {
        return reportTemplateRepository.findByStatusOrderByIdAsc(ReportTemplateStatus.ACTIVE)
                .stream()
                .map(TemplateResponse::from)
                .toList();
    }

    // DRAFT·ACTIVE 양식을 조회하고, 없거나 보관된 양식이면 404 예외를 던집니다.
    // 상세에서는 현재 발행 버전의 스키마도 함께 돌려줍니다. 발행 전 양식은 version과 schema가 null입니다.
    @Transactional(readOnly = true)
    public TemplateDetailResponse findTemplate(UUID id) {
        ReportTemplate template = reportTemplateRepository.findByIdAndStatusIn(id, VISIBLE_STATUSES)
                .orElseThrow(() -> new TemplateNotFoundException(id));

        ReportTemplateVersion currentVersion = template.getCurrentVersionId() == null
                ? null
                : reportTemplateVersionRepository.findById(template.getCurrentVersionId()).orElse(null);

        return TemplateDetailResponse.of(template, currentVersion);
    }

    // 새 양식과 빌더에서 편집을 시작할 초안 버전을 함께 만듭니다.
    // @Transactional이므로 둘 중 하나라도 저장에 실패하면 둘 다 저장되지 않습니다(롤백).
    @Transactional
    public TemplateResponse createTemplate(CreateTemplateRequest request) {
        // 앞뒤 공백은 저장하지 않고, 공백뿐인 설명은 "설명 없음"(null)으로 저장합니다.
        String name = request.name().strip();
        String description = request.description() == null || request.description().isBlank()
                ? null
                : request.description().strip();

        // 초안이 양식 id를 외래 키로 참조하므로 양식을 먼저 저장합니다.
        ReportTemplate template = reportTemplateRepository.save(ReportTemplate.create(name, description));
        reportTemplateVersionRepository.save(
                ReportTemplateVersion.draft(template.getId(), StarterSchema.create(name)));

        return TemplateResponse.from(template);
    }
}
