# API

외부에 공개하는 API 계약입니다. 경로에는 버전(`/api/v1`)을 붙입니다.

## 보고서 양식

### `GET /api/v1/templates`

사용 가능한(`ACTIVE`) 보고서 양식 목록을 반환합니다.

응답 `200 OK`:

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "주간 요약",
    "description": "한 주 동안의 주요 메일 정리"
  }
]
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `string` (UUID) | 양식 ID |
| `name` | `string` | 양식 이름 |
| `description` | `string` \| `null` | 양식 설명 |

### `GET /api/v1/templates/{id}`

양식 하나와 현재 발행 버전의 스키마를 반환합니다. 발행 전(`DRAFT`) 양식도 조회되고, 보관된(`ARCHIVED`) 양식은 조회되지 않습니다.

응답 `200 OK`:

```json
{
  "id": "00000000-0000-0000-0000-000000000003",
  "name": "업무 진행 현황",
  "description": "메일에서 진행 상황과 후속 작업 정리",
  "version": 1,
  "schema": {
    "schemaVersion": 1,
    "titleFormat": "{{teamName}} 업무 진행 현황 ({{period.start}}~{{period.end}})",
    "variables": [ { "key": "teamName", "label": "팀 이름", "type": "TEXT", "required": true } ],
    "sections": [
      {
        "key": "summary",
        "title": "요약",
        "fields": [ { "key": "headline", "label": "한 줄 요약", "type": "TEXT", "required": true } ]
      }
    ]
  }
}
```

(`schema`는 축약했습니다.)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id`, `name`, `description` | | 목록 항목과 같습니다. |
| `version` | `number` \| `null` | 현재 발행 버전 번호. 발행된 버전이 없으면 `null` |
| `schema` | `object` \| `null` | 양식 스키마. 형식은 `packages/report-schema/template.schema.json`. 발행된 버전이 없으면 `null` |

| 상태 코드 | 설명 |
| --- | --- |
| `200 OK` | 양식을 찾았습니다. |
| `400 Bad Request` | `id`가 UUID 형식이 아닙니다. |
| `404 Not Found` | 양식이 없거나 보관(`ARCHIVED`)되었습니다. |

### `POST /api/v1/templates`

새 보고서 양식을 만듭니다.

- 양식은 `DRAFT`(발행 전) 상태로 저장됩니다. 발행하기 전까지 `GET /api/v1/templates` 목록에는 나오지 않습니다.
- 빌더에서 편집을 시작할 초안 버전이 함께 만들어집니다. 섹션 하나(`section1`)와 필드 하나(`field1`)가 들어 있고, 제목 형식은 양식 이름입니다.
- 양식 등록 흐름 전체는 [template-registration-design.md](template-registration-design.md)를 참고합니다.

요청:

```json
{
  "name": "월간 리포트",
  "description": "한 달 동안의 메일 정리"
}
```

| 필드 | 타입 | 규칙 |
| --- | --- | --- |
| `name` | `string` | 필수, 공백만 입력 불가, 150자 이하. 앞뒤 공백은 제거합니다. |
| `description` | `string` \| `null` | 선택, 1000자 이하. 공백뿐이면 `null`로 저장합니다. |

응답 `201 Created`: `Location` 헤더에 `/api/v1/templates/{id}`, 본문은 목록 항목과 같은 형식입니다. `Location`의 상세 조회는 `version`과 `schema`가 `null`입니다.

응답 `400 Bad Request` (`application/problem+json`):

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "입력값을 확인해 주세요.",
  "instance": "/api/v1/templates",
  "errors": {
    "name": "양식 이름을 입력해 주세요."
  }
}
```
