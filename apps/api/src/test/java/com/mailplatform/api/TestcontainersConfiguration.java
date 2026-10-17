package com.mailplatform.api;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

// 테스트에서 사용할 PostgreSQL 컨테이너를 Bean으로 등록합니다.
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    // @ServiceConnection은 컨테이너의 접속 정보로 datasource 설정을 덮어씁니다.
    // 그래서 테스트는 로컬 Docker Compose DB가 아닌 테스트 전용 컨테이너를 사용합니다.
    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer("postgres:17");
    }
}
