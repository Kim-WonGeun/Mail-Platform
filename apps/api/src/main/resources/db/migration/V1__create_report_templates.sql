-- 파일 이름의 V1이 버전입니다. Flyway는 실행한 버전을 flyway_schema_history에
-- 기록하므로, 이미 적용한 파일은 다시 실행하지 않습니다. 적용한 파일은 수정하지
-- 않고 새 버전 파일을 추가합니다.

-- docs/database-design.md의 report_templates 중 MVP에 필요한 컬럼만 먼저 만듭니다.
-- organization_id, created_by_user_id, current_version_id는 사용자·조직 기능과 함께 추가합니다.
create table report_templates (
    id          uuid         primary key,
    name        varchar(150) not null,
    description text,
    status      varchar(30)  not null,
    created_at  timestamptz  not null default now(),
    updated_at  timestamptz  not null default now()
);

create index idx_report_templates_status on report_templates (status);
