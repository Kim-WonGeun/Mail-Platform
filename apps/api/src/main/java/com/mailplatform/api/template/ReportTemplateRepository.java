package com.mailplatform.api.template;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

// 인터페이스만 선언하면 Spring Data JPA가 구현체를 만들어 줍니다.
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, UUID> {

    // 메서드 이름을 해석해 "where status = ? order by id asc" 쿼리를 만듭니다.
    List<ReportTemplate> findByStatusOrderByIdAsc(ReportTemplateStatus status);
}
