package com.mailplatform.api.template;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mailplatform.api.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

// MockMvc는 서버를 실제로 띄우지 않고 HTTP 요청을 흉내 내 Controller부터 DB까지 검증합니다.
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class TemplateControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void returnsActiveTemplates() throws Exception {
        mockMvc.perform(get("/api/v1/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value("00000000-0000-0000-0000-000000000001"))
                .andExpect(jsonPath("$[0].name").value("주간 요약"))
                .andExpect(jsonPath("$[0].description").value("한 주 동안의 주요 메일 정리"))
                // 목록은 가볍게 유지하므로 스키마를 내려주지 않습니다.
                .andExpect(jsonPath("$[0].schema").doesNotExist());
    }

    // @Transactional은 테스트가 끝나면 변경을 되돌려 다른 테스트에 영향을 주지 않게 합니다.
    @Test
    @Transactional
    void excludesArchivedTemplates() throws Exception {
        jdbcTemplate.update(
                "update report_templates set status = 'ARCHIVED' where id = '00000000-0000-0000-0000-000000000002'");

        mockMvc.perform(get("/api/v1/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].name").value("업무 진행 현황"));
    }

    @Test
    void returnsTemplateById() throws Exception {
        mockMvc.perform(get("/api/v1/templates/00000000-0000-0000-0000-000000000002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("고객 문의 분석"))
                .andExpect(jsonPath("$.description").value("고객 문의 유형과 주요 요청 정리"));
    }

    // 상세 응답에는 현재 발행 버전의 번호와 스키마(섹션·필드)가 JSON 객체로 들어 있습니다.
    @Test
    void returnsCurrentVersionSchemaWithTemplate() throws Exception {
        mockMvc.perform(get("/api/v1/templates/00000000-0000-0000-0000-000000000002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.schema.schemaVersion").value(1))
                .andExpect(jsonPath("$.schema.sections.length()").value(4))
                .andExpect(jsonPath("$.schema.sections[2].key").value("inquiries"))
                .andExpect(jsonPath("$.schema.sections[2].fields[0].type").value("TABLE"))
                .andExpect(jsonPath("$.schema.sections[2].fields[0].options.columns.length()").value(5));
    }

    // 발행된 버전이 없는 양식도 조회는 되고, version과 schema만 비어 있습니다.
    @Test
    @Transactional
    void returnsNullSchemaWhenTemplateHasNoPublishedVersion() throws Exception {
        jdbcTemplate.update(
                "update report_templates set current_version_id = null where id = '00000000-0000-0000-0000-000000000002'");

        mockMvc.perform(get("/api/v1/templates/00000000-0000-0000-0000-000000000002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("고객 문의 분석"))
                .andExpect(jsonPath("$.version").isEmpty())
                .andExpect(jsonPath("$.schema").isEmpty());
    }

    @Test
    void returnsNotFoundForUnknownId() throws Exception {
        mockMvc.perform(get("/api/v1/templates/00000000-0000-0000-0000-000000000099"))
                .andExpect(status().isNotFound());
    }

    // 목록에서 빠진 보관(ARCHIVED) 양식은 상세 조회에서도 찾을 수 없어야 합니다.
    @Test
    @Transactional
    void returnsNotFoundForArchivedTemplate() throws Exception {
        jdbcTemplate.update(
                "update report_templates set status = 'ARCHIVED' where id = '00000000-0000-0000-0000-000000000002'");

        mockMvc.perform(get("/api/v1/templates/00000000-0000-0000-0000-000000000002"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returnsBadRequestForInvalidId() throws Exception {
        mockMvc.perform(get("/api/v1/templates/not-a-uuid"))
                .andExpect(status().isBadRequest());
    }
}
