package com.mailplatform.api.template;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportTemplateVersionRepository extends JpaRepository<ReportTemplateVersion, UUID> {
}
