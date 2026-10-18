# report-schema

보고서 양식 스키마의 단일 기준입니다. `report_template_versions.schema_snapshot`에 이 형식의
JSON이 저장되고, web 빌더·api 검증·agent 생성·렌더러가 모두 같은 형식을 읽습니다.

설계 배경은 [docs/report-generation-design.md](../../docs/report-generation-design.md) 3장을 참고합니다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `template.schema.json` | 양식 형태 규칙 (JSON Schema 2020-12) |
| `validate.py` | 스키마 + 추가 규칙 검증, 예시 파일 테스트 |
| `examples/*.json` | 통과해야 하는 예시. DB 시드 양식 3개와 같은 내용 |
| `examples/invalid/*.json` | 실패해야 하는 예시. 파일 하나에 규칙 하나만 어깁니다 |

## 검증 실행

```bash
cd packages/report-schema
uv run validate.py
```

`validate.py` 맨 위의 인라인 메타데이터(PEP 723)로 uv가 `jsonschema`를 임시 환경에
설치하므로 별도 설치는 필요 없습니다. 하나라도 기대와 다르면 종료 코드 1을 반환합니다.

## 형태 규칙 (`template.schema.json`)

```text
schemaVersion  1 고정. 형식이 호환되지 않게 바뀌면 올립니다.
titleFormat    보고서 제목. {{변수키}}, {{기간변수.start}}, {{기간변수.end}}
instructions   보고서 전체 작성 지침 (선택)
variables[]    생성 요청 시 입력값: TEXT, NUMBER, DATE, DATE_RANGE, SELECT
sections[]     key, title, instructions(선택), fields[]
```

필드 타입:

| 타입 | options | 비고 |
| --- | --- | --- |
| `TEXT`, `RICH_TEXT` | `maxLength` (선택) | `RICH_TEXT` 값은 Markdown |
| `NUMBER` | `unit`, `min`, `max` (선택) | |
| `DATE` | 없음 | 값은 `YYYY-MM-DD` |
| `SELECT`, `MULTI_SELECT` | `choices` (필수) | 선택지는 중복 불가 |
| `LIST` | `minItems`, `maxItems` (선택) | 문자열 목록 |
| `TABLE` | `columns` (필수), `maxRows` (선택) | 열 타입: `TEXT`, `NUMBER`, `DATE`, `SELECT`, `MULTI_SELECT` |
| `STATIC` | 없음 | `content` 필수. AI를 호출하지 않으므로 `required`, `instructions`, `options`를 둘 수 없음 |

`STATIC`이 아닌 필드는 `required`(true/false)를 반드시 적습니다. 키는 소문자로 시작하는
camelCase(`^[a-z][a-zA-Z0-9]*$`, 80자 이하)입니다.

## 추가 규칙 (`validate.py`의 `rule_errors`)

JSON Schema로 표현하기 어려운 규칙입니다. **api(Java)와 agent(Python)에서 양식을 검증할 때도
같은 규칙을 구현하고, 이 폴더의 예시 파일로 테스트합니다.**

1. 키 중복 금지: 변수끼리, 섹션끼리, 같은 섹션의 필드끼리, 같은 표의 열끼리
2. `min` ≤ `max`, `minItems` ≤ `maxItems`
3. `titleFormat`의 자리표시자는 정의된 변수만 참조하고, `.start`/`.end`는 `DATE_RANGE` 변수에만 씀
