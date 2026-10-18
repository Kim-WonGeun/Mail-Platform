package com.mailplatform.api.template;

import com.mailplatform.api.template.dto.TemplateDetailResponse;
import com.mailplatform.api.template.dto.TemplateResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Controller는 HTTP 요청을 받아 Service를 호출하고, 결과를 JSON으로 응답합니다.
// 외부 공개 API이므로 경로에 버전(v1)을 붙입니다.
@RestController
@RequestMapping("/api/v1/templates")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public List<TemplateResponse> getTemplates() {
        return templateService.findActiveTemplates();
    }

    // {id} 자리의 값을 @PathVariable로 받습니다. UUID 형식이 아니면 Spring이 400으로 응답합니다.
    @GetMapping("/{id}")
    public TemplateDetailResponse getTemplate(@PathVariable UUID id) {
        return templateService.findActiveTemplate(id);
    }
}
