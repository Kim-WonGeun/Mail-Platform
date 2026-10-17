package com.mailplatform.api.template;

import com.mailplatform.api.template.dto.TemplateResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service는 업무 규칙을 담습니다. 여기서는 "사용 가능한(ACTIVE) 양식만 보여준다"가 규칙입니다.
@Service
public class TemplateService {

    private final ReportTemplateRepository reportTemplateRepository;

    // 생성자로 의존성을 받으면 Spring이 Repository 구현체를 넣어 줍니다.
    public TemplateService(ReportTemplateRepository reportTemplateRepository) {
        this.reportTemplateRepository = reportTemplateRepository;
    }

    // 조회만 하므로 readOnly 트랜잭션으로 실행합니다.
    @Transactional(readOnly = true)
    public List<TemplateResponse> findActiveTemplates() {
        return reportTemplateRepository.findByStatusOrderByIdAsc(ReportTemplateStatus.ACTIVE)
                .stream()
                .map(TemplateResponse::from)
                .toList();
    }
}
