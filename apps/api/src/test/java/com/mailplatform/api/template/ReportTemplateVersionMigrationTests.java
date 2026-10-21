package com.mailplatform.api.template;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.mailplatform.api.TestcontainersConfiguration;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

// V3(버전 테이블)와 V4(기본 양식 v1 시드)가 의도대로 적용됐는지 확인합니다.
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ReportTemplateVersionMigrationTests {

    // Gradle은 apps/api 폴더에서 테스트를 실행하므로 저장소 루트의 예시 파일을 상대 경로로 찾습니다.
    private static final Path EXAMPLES = Path.of("../../packages/report-schema/examples");

    private static final String WEEKLY_SUMMARY_ID = "00000000-0000-0000-0000-000000000001";

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void linksEachSeedTemplateToPublishedVersionOne() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select t.name, v.version, v.status, v.published_at is not null as published
                from report_templates t
                join report_template_versions v on v.id = t.current_version_id
                order by t.id
                """);

        assertThat(rows).extracting(row -> row.get("name"))
                .containsExactly("주간 요약", "고객 문의 분석", "업무 진행 현황");
        assertThat(rows).allSatisfy(row -> {
            assertThat(row.get("version")).isEqualTo(1);
            assertThat(row.get("status")).isEqualTo("PUBLISHED");
            assertThat(row.get("published")).isEqualTo(true);
        });
    }

    // 시드 SQL에 복사한 스키마가 packages/report-schema의 예시 파일과 달라지면 실패합니다.
    // jsonb는 키 순서를 바꿔 저장하지만, JsonNode 비교는 키 순서를 따지지 않습니다.
    @ParameterizedTest
    @CsvSource({
            "00000000-0000-0000-0000-000000000001, weekly-summary.json",
            "00000000-0000-0000-0000-000000000002, customer-inquiry.json",
            "00000000-0000-0000-0000-000000000003, work-progress.json"
    })
    void seedSchemaMatchesExampleFile(String templateId, String exampleFile) throws Exception {
        String stored = jdbcTemplate.queryForObject("""
                select v.schema_snapshot::text
                from report_templates t
                join report_template_versions v on v.id = t.current_version_id
                where t.id = ?::uuid
                """, String.class, templateId);

        JsonNode expected = objectMapper.readTree(Files.readString(EXAMPLES.resolve(exampleFile)));

        assertThat(objectMapper.readTree(stored)).isEqualTo(expected);
    }

    // 실패한 insert 뒤에도 @Transactional이 테스트 끝에 모두 되돌립니다.
    @Test
    @Transactional
    void allowsOnlyOneDraftPerTemplate() {
        insertVersion(WEEKLY_SUMMARY_ID, null, "DRAFT");

        assertThatThrownBy(() -> insertVersion(WEEKLY_SUMMARY_ID, null, "DRAFT"))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("uq_report_template_versions_one_draft");
    }

    @Test
    @Transactional
    void rejectsDuplicateVersionNumber() {
        assertThatThrownBy(() -> insertVersion(WEEKLY_SUMMARY_ID, 1, "PUBLISHED"))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("uq_report_template_versions_template_version");
    }

    @Test
    @Transactional
    void rejectsDraftWithVersionNumber() {
        assertThatThrownBy(() -> insertVersion(WEEKLY_SUMMARY_ID, 2, "DRAFT"))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("ck_report_template_versions_version_status");
    }

    // DRAFT는 발행 시각 없이, 나머지는 발행 시각을 넣어 저장합니다.
    private void insertVersion(String templateId, Integer version, String status) {
        jdbcTemplate.update("""
                insert into report_template_versions
                    (id, template_id, version, status, schema_snapshot, origin, published_at)
                values (gen_random_uuid(), ?::uuid, ?, ?, '{}'::jsonb, 'BUILDER',
                        case when ? = 'DRAFT' then null else now() end)
                """, templateId, version, status, status);
    }
}
