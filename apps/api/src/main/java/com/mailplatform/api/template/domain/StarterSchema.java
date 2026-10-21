package com.mailplatform.api.template.domain;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.JsonNodeFactory;
import tools.jackson.databind.node.ObjectNode;

// 새 양식의 시작 초안입니다. 빈 화면보다 고칠 대상이 있는 편이 쉬우므로 섹션 하나, 필드 하나로 시작합니다.
// 형식은 packages/report-schema/template.schema.json을 따릅니다.
public final class StarterSchema {

    private static final JsonNodeFactory NODES = JsonNodeFactory.instance;

    private StarterSchema() {
    }

    public static JsonNode create(String templateName) {
        // JsonNodeFactory로 JSON 객체(ObjectNode)와 배열(ArrayNode)을 코드로 만듭니다.
        ObjectNode headline = NODES.objectNode()
                .put("key", "field1")
                .put("label", "한 줄 요약")
                .put("type", "TEXT")
                .put("required", true);

        ObjectNode section = NODES.objectNode()
                .put("key", "section1")
                .put("title", "요약");
        section.putArray("fields").add(headline);

        ObjectNode schema = NODES.objectNode()
                .put("schemaVersion", 1)
                // 제목 형식은 양식 이름으로 시작하고, 사용자가 빌더에서 변수를 넣어 고칩니다.
                .put("titleFormat", templateName);
        ArrayNode sections = schema.putArray("sections");
        sections.add(section);

        return schema;
    }
}
