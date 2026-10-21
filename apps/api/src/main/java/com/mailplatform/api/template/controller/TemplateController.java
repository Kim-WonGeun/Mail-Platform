package com.mailplatform.api.template.controller;

import com.mailplatform.api.template.dto.CreateTemplateRequest;
import com.mailplatform.api.template.dto.TemplateDetailResponse;
import com.mailplatform.api.template.dto.TemplateResponse;
import com.mailplatform.api.template.service.TemplateService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        return templateService.findTemplate(id);
    }

    // @RequestBody는 요청 JSON을 DTO로 바꾸고, @Valid는 DTO의 검증 규칙을 실행합니다.
    // 검증에 실패하면 이 메서드는 실행되지 않고 400 응답이 나갑니다.
    @PostMapping
    public ResponseEntity<TemplateResponse> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request) {
        TemplateResponse created = templateService.createTemplate(request);

        // 201 Created와 함께 새 양식을 조회할 수 있는 주소를 Location 헤더로 알려줍니다.
        URI location = URI.create("/api/v1/templates/" + created.id());
        return ResponseEntity.created(location).body(created);
    }
}
