# Mail Platform

메일 데이터를 분석해 사용자가 정의한 보고서 양식에 맞는 구조화된 보고서를
생성하는 플랫폼.

사용자가 보고서 양식을 정의하면, 시스템은 메일 데이터를 기반으로 AI
에이전트를 실행하고 지정된 양식에 맞는 보고서를 생성.

## 현재 상태

초기 모노레포 세팅 단계.

현재는 `apps/web` 프론트엔드 애플리케이션부터 구성 중.

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

## 브랜치 전략

- `main`: 안정 브랜치
- `develop`: 통합 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정
- `refactor/*`: 구조 개선
- `chore/*`: 설정, 문서, 빌드 작업

## 문서

자세한 아키텍처 방향, 서비스 책임, 개발 원칙은 `AGENTS.md` 참고.
