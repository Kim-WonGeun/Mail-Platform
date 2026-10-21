package com.mailplatform.api.template.repository;

import com.mailplatform.api.template.domain.ReportTemplate;
import com.mailplatform.api.template.domain.ReportTemplateStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

// 인터페이스만 선언하면 Spring Data JPA가 구현체를 만들어 줍니다.
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, UUID> {

    // 메서드 이름을 해석해 "where status = ? order by id asc" 쿼리를 만듭니다.
    List<ReportTemplate> findByStatusOrderByIdAsc(ReportTemplateStatus status);

    // "where id = ? and status in (?, ?)" 쿼리를 만듭니다. 여러 상태 중 하나와 일치하는 양식을 찾습니다.
    // 결과가 없을 수 있으므로 null 대신 Optional로 감싸서 반환합니다.
    Optional<ReportTemplate> findByIdAndStatusIn(UUID id, Collection<ReportTemplateStatus> statuses);
}
