package com.mailplatform.api.template.exception;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 이 예외가 Controller 밖으로 나가면 Spring이 404 Not Found로 응답합니다.
@ResponseStatus(HttpStatus.NOT_FOUND)
public class TemplateNotFoundException extends RuntimeException {

    public TemplateNotFoundException(UUID id) {
        super("양식을 찾을 수 없습니다: " + id);
    }
}
