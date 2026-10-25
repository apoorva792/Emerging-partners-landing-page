# Company archetypes

The profiler classifies into exactly one `primary`, and up to two `secondary`.
Signals are matched against the crawled site, not the email domain.

| archetype | signals on their site |
|---|---|
| `it-consultancy-msp` | "digital transformation", "managed services", "system integration", named platforms (SAP, ServiceNow, Salesforce, Azure), engineering/delivery team pages, certifications/partner badges |
| `marketing-agency` | "campaigns", "brand", "performance marketing", "creative", client logo walls, case studies with reach/CTR numbers |
| `hr-consultancy` | "talent", "recruitment", "RPO", "people operations", "HRMS implementation", "L&D" |
| `finance-accounting-firm` | "audit", "bookkeeping", "CFO services", "ERP implementation", "compliance filings", NetSuite/SAP/Dynamics/Tally |
| `infrastructure-sovereignty` | "data centre", "private cloud", "on-premise", "GPU", "sovereign", "regulated", government/defence/BFSI clients, local hosting claims |

If nothing scores above threshold → fall back to `it-consultancy-msp` and say so
on the profile card ("we read you as a technology services firm — correct us").
