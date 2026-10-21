# 보고서 양식 등록 설계

사용자가 보고서 양식을 직접 만들고(빌더), 초안으로 저장하고, 발행해서 보고서 작성에 쓰는
기능의 설계입니다. 전체 그림은 [report-generation-design.md](report-generation-design.md)
3~4장, 스키마 형식은 [packages/report-schema](../packages/report-schema/README.md)를 따릅니다.

## 1. 범위

| 포함 | 제외 (후속) |
| --- | --- |
| 새 양식 만들기 (이름, 설명) | 기존 문서 붙여넣기 → AI 변환 (agent 필요) |
| 빌더로 구성 편집: 섹션, 필드, 타입별 옵션, 입력값, 제목 형식 | 다른 양식 복제 |
| 초안 저장, 검증 오류 표시 | 자동 저장 |
| 발행 (v1, v2 …), 발행 후 수정 → 새 버전 | 보관(ARCHIVED), 삭제 |
| 양식 관리 목록 화면 | 권한 (인증 기능 이후) |

## 2. 상태 모델

양식(`report_templates`)과 버전(`report_template_versions`) 두 단계로 상태를 가집니다.

```text
양식 status        DRAFT ──(첫 발행)──▶ ACTIVE ──(보관, 후속)──▶ ARCHIVED
                   한 번도 발행 안 됨     보고서 작성 목록에 보임

버전 status        DRAFT (양식당 최대 1개) ──(발행)──▶ PUBLISHED v1, v2, …
```

발행할 때 일어나는 일 (하나의 트랜잭션):

```text
1. 초안 schema_snapshot을 엄격하게 검증 → 오류가 있으면 발행하지 않음 (422)
2. 초안 행을 PUBLISHED로 바꾸고 version = (이 양식의 최대 버전 + 1), published_at = now()
3. report_templates.current_version_id = 이 버전, status = ACTIVE
```

- 이전에 발행한 버전은 PUBLISHED로 그대로 남깁니다. 그 버전으로 만든 보고서를 재현하기 위해서입니다.
  "현재 버전"은 `current_version_id`가 정합니다.
- 발행한 양식을 고치려면 초안을 엽니다. 초안이 없으면 현재 발행 버전의 스키마를 복사해 새 초안을 만듭니다.
- 이름·설명은 버전이 아니라 양식 자체의 속성이라 바로 수정됩니다.

## 3. 화면

### 3.1 화면 흐름

```text
사이드바 "보고서 양식"
  └▶ /templates                 양식 관리 목록 (초안 포함)
       ├▶ [새 양식] /templates/new        이름·설명 입력 → 만들기
       │      └▶ /templates/{id}/edit     빌더 (빈 초안으로 시작)
       └▶ 행 클릭 /templates/{id}         상세 (읽기 전용, 기존 화면)
              └▶ [수정] /templates/{id}/edit
```

### 3.2 양식 관리 목록 `/templates`

```text
보고서 양식                                           [ + 새 양식 ]
─────────────────────────────────────────────────────────────────
이름              상태              현재 버전   마지막 수정
주간 요약          발행됨             v1         2026-10-18
고객 문의 분석      발행됨 · 수정 중     v1         2026-10-19
분기 실적 보고      초안               —          2026-10-19
```

"수정 중"은 발행 버전이 있고 초안도 있는 상태입니다.

### 3.3 빌더 `/templates/{id}/edit`

```text
┌ 상단 ──────────────────────────────────────────────────────────────┐
│ 분기 실적 보고 (초안)          변경됨 · 오류 2개    [임시 저장] [발행] │
├ 편집 ─────────────────────────────┬ 미리보기 ─────────────────────┤
│ 기본 설정                         │                               │
│  제목 형식 [{{teamName}} 실적 보고 ] │  (TemplateSchemaView로        │
│  전체 지침 [...............]       │   현재 편집 중인 구성을 표시)   │
│  입력값  팀 이름(글, 필수) [+ 추가]  │                               │
│                                   │                               │
│ 1. 요약                  [↑][↓][×]│                               │
│    ├ 한 줄 요약 · 짧은 글 · 필수    │                               │
│    │   지침 [.................]    │                               │
│    └ [+ 필드 추가]                 │                               │
│ 2. 진행 현황             [↑][↓][×]│                               │
│    ├ 진행 항목 · 표 · 필수          │                               │
│    │   열: 업무(글) 상태(선택) …    │                               │
│ [+ 섹션 추가]                     │                               │
└───────────────────────────────────┴───────────────────────────────┘
```

- 필드는 접힌 상태로 한 줄 요약(이름 · 타입 · 필수)을 보여주고, 펼치면 타입별 옵션을 편집합니다.
- 타입별 옵션 편집기:

  | 타입 | 편집 항목 |
  | --- | --- |
  | 짧은 글, 긴 글 | 최대 글자 수 |
  | 숫자 | 단위, 최솟값, 최댓값 |
  | 날짜 | 없음 |
  | 단일·다중 선택 | 선택지 목록 (추가, 삭제, 순서) |
  | 목록 | 최소·최대 개수 |
  | 표 | 열 목록 (열마다 이름, 타입, 옵션), 최대 행 수 |
  | 고정 문구 | 내용 (지침·필수 없음) |

- 서버가 돌려준 검증 오류는 해당 섹션·필드 옆에 표시하고, 상단에 오류 개수를 보여줍니다.
- 저장하지 않은 변경이 있으면 페이지를 떠날 때 경고합니다.

### 3.4 키(key) 처리

스키마의 `key`는 AI 출력과 렌더러가 값을 찾는 식별자라 camelCase여야 하고, 버전이 바뀌어도
유지되는 것이 좋습니다. 한글 이름에서 자동 변환할 수 없으므로:

- 섹션·필드·열·입력값을 추가할 때 `section1`, `field3`, `column2`, `variable1`처럼 **범위 안에서 겹치지 않는 키를 자동으로 붙입니다.**
- 이름(label)을 바꿔도 키는 바뀌지 않습니다.
- 펼친 필드의 "고급"에서만 키를 직접 바꿀 수 있습니다.
- 제목 형식에 넣을 변수는 `{{키}}`를 직접 쓰지 않고 입력값 칩을 눌러 넣습니다.

## 4. API

기존 `GET /api/v1/templates`(보고서 작성용, ACTIVE만)는 그대로 두고 관리용 API를 추가합니다.

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/v1/templates?view=manage` | 관리 목록. DRAFT·ACTIVE 모두, `status`, `currentVersion`, `hasDraft`, `updatedAt` 포함 |
| `POST` | `/api/v1/templates` | 새 양식. `{name, description}` → 201. 양식은 DRAFT, 시작용 초안 버전을 함께 만듦 |
| `PATCH` | `/api/v1/templates/{id}` | 이름·설명 수정 |
| `GET` | `/api/v1/templates/{id}` | 상세 (기존). `status`, `hasDraft` 추가. DRAFT 양식도 조회 가능 |
| `GET` | `/api/v1/templates/{id}/draft` | 초안. 없으면 현재 발행 버전을 복사해 만들어 돌려줌 |
| `PUT` | `/api/v1/templates/{id}/draft` | 초안 저장 |
| `DELETE` | `/api/v1/templates/{id}/draft` | 초안 버리기 (발행 버전이 있을 때만) |
| `POST` | `/api/v1/templates/{id}/draft/publish` | 발행 |

### 4.1 초안 저장과 발행의 검증 차이

작성 중인 양식은 당연히 미완성이므로, **저장은 막지 않고 발행만 막습니다.**

| | 초안 저장 `PUT /draft` | 발행 `POST /draft/publish` |
| --- | --- | --- |
| 거부 조건 | JSON 객체가 아님, 256KB 초과, 동시 수정 충돌 | 검증 오류가 하나라도 있음 |
| 검증 결과 | 응답의 `validation`으로 돌려줌 (저장은 성공) | 오류가 있으면 `422`와 오류 목록 |

초안 응답:

```json
{
  "templateId": "…",
  "schema": { "schemaVersion": 1, "titleFormat": "…", "sections": [ … ] },
  "lockVersion": 7,
  "updatedAt": "2026-10-19T10:12:00+09:00",
  "validation": {
    "valid": false,
    "errors": [
      { "path": "sections/1/fields/0/options/choices", "message": "선택지를 하나 이상 입력해 주세요." },
      { "path": "titleFormat", "message": "정의되지 않은 입력값 {{teamName}}을 쓰고 있습니다." }
    ]
  }
}
```

- `path`는 스키마 안의 위치(JSON Pointer 형식, 앞의 `/` 생략)입니다. 화면은 이 경로로 오류를 해당 필드 옆에 붙입니다.
- 메시지는 화면에 바로 보여줄 한국어 문장입니다. JSON Schema 키워드(`required`, `minItems` …)별로 한국어 메시지를 만듭니다.

### 4.2 동시 수정

같은 양식을 탭 두 개에서 고치면 나중 저장이 앞의 저장을 덮어씁니다. 이를 막기 위해 낙관적 잠금을 씁니다.

- 초안 행에 `lock_version`(정수)을 두고 JPA `@Version`으로 관리합니다.
- `PUT /draft` 요청에 마지막으로 받은 `lockVersion`을 보내고, 다르면 `409 Conflict`로 응답합니다.
- 화면은 "다른 곳에서 수정되었습니다. 새로 불러오기" 안내를 보여줍니다.

### 4.3 새 양식의 시작 초안

빈 화면보다 고칠 대상이 있는 편이 쉬우므로 섹션 하나, 필드 하나로 시작합니다.

```json
{
  "schemaVersion": 1,
  "titleFormat": "<양식 이름>",
  "sections": [
    {
      "key": "section1",
      "title": "요약",
      "fields": [
        { "key": "field1", "label": "한 줄 요약", "type": "TEXT", "required": true }
      ]
    }
  ]
}
```

## 5. 서버 검증 (api)

`packages/report-schema`가 기준입니다. 같은 규칙을 Java로 검증합니다.

1. **JSON Schema 검증**: `template.schema.json`을 Draft 2020-12로 검증합니다.
   Jackson 3과 함께 쓸 수 있는 JSON Schema 라이브러리를 고르는 것이 첫 작업입니다.
2. **추가 규칙**: `validate.py`의 `rule_errors`와 같은 규칙을 Java로 옮깁니다(키 중복, min ≤ max, 제목 변수 참조).
3. **테스트**: `packages/report-schema/examples`의 통과 예시 3개, 실패 예시 8개를 그대로 읽어 같은 결과가 나오는지 확인합니다.
   Python과 Java의 판정이 어긋나지 않게 하는 장치입니다.

스키마 파일 공유:

- Gradle `processResources`에서 `../../packages/report-schema/template.schema.json`을 클래스패스로 복사합니다.
- `apps/api/Dockerfile`은 지금 `apps/api`만 복사하므로 `packages/report-schema`도 복사하도록 고칩니다.

## 6. 화면 상태 관리 (web)

빌더의 편집 상태는 섹션·필드가 중첩된 객체이고 동작(추가, 삭제, 이동, 수정)이 많아서
`useState` 여러 개보다 **`useReducer` 하나**로 관리합니다.

```text
state  = { schema, savedSchema, lockVersion, validation, saveStatus }
action = addSection | removeSection | moveSection | updateSection
       | addField   | removeField   | moveField   | updateField | changeFieldType
       | addVariable | … | saved | loadFailed
변경됨  = schema !== savedSchema (저장할 때 savedSchema를 갱신)
```

- reducer는 순수 함수라서 화면 없이 단위 테스트할 수 있습니다.
- 필드 타입을 바꾸면 새 타입에 맞지 않는 옵션은 지웁니다(예: 표 → 짧은 글이면 `columns` 삭제).
- 미리보기는 같은 `schema`를 `TemplateSchemaView`에 넘겨서 그립니다.

폴더 구조:

```text
features/templates/
├── api.ts                      + createTemplate, getDraft, saveDraft, publishDraft …
├── types.ts                    + TemplateDraft, ValidationError …
├── builder/
│   ├── builderReducer.ts       상태와 action
│   ├── keys.ts                 키 자동 생성
│   └── fieldDefaults.ts        타입별 기본 옵션
└── components/
    ├── TemplateManageList/     /templates
    ├── TemplateCreateForm/     /templates/new
    ├── TemplateBuilder/        /templates/{id}/edit 전체
    ├── SectionEditor/
    ├── FieldEditor/
    ├── FieldOptionsEditor/     타입별 옵션
    └── VariablesEditor/
```

## 7. 데이터베이스 변경

V5 마이그레이션:

- `report_template_versions.lock_version integer not null default 0` 추가
- `report_templates`에 이미 `DRAFT` 상태가 있으므로 상태 값 추가는 없음

## 8. 작업 단위

한 단위씩 끝내고 다음으로 넘어갑니다.

| # | 앱 | 작업 | 확인 방법 |
| --- | --- | --- | --- |
| 1 | api | `feature/template-create`의 생성 API를 새 패키지 구조로 가져오고, DRAFT 양식 + 시작 초안을 만들도록 변경 | 생성 API 테스트 — 완료 |
| 2 | api | 스키마 검증기 (JSON Schema + 추가 규칙, 한국어 메시지) | 예시 파일 11개 테스트 |
| 3 | api | 초안 조회·저장·발행·버리기 API, 낙관적 잠금 (V5) | API 테스트 |
| 4 | api | 관리 목록, 이름·설명 수정, 상세에 `status`·`hasDraft` 추가 | API 테스트 |
| 5 | web | `/templates` 관리 목록, 사이드바 연결, `/templates/new` 생성 폼 | 브라우저 |
| 6 | web | 빌더 1: 섹션·필드 추가·삭제·이동, 이름·지침 편집, 미리보기 (`useReducer`) | 브라우저, reducer 테스트 |
| 7 | web | 빌더 2: 타입별 옵션 편집, 입력값·제목 형식 | 브라우저 |
| 8 | web | 저장·발행 연결, 오류를 필드 옆에 표시, 충돌·이탈 경고 | 브라우저 (전체 흐름) |

1~4번(api)과 5번(web 목록·생성 폼)은 API 계약만 맞추면 따로 진행할 수 있습니다.

## 9. 열린 결정

| 항목 | 기본안 | 결정 시점 |
| --- | --- | --- |
| Java JSON Schema 라이브러리 | Draft 2020-12와 Jackson 3을 지원하는 것 중 선택 | 2번 |
| 관리 목록 API 형태 | `?view=manage` 쿼리 | 4번 |
| web 단위 테스트 도구 | reducer 테스트를 위해 Vitest 도입 | 6번 |
| 자동 저장 | 이번에는 수동 저장 + 이탈 경고, 이후 디바운스 자동 저장 | 8번 이후 |
| 발행한 양식 삭제 | 삭제 대신 보관(ARCHIVED) | 후속 |
