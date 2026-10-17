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
                .andExpect(jsonPath("$[0].description").value("한 주 동안의 주요 메일 정리"));
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
}
