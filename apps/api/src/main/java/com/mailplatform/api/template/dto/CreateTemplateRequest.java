package com.mailplatform.api.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// 양식 생성 요청 본문(JSON)을 담는 DTO입니다.
// 검증 규칙은 Controller의 @Valid가 붙은 곳에서 실행됩니다.
public record CreateTemplateRequest(
        // null, 빈 문자열, 공백만 있는 문자열을 모두 거부합니다.
        @NotBlank(message = "양식 이름을 입력해 주세요.")
        // DB 컬럼(varchar(150))보다 긴 값이 들어오기 전에 막습니다.
        @Size(max = 150, message = "양식 이름은 150자 이하로 입력해 주세요.")
        String name,

        // 설명은 선택 항목이므로 null을 허용하고 길이만 제한합니다.
        @Size(max = 1000, message = "양식 설명은 1000자 이하로 입력해 주세요.")
        String description) {
}
