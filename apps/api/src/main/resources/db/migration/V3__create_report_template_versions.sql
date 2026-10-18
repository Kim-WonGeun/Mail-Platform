-- 양식의 실제 내용(섹션·필드)은 버전 테이블에 둡니다. 발행한 버전은 수정하지 않으므로
-- 이미 만든 보고서가 어떤 양식으로 생성됐는지 언제든 다시 확인할 수 있습니다.
-- schema_snapshot의 형식은 packages/report-schema/template.schema.json을 따릅니다.
create table report_template_versions (
    id              uuid        primary key,
    template_id     uuid        not null references report_templates (id),
    -- 발행할 때 1, 2, 3 … 으로 정해집니다. 편집 중(DRAFT)에는 번호가 없습니다.
    version         integer,
    status          varchar(30) not null,
    schema_snapshot jsonb       not null,
    -- BUILDER(빌더로 작성), IMPORTED(기존 문서에서 변환), CLONED(다른 양식 복제)
    origin          varchar(30) not null,
    published_at    timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    constraint ck_report_template_versions_status
        check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    constraint ck_report_template_versions_origin
        check (origin in ('BUILDER', 'IMPORTED', 'CLONED')),
    -- DRAFT만 버전 번호가 없고, 발행된 적 있는 버전은 번호와 발행 시각이 있어야 합니다.
    constraint ck_report_template_versions_version_status
        check ((status = 'DRAFT') = (version is null)),
    constraint ck_report_template_versions_published_at
        check ((status = 'DRAFT') = (published_at is null)),
    constraint ck_report_template_versions_version_positive
        check (version > 0)
);

-- 같은 양식 안에서 버전 번호는 겹치지 않습니다. (version이 null인 DRAFT는 비교 대상이 아닙니다)
create unique index uq_report_template_versions_template_version
    on report_template_versions (template_id, version);

-- partial index: where 조건에 맞는 행만 인덱스에 넣으므로 "양식당 DRAFT는 하나"를 강제합니다.
create unique index uq_report_template_versions_one_draft
    on report_template_versions (template_id)
    where status = 'DRAFT';

-- 양식 목록에서 바로 최신 발행 버전을 찾을 수 있도록 현재 버전을 가리킵니다.
alter table report_templates
    add column current_version_id uuid references report_template_versions (id);
