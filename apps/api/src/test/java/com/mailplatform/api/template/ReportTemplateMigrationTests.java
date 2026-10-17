package com.mailplatform.api.template;

import static org.assertj.core.api.Assertions.assertThat;

import com.mailplatform.api.TestcontainersConfiguration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

// 애플리케이션이 시작될 때 Flyway가 테이블과 샘플 데이터를 만들었는지 확인합니다.
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ReportTemplateMigrationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void seedsActiveReportTemplates() {
        List<String> names = jdbcTemplate.queryForList(
                "select name from report_templates where status = 'ACTIVE' order by id",
                String.class);

        assertThat(names).containsExactly("주간 요약", "고객 문의 분석", "업무 진행 현황");
    }
}
