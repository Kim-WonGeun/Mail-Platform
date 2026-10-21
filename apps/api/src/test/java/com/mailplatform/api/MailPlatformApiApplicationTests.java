package com.mailplatform.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

// DB 연결이 필요하므로 테스트용 PostgreSQL 컨테이너 설정을 함께 불러옵니다.
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class MailPlatformApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
