package com.mailplatform.api.template.repository;

import com.mailplatform.api.template.domain.ReportTemplateVersion;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportTemplateVersionRepository extends JpaRepository<ReportTemplateVersion, UUID> {
}
