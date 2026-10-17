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

사용 가능한(`ACTIVE`) 양식 하나를 반환합니다. 응답 필드는 목록의 항목과 같습니다.

| 상태 코드 | 설명 |
| --- | --- |
| `200 OK` | 양식을 찾았습니다. |
| `400 Bad Request` | `id`가 UUID 형식이 아닙니다. |
| `404 Not Found` | 양식이 없거나 `ACTIVE`가 아닙니다. |
