# Mail Platform

메일 데이터를 분석해 사용자가 정의한 보고서 양식에 맞는 구조화된 보고서를
생성하는 플랫폼.

사용자가 보고서 양식을 정의하면, 시스템은 메일 데이터를 기반으로 AI
에이전트를 실행하고 지정된 양식에 맞는 보고서를 생성.

## 현재 상태

초기 모노레포 세팅 단계.

현재는 `apps/web` 프론트엔드 애플리케이션부터 구성 중.
`apps/api` Spring Boot API 서버는 기초 학습과 MVP API 구현을 위해 작은
단일 서버로 시작.

## 기술 스택

- Monorepo: pnpm workspace
- Frontend: Next.js 15, React 19, TypeScript 5
- Backend: Java 25, Spring Boot 4.1, Spring Cloud
- AI Agent: Python, FastAPI, LangGraph
- Infra: Kubernetes, PostgreSQL, Redis, RabbitMQ, MinIO/S3

## 저장소 구조

```text
mail-platform
├── apps
│   └── web
├── AGENTS.md
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## 실행

```bash
pnpm install
pnpm dev
```

web은 `/api` 요청을 `next.config.ts`의 rewrite로 API 서버(`127.0.0.1:8080`)에
전달합니다. 양식 목록을 보려면 로컬 DB와 API 서버를 먼저 실행합니다.

API 서버는 기본으로 `dev` 프로필(`application-dev.yml`)을 사용하므로, 먼저 아래
"로컬 DB"를 실행합니다. 테스트는 Testcontainers가 PostgreSQL을 직접 띄우므로
Docker만 실행 중이면 됩니다.

```bash
cd apps/api
./gradlew bootRun
```

상태 확인:

```bash
curl http://127.0.0.1:8080/api/health
```

## 로컬 DB

Docker로 PostgreSQL 17을 실행합니다. 접속 정보는 `infra/docker/compose.yaml`에
있는 로컬 전용 값(`mail_platform`)입니다.

```bash
docker compose -f infra/docker/compose.yaml up -d --wait
docker exec -it mail-platform-postgres psql -U mail_platform -d mail_platform
docker compose -f infra/docker/compose.yaml down
```

`down`은 컨테이너만 지우고 데이터는 volume에 남깁니다. 데이터까지 지우려면
`down -v`를 사용합니다.

## Python 에이전트 실행 환경

Python 3.13.16과 uv를 사용합니다. 현재는 실행 환경과 샘플 메일 출력 예제가 구성되어 있습니다.

```bash
cd apps/agent-orchestrator
uv sync
uv run python --version
uv run python main.py
```

자세한 내용은 `apps/agent-orchestrator/README.md`를 참고합니다.

## 브랜치 전략

- `main`: 안정 브랜치
- `develop`: 통합 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정
- `refactor/*`: 구조 개선
- `chore/*`: 설정, 문서, 빌드 작업

## 문서

자세한 아키텍처 방향, 서비스 책임, 개발 원칙은 `AGENTS.md` 참고.
