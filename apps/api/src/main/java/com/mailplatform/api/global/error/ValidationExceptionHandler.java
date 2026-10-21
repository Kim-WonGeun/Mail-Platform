package com.mailplatform.api.global.error;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// @RestControllerAdvice는 모든 Controller에서 발생한 예외를 한곳에서 처리합니다.
@RestControllerAdvice
public class ValidationExceptionHandler {

    // @Valid 검증에 실패하면 MethodArgumentNotValidException이 발생합니다.
    // 기본 응답에는 필드별 이유가 없으므로, 화면에서 바로 쓸 수 있게 errors에 담아 돌려줍니다.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException exception) {
        // ProblemDetail은 오류 응답 표준(RFC 9457) 형식입니다. status, title, detail 등을 가집니다.
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "입력값을 확인해 주세요.");

        // 필드 이름 → 오류 메시지. 한 필드에 오류가 여러 개면 첫 번째만 사용합니다.
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        problem.setProperty("errors", errors);

        return problem;
    }
}
