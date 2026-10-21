package com.mailplatform.api.template;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mailplatform.api.TestcontainersConfiguration;
import jakarta.persistence.EntityManager;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

// 테스트마다 저장한 양식이 남지 않도록 클래스 전체에 @Transactional을 붙여 롤백합니다.
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class TemplateCreateTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void createsDraftTemplate() throws Exception {
        String body = """
                {"name": "  월간 리포트  ", "description": "한 달 동안의 메일 정리"}
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", startsWith("/api/v1/templates/")))
                .andExpect(jsonPath("$.id").isNotEmpty())
                // 앞뒤 공백은 제거하고 저장합니다.
                .andExpect(jsonPath("$.name").value("월간 리포트"))
                .andExpect(jsonPath("$.description").value("한 달 동안의 메일 정리"))
                .andReturn();

        // 새 양식은 발행 전(DRAFT)이므로 보고서 작성용 목록(ACTIVE)에는 아직 나오지 않습니다.
        mockMvc.perform(get("/api/v1/templates"))
                .andExpect(jsonPath("$.length()").value(3));
        entityManager.flush();
        String status = jdbcTemplate.queryForObject(
                "select status from report_templates where name = '월간 리포트'", String.class);
        assertThat(status).isEqualTo("DRAFT");

        // Location이 가리키는 상세는 조회되고, 발행 버전이 없으므로 version과 schema가 비어 있습니다.
        mockMvc.perform(get(result.getResponse().getHeader("Location")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("월간 리포트"))
                .andExpect(jsonPath("$.version").isEmpty())
                .andExpect(jsonPath("$.schema").isEmpty());
    }

    // 양식과 함께 빌더에서 편집을 시작할 초안 버전이 하나 만들어집니다.
    @Test
    void createsStarterDraftVersion() throws Exception {
        mockMvc.perform(post("/api/v1/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "분기 실적 보고"}
                                """))
                .andExpect(status().isCreated());

        // JPA는 save한 내용을 트랜잭션이 끝날 때까지 모아 두었다가 한꺼번에 DB에 씁니다(쓰기 지연).
        // 이 테스트는 트랜잭션 안에서 JdbcTemplate으로 직접 SQL을 실행하므로, 먼저 flush로 DB에 반영합니다.
        entityManager.flush();

        Map<String, Object> draft = jdbcTemplate.queryForMap("""
                select v.status, v.version, v.origin, v.published_at,
                       v.schema_snapshot ->> 'titleFormat' as title_format,
                       jsonb_array_length(v.schema_snapshot -> 'sections') as section_count,
                       t.current_version_id
                from report_template_versions v
                join report_templates t on t.id = v.template_id
                where t.name = '분기 실적 보고'
                """);

        assertThat(draft.get("status")).isEqualTo("DRAFT");
        assertThat(draft.get("version")).isNull();
        assertThat(draft.get("origin")).isEqualTo("BUILDER");
        assertThat(draft.get("published_at")).isNull();
        // 제목 형식은 양식 이름으로 시작합니다.
        assertThat(draft.get("title_format")).isEqualTo("분기 실적 보고");
        assertThat(draft.get("section_count")).isEqualTo(1);
        // 초안은 아직 "현재 버전"이 아닙니다. 발행해야 current_version_id가 채워집니다.
        assertThat(draft.get("current_version_id")).isNull();
    }

    @Test
    void storesBlankDescriptionAsNull() throws Exception {
        mockMvc.perform(post("/api/v1/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "설명 없는 양식", "description": "   "}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").doesNotExist());
    }

    @Test
    void rejectsBlankName() throws Exception {
        mockMvc.perform(post("/api/v1/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "   "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("입력값을 확인해 주세요."))
                .andExpect(jsonPath("$.errors.name").value("양식 이름을 입력해 주세요."));
    }

    @Test
    void rejectsTooLongName() throws Exception {
        String longName = "가".repeat(151);

        mockMvc.perform(post("/api/v1/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"" + longName + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("양식 이름은 150자 이하로 입력해 주세요."));

        // 검증에 실패하면 양식도 초안도 저장하지 않습니다.
        Integer templateCount = jdbcTemplate.queryForObject("select count(*) from report_templates", Integer.class);
        Integer versionCount = jdbcTemplate.queryForObject(
                "select count(*) from report_template_versions", Integer.class);
        assertThat(templateCount).isEqualTo(3);
        assertThat(versionCount).isEqualTo(3);
    }
}
