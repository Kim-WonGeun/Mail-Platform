@AGENTS.md

## 프로젝트 요약

메일 데이터를 AI 에이전트로 분석해 사용자가 정의한 양식의 보고서를 생성하는
모노레포입니다. 현재는 프론트엔드 학습과 함께 작은 단위로 구현합니다.

## 기술 스택

- web: Next.js 15, React 19, TypeScript, pnpm
- api: Java 25, Spring Boot 4.1
- agent: Python 3.13, uv
- infra: Kubernetes, Kustomize

## 현재 구조

```text
apps/web                 프론트엔드
apps/api                 Spring Boot 단일 API
apps/agent-orchestrator  Python 에이전트
packages/report-schema   보고서 양식 JSON Schema와 예시
infra/docker             로컬 PostgreSQL
infra/k8s/base           Kubernetes 매니페스트
docs                     설계 문서
```

## 명령어

```bash
docker compose -f infra/docker/compose.yaml up -d --wait  # 로컬 PostgreSQL
pnpm dev                                    # web 개발 서버
pnpm --filter @mail-platform/web typecheck  # web 타입 검사
cd apps/api && ./gradlew test               # api 테스트
cd apps/agent-orchestrator && uv run main.py
cd packages/report-schema && uv run validate.py  # 양식 스키마 예시 검증
```

## 브랜치와 커밋

- `feature/*`, `fix/*`, `refactor/*`, `chore/*` → `develop` → `main`
- `main`, `develop`에 직접 커밋하지 않습니다.
- 커밋 메시지는 Conventional Commits 형식, 한글로 작성합니다.

## Claude 작업 규칙

- 응답과 주석은 한글로 작성합니다.
- 소스에는 학습에 필요한 핵심 개념을 짧은 한글 주석으로 남깁니다.
- web 변경 후에는 typecheck를 실행합니다.
- 커밋과 푸시는 요청할 때만 합니다.
- 작업 단위 하나를 끝내면 멈추고, 다음 단위는 제안만 합니다.
