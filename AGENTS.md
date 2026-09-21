# Mail Platform 에이전트 가이드

## 프로젝트 개요

이 저장소는 메일 분석 및 보고서 생성 플랫폼을 위한 모노레포입니다.

사용자가 보고서 양식을 정의하면, 시스템은 메일 데이터를 기반으로 AI
에이전트를 실행하고 지정된 양식에 맞는 구조화된 보고서를 생성합니다.

핵심 아키텍처 방향은 다음과 같습니다.

- 모노레포
- MSA 중심 서비스 경계
- Kubernetes 기반 배포
- Spring Cloud 기반 라우팅 및 백엔드 서비스
- Python 기반 AI 에이전트 오케스트레이션 및 보고서 생성
- 이벤트 기반 비동기 처리

## 목표 아키텍처

```text
사용자
  -> 프론트엔드
  -> Spring Cloud Gateway
  -> 백엔드 서비스
       -> Template Service
       -> Mail Ingestion Service
       -> Analysis Service
       -> Agent Orchestrator
       -> Report Service
       -> Notification Service
```

## 권장 저장소 구조

```text
mail-platform
├── apps
│   ├── web
│   ├── api-gateway
│   ├── auth-service
│   ├── user-service
│   ├── template-service
│   ├── mail-ingestion-service
│   ├── analysis-service
│   ├── agent-orchestrator
│   ├── report-service
│   └── notification-service
├── packages
│   ├── common-dto
│   ├── common-security
│   ├── common-observability
│   └── common-events
├── infra
│   ├── k8s
│   ├── helm
│   ├── docker
│   └── terraform
├── docs
│   ├── architecture.md
│   ├── api.md
│   └── decisions
└── tools
```

## 언어 및 버전 기준

### 프론트엔드

- Node.js 22 LTS
- TypeScript 5.x
- Next.js 15.x
- React 19.x
- pnpm 10.x

Next.js는 프론트엔드 애플리케이션 프레임워크로 사용합니다. React는 UI
컴포넌트 라이브러리로 사용하고, Node.js는 프론트엔드 개발, 빌드, 실행
환경으로 사용합니다.

### Java 백엔드

- Java 25
- Spring Boot 4.1.x
- Spring Framework 7.x
- Spring Cloud 2025.1.x Oakwood
- Gradle 9.x 또는 Gradle 8.14+

모든 Spring 서비스는 특별한 이유가 없는 한 동일한 Java 및 Spring 기준을
사용합니다.

### Python 서비스

- Python 3.12 또는 3.13
- FastAPI
- Pydantic 2.x
- LangGraph
- uv

Python은 AI 에이전트 실행, 문서 생성, 보고서 렌더링, LLM 및 도구
오케스트레이션에 사용합니다.

### 인프라

- Kubernetes 1.32+
- Helm 3.x
- PostgreSQL 17
- Redis 7.4+
- RabbitMQ 4.x
- MinIO 또는 S3 호환 오브젝트 스토리지
- Prometheus, Grafana, Loki 또는 이에 준하는 관측성 스택

## 서비스별 책임

### apps/web

프론트엔드 애플리케이션입니다.

주요 책임:

- 로그인 및 인증 화면
- 보고서 양식 편집기
- 분석 요청 화면
- 작업 상태 대시보드
- 보고서 미리보기 및 다운로드
- 관리자 및 설정 화면

### apps/api-gateway

Spring Cloud Gateway 기반 외부 진입점입니다.

주요 책임:

- 외부 API 라우팅
- 인증 및 인가 필터
- Rate limit
- 요청 추적을 위한 correlation ID 처리
- 내부 서비스 라우팅

### apps/auth-service

인증 및 토큰 서비스입니다.

주요 책임:

- 로그인
- JWT 발급
- JWT 검증 지원
- Refresh token 관리
- OAuth2 연동
- 서비스 간 인증 정책

### apps/user-service

사용자, 조직, 권한 서비스입니다.

주요 책임:

- 사용자 프로필 관리
- 조직 멤버십 관리
- 역할 및 권한 메타데이터 관리
- 사용자별 설정 관리

### apps/template-service

보고서 양식 관리 서비스입니다.

주요 책임:

- 사용자 정의 보고서 양식 관리
- 양식 필드 스키마 관리
- 양식 섹션 관리
- 양식 버전 관리
- 입력값 검증 규칙 관리

### apps/mail-ingestion-service

메일 수집 및 정규화 서비스입니다.

주요 책임:

- 메일 소스 연동
- MIME 파싱
- 첨부파일 추출
- 본문 텍스트 정규화
- 원본 메일 및 첨부파일 저장

### apps/analysis-service

분석 작업 관리 서비스입니다.

주요 책임:

- 분석 작업 생성
- 작업 상태 추적
- 작업 메타데이터 저장
- 에이전트 실행 이벤트 발행
- 재시도 및 실패 상태 처리

이 서비스는 비즈니스 상태를 소유합니다. 복잡한 LLM 에이전트 실행 로직은
직접 소유하지 않습니다.

### apps/agent-orchestrator

AI 에이전트 실행 서비스입니다.

주요 책임:

- 에이전트 실행 계획 생성
- LLM 워크플로우 실행
- 외부 도구 호출
- 메일 데이터에서 구조화된 정보 추출
- 정규화된 분석 결과 반환

이 서비스는 AI 실행 로직을 소유합니다. 장기 보관이 필요한 비즈니스
레코드는 소유하지 않고, 필요한 경우 운영용 실행 메타데이터만 관리합니다.

### apps/report-service

보고서 생성 서비스입니다.

주요 책임:

- 분석 결과를 사용자 양식에 매핑
- HTML, PDF, DOCX 보고서 생성
- 생성된 보고서 파일 저장
- 보고서 다운로드 메타데이터 제공

### apps/notification-service

알림 서비스입니다.

주요 책임:

- 분석 완료 알림
- 분석 실패 알림
- SSE 또는 WebSocket 기반 상태 업데이트
- 향후 이메일, Slack, Teams 알림 확장

## 데이터 및 메시징

### 주요 저장소

- PostgreSQL: 사용자, 조직, 양식, 작업, 보고서 메타데이터
- Redis: 캐시, rate limit 상태, 짧은 수명의 워크플로우 상태
- Object Storage: 원본 메일, 첨부파일, 생성된 보고서

### 초기 메시지 브로커

초기에는 RabbitMQ를 사용합니다. 초기 MSA 단계에서 Kafka보다 운영 부담이
낮고, 비동기 작업 큐와 이벤트 처리에 충분합니다.

이벤트 양, 재처리 요구사항, 스트림 처리 요구가 커지면 Kafka 도입을 검토할
수 있습니다.

### 예시 이벤트

```text
mail.received
mail.normalized
analysis.requested
analysis.started
analysis.completed
analysis.failed
report.requested
report.generated
notification.requested
```

## MVP 범위

처음에는 다음 서비스부터 시작합니다.

- web
- api-gateway
- auth-service
- template-service
- analysis-service
- agent-orchestrator
- report-service

핵심 흐름이 안정화된 뒤 다음 서비스를 추가합니다.

- mail-ingestion-service
- user-service
- notification-service
- audit-service
- billing-service

## 개발 원칙

- 서비스 경계는 비즈니스 책임을 기준으로 나눕니다.
- 긴 분석 작업과 보고서 생성은 비동기 이벤트 기반으로 처리합니다.
- 사용자 조회나 짧은 명령은 동기 HTTP 호출로 처리합니다.
- AI 실행 로직을 Gateway나 일반 백엔드 서비스에 넣지 않습니다.
- 공통 패키지는 작고 안정적으로 유지합니다.
- 공통 패키지가 숨겨진 모놀리스가 되지 않도록 주의합니다.
- 외부에 노출되는 API는 버전 관리합니다.
- 모든 서비스 간 요청과 이벤트에 correlation ID를 포함합니다.
- 서비스 간 계약에는 명시적인 DTO를 사용합니다.
- 영속성 엔티티를 서비스 간에 공유하지 않습니다.
- 각 서비스는 독립적으로 빌드, 테스트, 컨테이너화, 배포할 수 있어야 합니다.

## 브랜치 전략

초기에는 단순한 GitHub Flow 변형을 사용합니다. 프로젝트가 커지기 전까지는
복잡한 Git Flow 전체를 도입하지 않고, 안정 브랜치와 기능 브랜치를 명확히
나누는 방식으로 운영합니다.

### 기본 브랜치

- `main`: 항상 배포 가능하거나 최소한 안정적인 상태를 유지합니다.
- `develop`: 여러 기능을 모아 검증하는 통합 브랜치로 사용합니다.
- `feature/*`: 새 기능 개발 브랜치입니다.
- `fix/*`: 일반 버그 수정 브랜치입니다.
- `refactor/*`: 기능 변화 없는 구조 개선 브랜치입니다.
- `chore/*`: 설정, 의존성, 문서, 빌드 관련 작업 브랜치입니다.

### 선택 브랜치

- `hotfix/*`: `main`에 반영된 안정 버전의 긴급 수정이 필요할 때 사용합니다.
- `release/*`: 배포 전 QA, 버전 고정, 릴리스 노트 정리가 필요할 정도로
  배포 절차가 커졌을 때 도입합니다.

### 작업 흐름

```text
feature/*, fix/*, refactor/*, chore/*
  -> develop
  -> main
```

- `main`에는 직접 커밋하지 않습니다.
- 모든 작업은 목적에 맞는 작업 브랜치에서 시작합니다.
- 작업 브랜치는 작고 검토 가능한 단위로 유지합니다.
- 작업이 끝나면 `develop`으로 병합하고, 검증 후 `main`으로 병합합니다.
- 긴급 수정이 필요한 경우 `hotfix/*`에서 수정한 뒤 `main`과 `develop`에
  모두 반영합니다.
- 브랜치 이름은 작업 목적이 드러나도록 짧고 구체적으로 작성합니다.

예시:

```text
feature/report-template-editor
fix/login-token-refresh
refactor/mail-parser
chore/docker-compose
hotfix/smtp-config
```

### 커밋 메시지

커밋 메시지는 Conventional Commits 형식을 권장합니다.

```text
feat: 보고서 양식 편집 화면 추가
fix: 로그인 토큰 갱신 오류 수정
refactor: 메일 파싱 로직 분리
chore: 개발용 Docker Compose 설정 추가
docs: 브랜치 전략 문서화
```

## 프론트엔드 학습 및 구현 방식

현재는 프론트엔드부터 진행하며, 사용자의 React 및 Next.js 학습을 병행합니다.
전체 아키텍처와 MVP 범위는 장기적인 방향이며, 한 번에 구현할 작업 범위가 아닙니다.

- 작업은 사용자가 이해하고 직접 확인할 수 있는 작은 단위로 나눕니다.
- 각 단위는 하나의 학습 목표와 확인 가능한 구현 결과를 갖도록 합니다.
- 구현 전에 이번에 다룰 개념과 변경 범위를 한글로 간단히 설명합니다.
- 구현 후에는 변경된 코드, 해당 개념이 필요한 이유, 실행 및 확인 방법을 설명합니다.
- 앞으로 추가하거나 수정하는 소스에는 학습에 필요한 핵심 개념과 코드의 의도를 짧은 한글 주석으로 함께 설명합니다. 모든 줄을 반복 설명하지 않고 props, state, 이벤트, 컴포넌트 연결 등 이해가 필요한 지점에 작성합니다.
- 현재 단위의 구현과 검증까지 마무리하고, 다음 단위를 자동으로 이어서 구현하지 않습니다.
- React의 컴포넌트, JSX, props, state, 이벤트를 실제 화면에 연결해 단계적으로 익힙니다.
- Next.js의 라우팅, 레이아웃, 서버 및 클라이언트 컴포넌트는 필요한 시점에 도입합니다.
- 초기에는 샘플 데이터로 화면을 만들고, API 연결은 별도 단위로 진행합니다.
- 상태 관리 라이브러리, 인증, 백엔드, Kubernetes 설정은 해당 작업에서 필요할 때 추가합니다.
- 학습을 위해 불필요한 추상화와 대규모 자동 생성을 피하고, 코드의 흐름을 읽기 쉽게 유지합니다.

첫 작업 단위는 `apps/web`의 최소 실행 환경과 첫 페이지로 잡습니다.
이후 컴포넌트 분리와 props, state와 이벤트, 라우팅, API 연결 순으로
작업을 나누되, 사용자의 학습 속도와 요청에 맞게 조정합니다.

## 이 저장소에서 작업하는 에이전트 지침

이 저장소에서 작업할 때는 다음 원칙을 따릅니다.

- 변경 전에 관련 서비스를 먼저 읽고 이해합니다.
- 저장소가 성장하면 기존 로컬 컨벤션을 우선합니다.
- 변경 범위는 요청과 관련된 서비스 또는 패키지로 제한합니다.
- 명확한 이유 없이 새로운 인프라 의존성을 추가하지 않습니다.
- 서비스 간 계약을 수동으로 중복 정의하지 않습니다.
- 진짜 공유되는 계약만 적절한 공통 패키지에 둡니다.
- 동작 변경에는 테스트를 추가하거나 갱신합니다.
- 아키텍처, 서비스 경계, 공개 API 계약이 바뀌면 문서도 함께 갱신합니다.

## 배포 방향

`apps` 아래의 각 애플리케이션은 최종적으로 다음 항목을 가져야 합니다.

- Dockerfile
- Kubernetes Deployment
- Kubernetes Service
- ConfigMap 및 Secret 참조
- Health check
- Metrics endpoint
- 구조화된 로그

Gateway는 Ingress를 통해 외부에 노출합니다. 그 외 서비스는 일반적으로
ClusterIP를 사용해 클러스터 내부에만 노출합니다.

## 현재 아키텍처 결정

초기 플랫폼은 다음 기준으로 시작합니다.

```text
Frontend:      Next.js 15 + React 19 + TypeScript
Backend:       Java 25 + Spring Boot 4.1.x + Spring Cloud 2025.1.x
Agent:         Python 3.12/3.13 + FastAPI + LangGraph
Report:        Python 3.12/3.13
Database:      PostgreSQL 17
Cache:         Redis 7.4+
Broker:        RabbitMQ 4.x
Storage:       MinIO/S3
Orchestration: Kubernetes 1.32+
```
