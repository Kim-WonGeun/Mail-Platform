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

사용 가능한(`ACTIVE`) 양식 하나와 현재 발행 버전의 스키마를 반환합니다.

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
| `404 Not Found` | 양식이 없거나 `ACTIVE`가 아닙니다. |
