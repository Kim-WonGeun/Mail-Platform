# Agent Orchestrator

Python 3.13 기반 메일 분석 AI 서비스입니다. 현재는 실행 환경만 구성했습니다.

## 환경 구성

저장소 루트(`mail-platform`)에서 실행합니다.

```bash
cd apps/agent-orchestrator
uv sync
uv run python --version
```

현재 고정 버전은 Python 3.13.16입니다.
`uv`가 없다면 macOS에서는 `brew install uv`로 설치합니다.
필요한 Python은 `uv sync`가 자동으로 설치합니다.

## 파일의 역할

- `.python-version`: 개발에 사용할 정확한 Python 버전
- `pyproject.toml`: 프로젝트 정보, 허용하는 Python 버전, 의존성 목록
- `uv.lock`: 의존성 해석 결과를 기록하는 파일. 저장소에 함께 보관합니다.
- `.venv/`: 이 서비스만의 실행 환경. 자동 생성되며 Git에 올리지 않습니다.

`uv run python`은 이 서비스의 가상환경을 사용하므로 별도 활성화 없이 실행할 수 있습니다.
일반 `python3` 명령은 기존 시스템 Python을 가리킬 수 있습니다.

다음 학습 단위에서 샘플 메일을 출력하는 파이썬 코드를 추가합니다.
