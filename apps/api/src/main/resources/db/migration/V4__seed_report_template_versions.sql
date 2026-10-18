-- 기본 양식 3개의 첫 발행 버전(v1)을 넣고 current_version_id로 연결합니다.
-- schema_snapshot은 packages/report-schema/examples의 같은 이름 파일과 내용이 같아야 하며,
-- ReportTemplateVersionMigrationTests가 두 내용이 일치하는지 확인합니다.
-- $schema$ … $schema$는 PostgreSQL의 dollar quoting으로, 안쪽의 따옴표를 이스케이프하지 않아도 됩니다.
-- 여는 $schema$ 뒤에서 줄을 바꾸는 이유: 달러 기호 바로 뒤에 { 가 붙으면 Flyway가 자리표시자로 해석합니다.

-- weekly-summary.json
insert into report_template_versions (id, template_id, version, status, schema_snapshot, origin, published_at) values (
    '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 1, 'PUBLISHED',
    $schema$
{
  "schemaVersion": 1,
  "titleFormat": "주간 요약 ({{period.start}}~{{period.end}})",
  "instructions": "한 주 동안 받은 메일을 바탕으로 본인이 읽을 요약을 작성합니다. 짧고 핵심만 씁니다.",
  "variables": [
    {
      "key": "period",
      "label": "기간",
      "type": "DATE_RANGE",
      "required": true
    }
  ],
  "sections": [
    {
      "key": "overview",
      "title": "한 주 요약",
      "fields": [
        {
          "key": "headline",
          "label": "한 줄 요약",
          "type": "TEXT",
          "required": true,
          "instructions": "이번 주 가장 중요한 일 한 가지를 한 문장으로 씁니다.",
          "options": {
            "maxLength": 120
          }
        },
        {
          "key": "mailCount",
          "label": "검토한 메일 수",
          "type": "NUMBER",
          "required": false,
          "instructions": "소스로 받은 메일 수를 셉니다.",
          "options": {
            "unit": "통",
            "min": 0
          }
        }
      ]
    },
    {
      "key": "highlights",
      "title": "주요 내용",
      "fields": [
        {
          "key": "items",
          "label": "주요 내용",
          "type": "LIST",
          "required": true,
          "instructions": "중요한 순서로 정리합니다. 같은 주제의 메일은 한 항목으로 합칩니다.",
          "options": {
            "minItems": 1,
            "maxItems": 7
          }
        }
      ]
    },
    {
      "key": "followUps",
      "title": "다음 주 할 일",
      "fields": [
        {
          "key": "actions",
          "label": "후속 작업",
          "type": "LIST",
          "required": false,
          "instructions": "메일에서 요청받았거나 약속한 일만 적습니다.",
          "options": {
            "maxItems": 10
          }
        }
      ]
    }
  ]
}$schema$,
    'BUILDER', now()
);

-- customer-inquiry.json
insert into report_template_versions (id, template_id, version, status, schema_snapshot, origin, published_at) values (
    '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 1, 'PUBLISHED',
    $schema$
{
  "schemaVersion": 1,
  "titleFormat": "{{productName}} 고객 문의 분석 ({{period.start}}~{{period.end}})",
  "instructions": "고객 지원팀 회의에서 공유하는 문서입니다. 고객 표현을 과장하거나 추측하지 않습니다.",
  "variables": [
    {
      "key": "productName",
      "label": "제품명",
      "type": "TEXT",
      "required": true
    },
    {
      "key": "period",
      "label": "기간",
      "type": "DATE_RANGE",
      "required": true
    }
  ],
  "sections": [
    {
      "key": "notice",
      "title": "안내",
      "fields": [
        {
          "key": "disclaimer",
          "label": "안내 문구",
          "type": "STATIC",
          "content": "이 보고서는 수신 메일을 AI로 분석해 자동 생성했습니다. 고객 응대 전에 원문을 확인해 주세요."
        }
      ]
    },
    {
      "key": "summary",
      "title": "요약",
      "fields": [
        {
          "key": "inquiryCount",
          "label": "문의 건수",
          "type": "NUMBER",
          "required": true,
          "instructions": "서로 다른 고객 문의의 수입니다. 같은 문의의 회신은 한 건으로 셉니다.",
          "options": {
            "unit": "건",
            "min": 0
          }
        },
        {
          "key": "overallSentiment",
          "label": "전반적 고객 반응",
          "type": "SELECT",
          "required": true,
          "options": {
            "choices": [
              "긍정",
              "중립",
              "부정"
            ]
          }
        },
        {
          "key": "analysis",
          "label": "분석",
          "type": "RICH_TEXT",
          "required": true,
          "instructions": "문의가 많은 유형과 그 원인으로 보이는 점을 두세 문단으로 씁니다.",
          "options": {
            "maxLength": 2000
          }
        }
      ]
    },
    {
      "key": "inquiries",
      "title": "문의 목록",
      "fields": [
        {
          "key": "rows",
          "label": "문의 목록",
          "type": "TABLE",
          "required": true,
          "instructions": "문의 한 건을 한 행으로 씁니다.",
          "options": {
            "columns": [
              {
                "key": "customer",
                "label": "고객",
                "type": "TEXT",
                "instructions": "회사명 또는 발신자 이메일"
              },
              {
                "key": "category",
                "label": "유형",
                "type": "SELECT",
                "options": {
                  "choices": [
                    "기능 문의",
                    "오류 신고",
                    "요금·계약",
                    "기능 요청",
                    "기타"
                  ]
                }
              },
              {
                "key": "request",
                "label": "요청 내용",
                "type": "TEXT",
                "options": {
                  "maxLength": 200
                }
              },
              {
                "key": "urgency",
                "label": "긴급도",
                "type": "SELECT",
                "options": {
                  "choices": [
                    "높음",
                    "보통",
                    "낮음"
                  ]
                }
              },
              {
                "key": "receivedAt",
                "label": "접수일",
                "type": "DATE"
              }
            ],
            "maxRows": 50
          }
        }
      ]
    },
    {
      "key": "recommendations",
      "title": "개선 제안",
      "fields": [
        {
          "key": "items",
          "label": "개선 제안",
          "type": "LIST",
          "required": false,
          "instructions": "반복되는 문의를 줄일 수 있는 제안만 씁니다.",
          "options": {
            "maxItems": 5
          }
        }
      ]
    }
  ]
}$schema$,
    'BUILDER', now()
);

-- work-progress.json
insert into report_template_versions (id, template_id, version, status, schema_snapshot, origin, published_at) values (
    '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', 1, 'PUBLISHED',
    $schema$
{
  "schemaVersion": 1,
  "titleFormat": "{{teamName}} 업무 진행 현황 ({{period.start}}~{{period.end}})",
  "instructions": "팀장에게 보고하는 문서입니다. 간결한 보고체(~함, ~임)로 작성합니다.",
  "variables": [
    {
      "key": "teamName",
      "label": "팀 이름",
      "type": "TEXT",
      "required": true
    },
    {
      "key": "period",
      "label": "기간",
      "type": "DATE_RANGE",
      "required": true
    },
    {
      "key": "reportType",
      "label": "보고 주기",
      "type": "SELECT",
      "required": false,
      "options": {
        "choices": [
          "주간",
          "월간"
        ]
      }
    }
  ],
  "sections": [
    {
      "key": "summary",
      "title": "요약",
      "fields": [
        {
          "key": "headline",
          "label": "한 줄 요약",
          "type": "TEXT",
          "required": true,
          "instructions": "이번 기간 가장 중요한 변화 한 가지를 한 문장으로 씁니다.",
          "options": {
            "maxLength": 120
          }
        }
      ]
    },
    {
      "key": "progress",
      "title": "업무 진행 현황",
      "instructions": "메일에 나온 업무만 적고, 메일에 없는 업무는 추측해서 추가하지 않습니다.",
      "fields": [
        {
          "key": "items",
          "label": "진행 항목",
          "type": "TABLE",
          "required": true,
          "instructions": "업무 단위로 한 행씩 씁니다. 같은 업무에 대한 여러 메일은 한 행으로 합칩니다.",
          "options": {
            "columns": [
              {
                "key": "task",
                "label": "업무",
                "type": "TEXT",
                "options": {
                  "maxLength": 100
                }
              },
              {
                "key": "owner",
                "label": "담당",
                "type": "TEXT"
              },
              {
                "key": "status",
                "label": "상태",
                "type": "SELECT",
                "options": {
                  "choices": [
                    "진행 중",
                    "완료",
                    "지연",
                    "보류"
                  ]
                }
              },
              {
                "key": "progressRate",
                "label": "진척률",
                "type": "NUMBER",
                "options": {
                  "unit": "%",
                  "min": 0,
                  "max": 100
                }
              },
              {
                "key": "dueDate",
                "label": "마감일",
                "type": "DATE"
              }
            ],
            "maxRows": 20
          }
        }
      ]
    },
    {
      "key": "risks",
      "title": "이슈 및 리스크",
      "fields": [
        {
          "key": "issues",
          "label": "주요 이슈",
          "type": "LIST",
          "required": false,
          "instructions": "일정 지연, 고객 불만, 의사결정이 필요한 사항을 씁니다.",
          "options": {
            "maxItems": 10
          }
        },
        {
          "key": "riskLevel",
          "label": "전체 위험도",
          "type": "SELECT",
          "required": true,
          "options": {
            "choices": [
              "낮음",
              "보통",
              "높음"
            ]
          }
        }
      ]
    },
    {
      "key": "nextSteps",
      "title": "다음 기간 계획",
      "fields": [
        {
          "key": "plan",
          "label": "계획",
          "type": "RICH_TEXT",
          "required": false,
          "instructions": "메일에 언급된 일정과 약속을 바탕으로 씁니다.",
          "options": {
            "maxLength": 1500
          }
        },
        {
          "key": "nextReviewDate",
          "label": "다음 점검일",
          "type": "DATE",
          "required": false
        }
      ]
    }
  ]
}$schema$,
    'BUILDER', now()
);

update report_templates t
set current_version_id = v.id, updated_at = now()
from report_template_versions v
where v.template_id = t.id and v.version = 1;
