# /// script
# requires-python = ">=3.13"
# dependencies = ["jsonschema>=4.23"]
# ///
# 위 주석은 PEP 723 인라인 메타데이터입니다. `uv run validate.py`로 실행하면
# uv가 jsonschema만 담긴 임시 환경을 만들어 실행하므로 별도 설치가 필요 없습니다.
"""양식 예시 파일을 template.schema.json과 추가 규칙으로 검증합니다.

- examples/*.json         모두 통과해야 합니다.
- examples/invalid/*.json 모두 실패해야 합니다. (규칙이 실제로 막는지 확인)
"""

import json
import re
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).parent
SCHEMA = json.loads((ROOT / "template.schema.json").read_text(encoding="utf-8"))

# {{teamName}}, {{period.start}} 같은 제목 자리표시자를 찾습니다.
PLACEHOLDER = re.compile(r"\{\{\s*([a-zA-Z0-9]+)(?:\.([a-zA-Z0-9]+))?\s*\}\}")


def schema_errors(template: dict) -> list[str]:
    """JSON Schema로 확인할 수 있는 형태 규칙 (타입, 필수 항목, 길이, 타입별 options)."""
    validator = Draft202012Validator(SCHEMA)
    errors = []
    for error in sorted(validator.iter_errors(template), key=lambda e: list(e.absolute_path)):
        path = "/".join(str(p) for p in error.absolute_path) or "(root)"
        errors.append(f"[schema] {path}: {error.message}")
    return errors


def duplicate_keys(items: list[dict], where: str) -> list[str]:
    seen: set[str] = set()
    errors = []
    for item in items:
        key = item.get("key")
        if key in seen:
            errors.append(f"[rule] {where}: 키 '{key}'가 중복됩니다.")
        seen.add(key)
    return errors


def min_max_errors(options: dict, where: str) -> list[str]:
    errors = []
    for low, high in (("min", "max"), ("minItems", "maxItems")):
        if low in options and high in options and options[low] > options[high]:
            errors.append(f"[rule] {where}: {low}({options[low]})가 {high}({options[high]})보다 큽니다.")
    return errors


def rule_errors(template: dict) -> list[str]:
    """JSON Schema로 표현하기 어려운 규칙. api(Java)와 agent(Python)도 같은 규칙을 구현해야 합니다."""
    errors = []
    variables = template.get("variables", [])
    sections = template.get("sections", [])

    # 1. 키 중복: 변수끼리, 섹션끼리, 섹션 안 필드끼리, 표 안 열끼리
    errors += duplicate_keys(variables, "variables")
    errors += duplicate_keys(sections, "sections")
    for section in sections:
        where = f"sections/{section.get('key')}"
        fields = section.get("fields", [])
        errors += duplicate_keys(fields, f"{where}/fields")
        for field in fields:
            options = field.get("options", {})
            field_where = f"{where}/{field.get('key')}"
            # 2. 범위 옵션: 최솟값이 최댓값보다 클 수 없음
            errors += min_max_errors(options, field_where)
            for column in options.get("columns", []):
                errors += min_max_errors(column.get("options", {}), f"{field_where}/{column.get('key')}")
            errors += duplicate_keys(options.get("columns", []), f"{field_where}/columns")

    # 3. 제목 자리표시자는 정의된 변수만 참조하고, .start/.end는 DATE_RANGE에만 씁니다.
    types = {v.get("key"): v.get("type") for v in variables}
    for name, accessor in PLACEHOLDER.findall(template.get("titleFormat", "")):
        if name not in types:
            errors.append(f"[rule] titleFormat: 정의되지 않은 변수 '{{{{{name}}}}}'를 참조합니다.")
        elif types[name] == "DATE_RANGE" and accessor not in ("start", "end"):
            errors.append(f"[rule] titleFormat: 기간 변수 '{name}'는 .start 또는 .end로 써야 합니다.")
        elif types[name] != "DATE_RANGE" and accessor:
            errors.append(f"[rule] titleFormat: '{name}'는 기간 변수가 아니므로 .{accessor}를 쓸 수 없습니다.")

    return errors


def validate(template: dict) -> list[str]:
    # 형태가 틀리면 추가 규칙 검사가 엉뚱한 오류를 낼 수 있으므로 스키마 오류가 있으면 먼저 멈춥니다.
    return schema_errors(template) or rule_errors(template)


def main() -> int:
    failed = False

    for path in sorted((ROOT / "examples").glob("*.json")):
        errors = validate(json.loads(path.read_text(encoding="utf-8")))
        if errors:
            failed = True
            print(f"FAIL  {path.name} (통과해야 하는데 오류가 있습니다)")
            for error in errors:
                print(f"      {error}")
        else:
            print(f"ok    {path.name}")

    for path in sorted((ROOT / "examples" / "invalid").glob("*.json")):
        errors = validate(json.loads(path.read_text(encoding="utf-8")))
        if errors:
            print(f"ok    invalid/{path.name} -> {errors[0]}")
        else:
            failed = True
            print(f"FAIL  invalid/{path.name} (실패해야 하는데 통과했습니다)")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
