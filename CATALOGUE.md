# Lyzr Emerging Partners — the full catalogue

Everything the opportunity agent reasons from. Generated from `data/` on 2026-10-28.

## 1. Platform products (9)

`data/partner-offerings.json` — hand-written. The only records carrying commercial terms.

### OpenController

- **id** `opencontroller` · **motion** `governance_upsell` · **page** https://www.lyzr.ai/opencontroller/
- **What it is** The control plane over every agent a client is already running, wherever it runs.
- **Buyer** CISO, Head of Platform Engineering or Chief Risk Officer
- **Trigger** Agents are in production that nobody has inventoried, or an audit date is on the calendar
- **Follow-on revenue** Managed agent governance: running the control plane and the evals as the estate grows

**Capabilities**
- Discovers agents across clouds, clusters and on-premises, including ones nobody registered
- Issues workload identity to every agent through the client's existing identity provider
- Enforces policy in the request path: access control, rate limits, model routing and guardrails
- Gates releases on multi-turn, red-team and regression evals with evidence per version
- Traces every action with cost, quality and ownership, exported to their observability tools

**Sits next to**
- Agent or GenAI delivery work already in production at clients
- Cloud platform engineering and landing zone work
- Security, identity or compliance practices

**Services a partner could sell**
- **Agent estate discovery** A list of every agent running, with an owner against each one
- **Policy and identity rollout** Every agent call authenticated and checked against policy before it reaches a system
- **Managed agent operations** Release gating, incident triage and an evidence pack their risk function accepts

**Revenue**
- *implementation* — Find every agent the client is running, put identity and policy on each one, and hand back an inventory with an audit trail
- *recurring* — Run the control plane for them: policy changes, release gating and the evidence pack their risk function asks for

**Customer problems it addresses**
- Agents are running in production that nobody has inventoried or made anyone accountable for
- An audit asks who approved a model change and there is no record of it
- Each team governs its own agents differently, so policy means something different in each one

**Eligibility requires**
- families: `governance`, `incident`, `integration`, `engineering`
- signals: `agent`, `agents`, `agentic`, `genai`, `llm`, `governance`, `compliance`, `regulated`, `audit`, `audit trail`, `risk`, `identity`, `iam`, `observability`, `soc 2`, `iso 27001`, `controls`, `oversight`, `mlops`, `kubernetes`, `platform engineering`, `production`, `deployment`, `devops`, `sre`
- why: A control plane is only sellable to a firm whose clients already have agents running, or who runs the platform those agents would run on.

**Prerequisites**
- The client has agents running somewhere, built on anything
- An existing identity provider to authenticate against
- Someone accountable for AI risk

**Do not recommend when**
- The partner has never delivered anything into production for a client
- Their clients have no agents and no plan for any, so there is nothing to govern
- The partner only advises and does not operate anything

**Restrictions (what we may not promise)**
- Needs an identity provider to authenticate against
- Governs agents wherever they run; it does not build them

---

### Open Cowork

- **id** `open_cowork` · **motion** `new_category` · **page** https://www.lyzr.ai/open-cowork/
- **What it is** A governed AI coworker for every employee, rolled out across a workforce rather than built per use case.
- **Buyer** Chief Information Officer, Head of Digital Workplace or Chief People Officer
- **Trigger** Staff are using consumer AI tools the organisation cannot see, or a workforce AI policy has just been written
- **Follow-on revenue** Enterprise knowledge operations: keeping sources, permissions and adoption current

**Capabilities**
- Gives every employee an AI coworker inside the organisation's own governance
- Deployed across a workforce rather than built one use case at a time

**Sits next to**
- Microsoft 365, Google Workspace or intranet rollouts
- Employee experience, adoption and change programmes
- Service desk and internal support work

**Services a partner could sell**
- **Workforce readiness and policy design** An agreed acceptable use position and a department to start with
- **Departmental rollout** Employees with a governed AI coworker in the tools they already use
- **Adoption and content operations** Usage visible to their IT administrator, and the content behind it kept current

**Revenue**
- *implementation* — Stand it up for one department, agree what good looks like, then roll it out across the workforce
- *recurring* — Run adoption, policy and the content behind it, billed per seat per month

**Customer problems it addresses**
- Staff are using consumer AI tools the organisation cannot see or govern
- A workforce AI policy exists on paper with nothing to enforce it
- AI pilots reach one team and never reach the other forty

**Eligibility requires**
- families: `people`, `support`, `analytics`, `governance`
- signals: `workplace`, `employee experience`, `workforce`, `employees`, `adoption`, `change management`, `intranet`, `microsoft 365`, `sharepoint`, `google workspace`, `service desk`, `helpdesk`, `per seat`, `collaboration`, `productivity`
- why: Rolling an AI coworker out to a whole workforce is an adoption and change programme. A firm that has never run one has no business selling it.

**Prerequisites**
- A single sign-on directory covering the workforce
- Somebody who owns employee tooling and can mandate it
- An acceptable use position on AI

**Do not recommend when**
- The partner has no record of workforce rollouts or adoption work
- Their clients are small enough that a per-seat rollout is not a programme
- The partner sells only to engineering teams, not to the business

**Restrictions (what we may not promise)**
- The product page publishes a single line of description, so scope the first engagement with the Lyzr team rather than from the page
- Sold per seat across a workforce; it is not a single use case build

---

### Agent Studio

- **id** `agent_studio` · **motion** `expand_engagement` · **page** https://www.lyzr.ai/
- **What it is** The pro-code workbench an engineering team designs, tests and ships production agents from.
- **Buyer** VP Engineering, Head of Data or Chief Technology Officer
- **Trigger** They have agent prototypes that have not reached production, or every new use case is being rebuilt from scratch
- **Follow-on revenue** Support and enhancement on each solution once it is live

**Capabilities**
- Design, test and ship production agents from one place
- Carries the workflow and the integrations rather than leaving them to be stitched together

**Sits next to**
- Custom software and application development
- Data engineering and integration work
- Existing AI or ML delivery teams

**Services a partner could sell**
- **First production agent** One workflow running in production, with the integrations wired to their systems
- **Agent delivery factory** A repeatable way to ship the next workflow without starting again
- **Run and extend** Changes shipped as the process moves, without a new project each time

**Revenue**
- *implementation* — Build the first agent on the client's own workflow, in production, then repeat the pattern
- *recurring* — Run and extend what was built, billed monthly rather than re-quoted per change

**Customer problems it addresses**
- Agent prototypes work in a demo and never reach production
- Every new use case is rebuilt from scratch with its own integrations
- Nobody can say what an agent did last Tuesday or why

**Eligibility requires**
- families: `engineering`, `integration`, `analytics`, `documents`
- signals: `agent`, `agents`, `agentic`, `llm`, `machine learning`, `software`, `platform`, `application`, `integration`, `api`, `development`, `engineering`, `automation`, `workflow`, `mlops`, `data engineering`, `custom software`, `product engineering`
- why: A build platform is sold to a firm that builds. An advisory firm has nobody to put on it.

**Prerequisites**
- Engineers the partner can put on delivery
- Access to the systems the agents have to read and write

**Do not recommend when**
- The partner only advises and subcontracts all delivery
- They already run a build platform of their own that they sell

**Restrictions (what we may not promise)**
- A build platform: the partner supplies the engineers

---

### Architect

- **id** `architect` · **motion** `expand_engagement` · **page** https://www.lyzr.ai/
- **What it is** Business users describe an agent or an app and it gets built, with the partner's agents coming along too.
- **Buyer** Chief Operating Officer or a function head who owns the process
- **Trigger** A backlog of small automations nobody will fund individually, or an RPA estate that keeps breaking
- **Follow-on revenue** Application care as the processes the apps cover keep changing

**Capabilities**
- Build agents and apps in one flow, including by describing them
- Bring existing agents with you rather than rebuilding them

**Sits next to**
- Process improvement and operating model work
- Low-code and RPA practices
- Business analysis teams sitting close to the client

**Services a partner could sell**
- **Process workshop and first app** One process mapped and a working app the business owner helped build
- **Business user enablement** Their own analysts able to change the app without raising a ticket
- **Application care** Apps kept current as the process changes

**Revenue**
- *implementation* — Map the process with the people who run it, then build the first app with them in the room
- *recurring* — Keep the apps current as the process changes, billed monthly

**Customer problems it addresses**
- A backlog of small automations nobody will fund individually
- An RPA estate that breaks whenever a screen changes
- The people who understand the process cannot change the tool that runs it

**Eligibility requires**
- families: `analytics`, `ordering`, `documents`, `people`, `support`
- signals: `rpa`, `low-code`, `no-code`, `power platform`, `uipath`, `automation anywhere`, `business process`, `process mining`, `business analysis`, `workflow automation`, `citizen developer`, `self-service`
- why: This is sold into the business, not into engineering. The partner has to already be in the room where processes are decided.

**Prerequisites**
- Named business owners for the processes in scope
- The partner has access to the business, not only to IT

**Do not recommend when**
- The partner sells only to engineering teams
- The work in question genuinely needs a pro-code build

**Restrictions (what we may not promise)**
- Aimed at business users; genuinely engineering-heavy work belongs on Agent Studio

---

### SuperFlow

- **id** `superflow` · **motion** `expand_engagement` · **page** https://www.lyzr.ai/blog/what-is-superflow/
- **What it is** Visual workflow orchestration with durable execution, so the flow that worked in the demo survives production.
- **Buyer** Head of Integration, Head of Automation or an operations director
- **Trigger** A workflow that works in testing keeps failing in production, or approvals are being handled over email beside the system
- **Follow-on revenue** Running the orchestration layer and the workflows on it, with changes as the processes move

**Capabilities**
- Visual workflow building for agents, LLM pipelines, approvals and long-running processes
- Durable execution: every step is journaled and a restart resumes from the point of failure
- Structured approvals with typed fields and files flowing on through the workflow
- Enterprise connectivity built in: OAuth2 with refresh, AWS Signature v4, JWT and mTLS
- Hybrid orchestration that brings existing agents forward alongside new ones

**Sits next to**
- Integration and middleware practices
- Workflow and BPM work
- Existing RPA or iPaaS estates

**Services a partner could sell**
- **Workflow resilience review** The failure points in one long-running process, named and costed
- **Durable workflow rebuild** A process that resumes from the point of failure instead of starting again
- **Orchestration managed service** Someone accountable for the workflows and a runbook when one stops

**Revenue**
- *implementation* — Rebuild one brittle long-running workflow on durable execution and show it surviving a failure
- *recurring* — Own the orchestration layer and the runbook, billed per workflow per month

**Customer problems it addresses**
- A workflow that passes testing keeps failing somewhere in production
- Approvals happen over email beside the system, so nobody can reconstruct a decision
- A crash mid-run means the whole process is restarted by hand

**Eligibility requires**
- families: `integration`, `ordering`, `documents`, `incident`, `governance`
- signals: `orchestration`, `middleware`, `integration`, `bpm`, `workflow`, `workflows`, `mulesoft`, `boomi`, `webmethods`, `ipaas`, `approval`, `approvals`, `etl`, `straight-through`, `processing`
- why: Durable orchestration is sold to a firm that already owns the client's process plumbing. Without that they are selling a canvas.

**Prerequisites**
- Processes long enough or branching enough to need orchestration
- Access to the systems each step has to call

**Do not recommend when**
- The work is a single model call with no steps around it
- The partner has no integration or process practice to attach it to

**Restrictions (what we may not promise)**
- Orchestration, not a single model call: work with no steps around it does not need it

---

### Lyzr Optimus

- **id** `optimus` · **motion** `new_category` · **page** https://optimus.lyzr-ai.com/
- **What it is** Lyzr's own appliance: agents, models and governance running inside the client's data centre, air-gapped.
- **Buyer** Chief Information Security Officer, Head of Infrastructure or a programme director in a regulated body
- **Trigger** Data is not permitted to leave the estate, or per-token cost on an existing deployment has become unpredictable
- **Follow-on revenue** Private AI operations: running the environment under an operate and support contract

**Capabilities**
- Runs open-weight models entirely on-premise with no external calls
- Agents operate in air-gapped environments without network connectivity
- Fixed annual pricing rather than per-token metering
- Custom models and fine-tunes can be imported for specialised use

**Sits next to**
- Data centre, private cloud and on-premise infrastructure work
- Sovereignty, residency and classified environment delivery
- Hardware procurement and installation practices

**Services a partner could sell**
- **Deployment readiness review** A sited design with the power, network and identity prerequisites confirmed
- **Install and commissioning** The appliance running in their own data centre with the first workload on it
- **Operate and support** Patching, model updates and capacity handled under an agreed service level

**Revenue**
- *implementation* — Install and commission the appliance in their environment, with the first workload running on it
- *recurring* — Operate the appliance under an SLA: patching, model updates and capacity, billed annually

**Customer problems it addresses**
- Data is not permitted to leave the estate, so nothing can go to a public cloud
- Per-token cost on an existing deployment has become impossible to forecast
- A workload has to run with no network connectivity at all

**Eligibility requires**
- families: `infrastructure`, `governance`, `integration`
- signals: `on-premise`, `on premise`, `data centre`, `data center`, `private cloud`, `air-gap`, `airgap`, `air gapped`, `sovereign`, `sovereignty`, `residency`, `classified`, `colocation`, `bare metal`, `vmware`, `appliance`, `self-hosted`, `hosted in`
- why: An appliance is sold by firms that already put equipment into other people's data centres. A cloud-only consultancy cannot deliver it.

**Prerequisites**
- Somewhere to physically put it, with power, cooling and network
- The partner can deliver into a client data centre
- A workload that genuinely cannot go to a public cloud

**Do not recommend when**
- The partner has only ever delivered in public cloud
- Their clients have no residency or sovereignty requirement
- The timeline is immediate: it ships Q4 2026

**Restrictions (what we may not promise)**
- Ships Q4 2026, so it cannot be committed to an earlier date
- Needs somewhere physical to put it, with power, cooling and network

---

### AgentBlocks OEM

- **id** `agentblocks_oem` · **motion** `build_ip` · **page** https://www.lyzr.ai/agentblocks/
- **What it is** White-label agent platform infrastructure a software vendor ships inside their own product, under their own name.
- **Buyer** Chief Product Officer, Chief Technology Officer or a general manager who owns the P&L for the product
- **Trigger** Customers are asking the product for AI features, and building the platform layer underneath would take a year
- **Follow-on revenue** Maintenance and enhancement as their own product ships it onward

**Capabilities**
- White-labeled build, governance and runtime layer for an agent platform
- Tenant isolation, request isolation, environment separation and durable execution
- Deployment into customer VPC, private cloud, Kubernetes or on-premises
- Audit logs, approvals, policy enforcement, usage metering and tenant limits
- Adapters onto existing frameworks, models, cloud, IAM, CI/CD and telemetry

**Sits next to**
- An existing product with its own customers and its own release cycle
- Multi-tenant SaaS platforms
- Vertical software with a captive install base

**Services a partner could sell**
- **Embedding assessment** The integration mapped against their own architecture and release cycle
- **Product integration** Agent features shipping inside their product, under their own brand
- **Platform care** The layer underneath kept current while they own the roadmap

**Revenue**
- *implementation* — Embed the runtime behind their own product's brand and ship agent features to their existing customers
- *recurring* — Lyzr carries the platform layer underneath while they own the product, the roadmap and the customer

**Customer problems it addresses**
- Customers are asking the product for AI features and the platform layer underneath would take a year to build
- Each enterprise customer wants their own tenancy, their own keys and their own audit trail
- The product team is maintaining agent infrastructure instead of the product

**Eligibility requires**
- families: `engineering`, `embedding`, `infrastructure`
- signals: `multi-tenant`, `multitenant`, `white label`, `white-label`, `oem`, `proprietary`, `our own product`, `our platform`, `saas`, `software product`, `product suite`, `licence`, `license`, `embed`, `tenant`, `isv`
- why: This is sold to a firm that ships software of its own. A pure services business has no product to embed it in.

**Prerequisites**
- A product of their own that customers already pay for
- An engineering team that can integrate an SDK
- A commercial model that can carry a platform cost

**Do not recommend when**
- The partner sells only people and hours, with no product of its own
- They already own a mature agent platform they sell
- What they actually need is a single agent, not a platform underneath one

**Restrictions (what we may not promise)**
- Commercial and licensing terms are not published: take them to the Lyzr partner team rather than quoting any
- For a firm that ships software of its own; a pure services business has nothing to embed it in

---

### Agent Blocks

- **id** `agent_blocks` · **motion** `build_ip` · **page** https://www.lyzr.ai/
- **What it is** The primitives underneath, memory, tools, retrieval and orchestration, composed into something the partner is already building.
- **Buyer** Engineering lead or solution architect on the delivery team
- **Trigger** They are maintaining their own memory, retrieval or orchestration code and it is drifting behind the model releases
- **Follow-on revenue** Maintenance and enhancement of the capability they now own

**Capabilities**
- Memory, tools, retrieval and orchestration as composable primitives
- Used piece by piece inside work the partner is already delivering

**Sits next to**
- An agent or application the partner is already building for a client
- Existing frameworks they do not want to replace

**Services a partner could sell**
- **Primitive replacement** One hand-rolled piece replaced, with the maintenance that went with it
- **Reference architecture** A shape their team reuses on the next build

**Revenue**
- *implementation* — Replace the part they are hand-rolling, memory or retrieval, in one build and measure what it saves
- *recurring* — Keep the primitives current underneath their builds as models and tooling move

**Customer problems it addresses**
- A team is maintaining its own memory, retrieval and orchestration code
- That code drifts behind each model release
- Rebuilding the same primitives on every engagement

**Eligibility requires**
- families: `engineering`, `integration`, `embedding`
- signals: `sdk`, `framework`, `retrieval`, `vector`, `embedding`, `custom agent`, `agent framework`, `langchain`, `llamaindex`, `rag`, `build our own`, `kubernetes`, `microservice`, `architecture`
- why: Primitives are for a team that is building something of their own. There is nothing to compose them into otherwise.

**Prerequisites**
- An active build, not a greenfield intention
- Engineers who will work against an SDK

**Do not recommend when**
- The partner wants a platform rather than parts: that is AgentBlocks OEM, which is a different conversation
- They are not building anything themselves

**Restrictions (what we may not promise)**
- Parts, not a platform: a firm that wants the whole platform wants AgentBlocks OEM

---

### Open Finetuning

- **id** `open_finetuning` · **motion** `expand_engagement` · **page** https://www.lyzr.ai/
- **What it is** Fine-tune open-weight models on the client's own data, inside the client's own environment.
- **Buyer** Head of Data Science or Chief Data Officer
- **Trigger** A general model is not good enough on their domain language, or their data cannot be sent to a vendor
- **Follow-on revenue** Re-evaluation and re-tuning as the client’s data and models move

**Capabilities**
- Fine-tune open-weight models on the client's own data

**Sits next to**
- Data engineering and feature pipelines
- Existing machine learning practices
- Sovereignty and residency work

**Services a partner could sell**
- **Baseline and feasibility** A measured gap between the general model and what the task needs
- **Fine-tune and evaluate** A model tuned on their own data, scored against their own examples
- **Retrain on a schedule** Performance held as their data moves

**Revenue**
- *implementation* — Fine-tune on one corpus the client owns and measure it against the general model on their own examples
- *recurring* — Retrain and re-evaluate on a schedule as the client's data moves

**Customer problems it addresses**
- A general model is not good enough on their domain language
- Their data is not permitted to be sent to a model vendor
- Prompt engineering has stopped improving the result

**Eligibility requires**
- families: `analytics`, `engineering`, `infrastructure`
- signals: `fine-tun`, `finetun`, `machine learning`, `data science`, `model training`, `mlops`, `nlp`, `open-weight`, `open weight`, `llm`, `models`, `kubernetes`, `gpu`, `training`
- why: Fine-tuning is sold by firms with data science people. Without them the engagement has nobody to run it.

**Prerequisites**
- Enough labelled or structured data of their own
- Somewhere to run the training
- A measurable task to improve

**Do not recommend when**
- The partner has no data science capability of its own
- Prompting and retrieval would get them there without training anything

**Restrictions (what we may not promise)**
- Needs enough of their own data and somewhere to run the training
- Where prompting and retrieval would get there, they are the cheaper answer

---

## 2. Packaged solutions (29)

`data/solution-offerings.json` — generated by `scripts/build-solution-offerings.js` from the catalogue. All run the `solution_to_segment` motion.

### 2a. Tied to an industry (9) — the segment plays

| Industry | Solution | id |
|---|---|---|
| e-commerce | E-commerce operations agents | `sol_e_commerce` |
| insurance | Insurance operations agents | `sol_insurance` |
| Healthcare | Healthcare operations agents | `sol_healthcare` |
| government | Public sector service agents | `sol_government` |
| fintech | Fintech compliance and fraud agents | `sol_fintech` |
| human resources | Diane: agents for Human Resources | `sol_human_resources` |
| banking | Madison | `sol_madison` |
| it operations | IT operations agents | `sol_it_operations` |
| banking | Madison GRC | `sol_madison_grc` |

### 2b. Horizontal / named agents (20)

| Solution | id |
|---|---|
| Jazon: agents for Revenue | `sol_revenue` |
| Skott: agents for Marketing | `sol_marketing` |
| Jeff: agents for Customer Service | `sol_customer_service` |
| Compliance and governance agents | `sol_compliance_and_governance` |
| Legal and contract agents | `sol_legal` |
| Procurement agents | `sol_procurement` |
| IT & Platform | `sol_it_and_platform` |
| Revenue and sales agents | `sol_revenue_and_sales` |
| Responsible AI | `sol_responsible_ai` |
| Lyzr Nitro | `sol_lyzr_nitro` |
| Orchestration as a Service | `sol_orchestration_as_a_service` |
| Agents as a Service | `sol_agents_as_a_service` |
| Hallucination Manager | `sol_hallucination_manager` |
| Knowledge Base | `sol_knowledge_base` |
| Knowledge Graph | `sol_knowledge_graph` |
| AI Agent Memory | `sol_ai_agent_memory` |
| OpenGAP | `sol_opengap` |
| GitAgent | `sol_gitagent` |
| Dwight, AI RFP Scout | `sol_dwight` |
| Kathy, AI competitor analyst | `sol_kathy` |

### 2c. Every solution in full

#### E-commerce operations agents — *e-commerce*

- **id** `sol_e_commerce` · **built on** `page_e_commerce` · https://www.lyzr.ai/ecommerce-agents/
- Building AI agents for e-commerce that handle personalization, support routing, product discovery, and inventory optimization across customer journey.
- **Buyer** Head of Marketing
- **Trigger** Content demand outrunning the team, or campaigns waiting on production

**Capabilities**
- Agents recommend products based on browsing history and deliver personalized marketing campaigns
- Agents route returns and exchanges with intelligent support personalization
- Agents automatically generate product descriptions, metadata, and keywords for search optimization
- Agents forecast demand, automate replenishment, and optimize warehouse operations

**Services a partner could sell**
- **E-commerce operations agents readiness assessment** Their marketing workflows mapped, with the first one scoped
- **E-commerce operations agents deployment** The solution running on one workflow inside their own systems
- **Run and extend E-commerce operations agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: agents recommend products based on browsing history and deliver personalized marketing campaigns
- Doing this by hand today: agents route returns and exchanges with intelligent support personalization
- Doing this by hand today: agents automatically generate product descriptions, metadata, and keywords for search optimization

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first marketing workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `outreach` · signals: `marketing`, `sales`, `customer service`, `customer`, `service`, `operations`, `supply chain`, `supply`, `chain`, `commerce`, `building`, `handle`, `personalization`, `support`, `routing`, `product`

#### Insurance operations agents — *insurance*

- **id** `sol_insurance` · **built on** `page_insurance` · https://www.lyzr.ai/insurance-ai-agent-benjie/
- Insurance operations transformation combining claims handling, underwriting and fraud detection into integrated workflow layer.
- **Buyer** Chief Risk Officer or Head of Compliance
- **Trigger** An audit date on the calendar, or a regulator asking how a decision was reached

**Capabilities**
- Monitors claims as they arrive cross-referencing behavioral patterns, historical data, network relationships and external intelligence
- Flags fraud before payment is authorized and hands off complete dossier to investigators
- Handles claims intake, acknowledgement, initial assessment and status communication in real time across channels
- Routes simple claims automatically and complex claims with full context to the right adjuster
- Reads live data and returns ranked execution plan by process, line of business and action

**Services a partner could sell**
- **Insurance operations agents readiness assessment** Their compliance workflows mapped, with the first one scoped
- **Insurance operations agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Insurance operations agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: monitors claims as they arrive cross-referencing behavioral patterns, historical data, network relationships and external intelligence
- Doing this by hand today: flags fraud before payment is authorized and hands off complete dossier to investigators
- Doing this by hand today: handles claims intake, acknowledgement, initial assessment and status communication in real time across channels

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first compliance workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `governance` · signals: `compliance`, `customer service`, `customer`, `service`, `finance`, `operations`, `insurance`, `transformation`, `combining`, `claims`, `handling`, `underwriting`, `fraud`, `detection`

#### Healthcare operations agents — *Healthcare*

- **id** `sol_healthcare` · **built on** `page_healthcare` · https://www.lyzr.ai/healthcare-agents/
- Automating prior authorization, claims processing, and denial management in healthcare revenue cycle operations with agents deployed above existing clinical systems.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Identifies prior authorization requirements, gathers clinical documentation, submits to payers, tracks status, and auto-initiates appeals on standard requests
- Predicts claims at risk before submission, corrects documentation gaps in real time, and auto-generates appeals with payer-specific evidence
- Deploys agents across eligibility verification, coding, claims management, prior auth, denial management, reducing manual touches per claim
- Monitors care coordination signals and routes interventions to right care team member at right moment

**Services a partner could sell**
- **Healthcare operations agents readiness assessment** Their operations workflows mapped, with the first one scoped
- **Healthcare operations agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Healthcare operations agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: identifies prior authorization requirements, gathers clinical documentation, submits to payers, tracks status, and auto-initiates appeals on standard requests
- Doing this by hand today: predicts claims at risk before submission, corrects documentation gaps in real time, and auto-generates appeals with payer-specific evidence
- Doing this by hand today: deploys agents across eligibility verification, coding, claims management, prior auth, denial management, reducing manual touches per claim

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `operations`, `finance`, `compliance`, `customer service`, `customer`, `service`, `healthcare`, `automating`, `prior`, `authorization`, `claims`, `processing`, `denial`, `management`, `revenue`, `cycle`

#### Jazon: agents for Revenue

- **id** `sol_revenue` · **built on** `page_revenue` · https://www.lyzr.ai/jazon/
- Sales execution automation with live account intelligence and agent-driven prospecting, outreach and deal progression.
- **Buyer** VP Sales or Chief Revenue Officer
- **Trigger** A pipeline target that needs more coverage than the team can give it

**Capabilities**
- Ranks accounts by fit, intent, timing and prior engagement daily
- Drafts personalized emails, LinkedIn notes and call openers per account
- Sequences outreach across email, LinkedIn, phone and ads with performance-based rewrites
- Books discovery, demo and follow-up meetings with context pre-shared
- Captures and scores calls against sales methodology into next-step actions

**Services a partner could sell**
- **Jazon: agents for Revenue readiness assessment** Their sales workflows mapped, with the first one scoped
- **Jazon: agents for Revenue deployment** The solution running on one workflow inside their own systems
- **Run and extend Jazon: agents for Revenue** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: ranks accounts by fit, intent, timing and prior engagement daily
- Doing this by hand today: drafts personalized emails, LinkedIn notes and call openers per account
- Doing this by hand today: sequences outreach across email, LinkedIn, phone and ads with performance-based rewrites

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first sales workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `outreach` · signals: `sales`, `execution`, `automation`, `live`, `account`, `intelligence`, `driven`, `prospecting`

#### Public sector service agents — *government*

- **id** `sol_government` · **built on** `page_government` · https://www.lyzr.ai/government/
- Orchestrating multi-agency citizen service workflows and standard procurement processing with agents while preserving human oversight for sensitive decisions.
- **Buyer** Chief Risk Officer or Head of Compliance
- **Trigger** An audit date on the calendar, or a regulator asking how a decision was reached

**Capabilities**
- Orchestrates citizen journey across agencies, verifying eligibility and retrieving verified data without requiring citizens to restart at agency boundaries
- Handles standard procurement intake, bid analysis, compliance validation, and evaluation summaries, routing only complex procurements to human decision-makers
- Deploys agents across high-volume rule-bound workflows: intake, document validation, eligibility checking, routing with human judgment retained for sensitive decisions
- Monitors regulatory and legislative change feeds continuously, mapping changes to policies, identifying gaps, and generating updated compliance documentation
- Triages citizen intake forms, calls and chats to correct programme with eligibility pre-checked

**Services a partner could sell**
- **Public sector service agents readiness assessment** Their compliance workflows mapped, with the first one scoped
- **Public sector service agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Public sector service agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: orchestrates citizen journey across agencies, verifying eligibility and retrieving verified data without requiring citizens to restart at agency boundaries
- Doing this by hand today: handles standard procurement intake, bid analysis, compliance validation, and evaluation summaries, routing only complex procurements to human decision-makers
- Doing this by hand today: deploys agents across high-volume rule-bound workflows: intake, document validation, eligibility checking, routing with human judgment retained for sensitive decisions

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first compliance workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `governance` · signals: `compliance`, `finance`, `operations`, `customer service`, `customer`, `service`, `procurement`, `government`, `orchestrating`, `multi`, `agency`, `citizen`, `workflows`, `standard`, `processing`

#### Fintech compliance and fraud agents — *fintech*

- **id** `sol_fintech` · **built on** `page_fintech` · https://www.lyzr.ai/fintech/
- Operating a fintech compliance and fraud operations center as orchestrated agentic workflows across payment, onboarding, and regulatory systems.
- **Buyer** Finance Director
- **Trigger** A close that runs long, or reporting assembled by hand each month

**Capabilities**
- Correlates fraud signals, device intelligence, transaction velocity, counterparty analysis, and historical patterns into context-aware dynamic fraud scores with explainability.
- Runs KYC and onboarding as parallel event-driven workflows executing identity verification, sanctions screening, risk profiling, and account provisioning simultaneously.
- Monitors regulatory change feeds across CFPB, FCA, FINRA, MiCA, and state jurisdictions continuously, maps changes to systems, and generates updated controls.
- Selects and stages relevant agents from 400+ available for fraud scoring, KYC, underwriting, AML monitoring, and dispute resolution within defined risk boundaries.
- Logs every agent decision with reasoning at execution time and tracks outcomes against stated business objectives for audit trails and insights.

**Services a partner could sell**
- **Fintech compliance and fraud agents readiness assessment** Their finance workflows mapped, with the first one scoped
- **Fintech compliance and fraud agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Fintech compliance and fraud agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: correlates fraud signals, device intelligence, transaction velocity, counterparty analysis, and historical patterns into context-aware dynamic fraud scores with explainability.
- Doing this by hand today: runs KYC and onboarding as parallel event-driven workflows executing identity verification, sanctions screening, risk profiling, and account provisioning simultaneously.
- Doing this by hand today: monitors regulatory change feeds across CFPB, FCA, FINRA, MiCA, and state jurisdictions continuously, maps changes to systems, and generates updated controls.

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first finance workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `analytics` · signals: `finance`, `compliance`, `operations`, `customer service`, `customer`, `service`, `fintech`, `operating`, `fraud`, `center`, `orchestrated`, `agentic`, `workflows`

#### Skott: agents for Marketing

- **id** `sol_marketing` · **built on** `page_marketing` · https://www.lyzr.ai/skott/
- Deploy marketing and sales agents to connect channels to pipeline, attribute impact, and run content execution at scale without headcount.
- **Buyer** Head of Marketing
- **Trigger** Content demand outrunning the team, or campaigns waiting on production

**Capabilities**
- Audits content against pipeline data and buyer intent to find what should work but does not
- Builds and distributes missing content automatically without requiring creative briefs
- Creates live account briefs from funding signals, hiring patterns, stakeholder maps and deal history
- Orchestrates content creation, distribution, sequencing and publishing across channels
- Tracks every campaign outcome against objectives and surfaces what to do differently

**Services a partner could sell**
- **Skott: agents for Marketing readiness assessment** Their marketing workflows mapped, with the first one scoped
- **Skott: agents for Marketing deployment** The solution running on one workflow inside their own systems
- **Run and extend Skott: agents for Marketing** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: audits content against pipeline data and buyer intent to find what should work but does not
- Doing this by hand today: builds and distributes missing content automatically without requiring creative briefs
- Doing this by hand today: creates live account briefs from funding signals, hiring patterns, stakeholder maps and deal history

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first marketing workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `outreach` · signals: `marketing`, `sales`, `deploy`, `connect`, `channels`, `pipeline`, `attribute`, `impact`, `content`

#### Jeff: agents for Customer Service

- **id** `sol_customer_service` · **built on** `page_customer_service` · https://www.lyzr.ai/jeff/
- Building an agent layer that routes customer issues by type and channel while identifying and fixing recurring problems in the knowledge base.
- **Buyer** Director of Customer Service
- **Trigger** Response times slipping, or a support team hiring to keep up

**Capabilities**
- Maps recurring issue patterns across ticket history and identifies knowledge base gaps and outdated content
- Generates articles, workflows, and deflection paths to eliminate issues at source
- Builds live context profile per customer including account value, contract tier, interaction history, and product usage
- Surfaces customer context and risk the moment contact arrives across any channel
- Routes issues to specialized agents by type: triage, resolution, escalation, proactive outreach, knowledge base update, root cause analysis

**Services a partner could sell**
- **Jeff: agents for Customer Service readiness assessment** Their customer service workflows mapped, with the first one scoped
- **Jeff: agents for Customer Service deployment** The solution running on one workflow inside their own systems
- **Run and extend Jeff: agents for Customer Service** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: maps recurring issue patterns across ticket history and identifies knowledge base gaps and outdated content
- Doing this by hand today: generates articles, workflows, and deflection paths to eliminate issues at source
- Doing this by hand today: builds live context profile per customer including account value, contract tier, interaction history, and product usage

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first customer service workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `support` · signals: `customer service`, `customer`, `service`, `building`, `layer`, `routes`, `issues`, `type`, `channel`, `while`

#### Diane: agents for Human Resources — *human resources*

- **id** `sol_human_resources` · **built on** `page_human_resources` · https://www.lyzr.ai/diane/
- Intelligent HR operations layer that accelerates hiring, surfaces attrition risk early, and delivers people outcomes above HR activity metrics.
- **Buyer** Chief People Officer
- **Trigger** A hiring push, or an onboarding process that depends on one person

**Capabilities**
- Maps hiring funnel bottlenecks and deploys agents to run sourcing, screening, scheduling, and communication in parallel
- Monitors onboarding health continuously and surfaces issues in week two via task completion and engagement signals
- Deploys always-available employee intelligence layer answering queries, collecting sentiment, and routing escalations
- Reads live workforce data against stated people objectives and returns ranked execution plans with reasoning

**Services a partner could sell**
- **Diane: agents for Human Resources readiness assessment** Their hr workflows mapped, with the first one scoped
- **Diane: agents for Human Resources deployment** The solution running on one workflow inside their own systems
- **Run and extend Diane: agents for Human Resources** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: maps hiring funnel bottlenecks and deploys agents to run sourcing, screening, scheduling, and communication in parallel
- Doing this by hand today: monitors onboarding health continuously and surfaces issues in week two via task completion and engagement signals
- Doing this by hand today: deploys always-available employee intelligence layer answering queries, collecting sentiment, and routing escalations

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first hr workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `people` · signals: `hr`, `human`, `resources`, `intelligent`, `operations`, `layer`, `accelerates`, `hiring`, `surfaces`, `attrition`, `risk`, `early`

#### Compliance and governance agents

- **id** `sol_compliance_and_governance` · **built on** `page_compliance_and_governance` · https://www.lyzr.ai/teams/compliance-teams/
- Continuous compliance monitoring and governance for AI agent deployments with real-time policy enforcement and full audit trails.
- **Buyer** Chief Risk Officer or Head of Compliance
- **Trigger** An audit date on the calendar, or a regulator asking how a decision was reached

**Capabilities**
- Monitors every transaction and policy trigger continuously, surfacing issues before they become findings
- Maintains full audit-ready traces on every decision with one-click compliance exports
- Logs every AI decision input, model run, output, and policy checks automatically and reconstructably
- Enforces RAI policies at inference time on all agent outputs before user visibility

**Services a partner could sell**
- **Compliance and governance agents readiness assessment** Their compliance workflows mapped, with the first one scoped
- **Compliance and governance agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Compliance and governance agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: monitors every transaction and policy trigger continuously, surfacing issues before they become findings
- Doing this by hand today: maintains full audit-ready traces on every decision with one-click compliance exports
- Doing this by hand today: logs every AI decision input, model run, output, and policy checks automatically and reconstructably

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first compliance workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `governance` · signals: `compliance`, `it operations`, `operations`, `continuous`, `monitoring`, `governance`, `deployments`, `real`, `time`, `policy`

#### Legal and contract agents

- **id** `sol_legal` · **built on** `page_legal` · https://www.lyzr.ai/legal-industry/
- Operating legal function's contract monitoring, compliance tracking, and first-draft work through orchestrated agent workflows without replacing existing CLM or matter systems.
- **Buyer** General Counsel
- **Trigger** Contract review queued behind one team, or a regulatory change to absorb

**Capabilities**
- Monitors every obligation, deadline, and renewal window across contract portfolio continuously.
- Identifies regulatory changes across jurisdictions and gaps against existing compliance posture.
- Generates first-draft contracts, redlines, research memos, entity filings, and compliance documentation.
- Maintains living knowledge layer of legal positions, precedents, and playbooks so answers draw on prior decisions not built from scratch.
- Activates relevant agents from 400+ by legal objective and workflow stage to execute plan.

**Services a partner could sell**
- **Legal and contract agents readiness assessment** Their legal workflows mapped, with the first one scoped
- **Legal and contract agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Legal and contract agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: monitors every obligation, deadline, and renewal window across contract portfolio continuously.
- Doing this by hand today: identifies regulatory changes across jurisdictions and gaps against existing compliance posture.
- Doing this by hand today: generates first-draft contracts, redlines, research memos, entity filings, and compliance documentation.

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first legal workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `governance` · signals: `legal`, `compliance`, `operating`, `function`, `contract`, `monitoring`, `tracking`, `first`, `draft`, `work`

#### Procurement agents

- **id** `sol_procurement` · **built on** `page_procurement` · https://www.lyzr.ai/procurement/
- Running procurement execution from supplier sourcing through contract compliance and spend monitoring as an agent-driven OS above existing systems.
- **Buyer** Head of Procurement
- **Trigger** A sourcing cycle under pressure, or supplier data spread across inboxes

**Capabilities**
- Connects spend categories to supplier performance, contract compliance, and market benchmarks to surface overpayment and renegotiation opportunities.
- Monitors every supplier for financial health, geopolitical exposure, ESG risk, concentration risk, and performance trends to flag vulnerability early.
- Continuously monitors supplier performance against contracted SLAs, delivery terms, pricing clauses and compliance obligations, surfacing deviations with evidence.
- Automates supplier research, RFx drafting, contract review, onboarding, compliance monitoring and spend reporting to free teams for strategic work.
- Accepts a spend objective and returns a ranked execution plan by category, supplier and action with reasoning.

**Services a partner could sell**
- **Procurement agents readiness assessment** Their procurement workflows mapped, with the first one scoped
- **Procurement agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Procurement agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: connects spend categories to supplier performance, contract compliance, and market benchmarks to surface overpayment and renegotiation opportunities.
- Doing this by hand today: monitors every supplier for financial health, geopolitical exposure, ESG risk, concentration risk, and performance trends to flag vulnerability early.
- Doing this by hand today: continuously monitors supplier performance against contracted SLAs, delivery terms, pricing clauses and compliance obligations, surfacing deviations with evidence.

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first procurement workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `ordering` · signals: `procurement`, `running`, `execution`, `from`, `supplier`, `sourcing`, `through`, `contract`, `compliance`, `spend`

#### IT & Platform

- **id** `sol_it_and_platform` · **built on** `page_it_and_platform` · https://www.lyzr.ai/teams/platform-teams/
- Building and governing an enterprise AI agent platform with centralized deployment, security, and observability controls.
- **Buyer** Head of IT Operations or CIO
- **Trigger** Ticket volume growing faster than the team, or an estate nobody has inventoried

**Capabilities**
- Provides infrastructure architecture for sovereign, agnostic AI agent deployment
- Establishes central control plane, CI/CD, and observability layers for coordinated agent governance
- Enables VPC deployment, zero-data-egress configuration, and RBAC for security compliance
- Supports production-ready agent deployment from prototype to live systems

**Services a partner could sell**
- **IT & Platform readiness assessment** Their it operations workflows mapped, with the first one scoped
- **IT & Platform deployment** The solution running on one workflow inside their own systems
- **Run and extend IT & Platform** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: provides infrastructure architecture for sovereign, agnostic AI agent deployment
- Doing this by hand today: establishes central control plane, CI/CD, and observability layers for coordinated agent governance
- Doing this by hand today: enables VPC deployment, zero-data-egress configuration, and RBAC for security compliance

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first it operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `incident` · signals: `it operations`, `operations`, `building`, `governing`, `enterprise`, `platform`, `centralized`, `deployment`, `security`, `observability`

#### Revenue and sales agents

- **id** `sol_revenue_and_sales` · **built on** `page_revenue_and_sales` · https://www.lyzr.ai/teams/revenue-and-sales-team/
- Operating revenue team workflows at scale through agents handling research, outreach sequencing, pipeline hygiene, and follow-up.
- **Buyer** VP Sales or Chief Revenue Officer
- **Trigger** A pipeline target that needs more coverage than the team can give it

**Capabilities**
- Enriches and scores every prospect automatically before it reaches a rep
- Runs personalised outreach sequences in parallel at enterprise scale without adding headcount
- Surfaces deal data current and enriched, automatically updating pipeline intelligence
- Triggers automatic follow-up nudges for stalled deals at the right moment

**Services a partner could sell**
- **Revenue and sales agents readiness assessment** Their sales workflows mapped, with the first one scoped
- **Revenue and sales agents deployment** The solution running on one workflow inside their own systems
- **Run and extend Revenue and sales agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: enriches and scores every prospect automatically before it reaches a rep
- Doing this by hand today: runs personalised outreach sequences in parallel at enterprise scale without adding headcount
- Doing this by hand today: surfaces deal data current and enriched, automatically updating pipeline intelligence

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first sales workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `outreach` · signals: `sales`, `marketing`, `operating`, `revenue`, `team`, `workflows`, `scale`, `through`, `handling`, `research`, `outreach`

#### Responsible AI

- **id** `sol_responsible_ai` · **built on** `page_responsible_ai` · https://www.lyzr.ai/responsible-ai-as-a-service/
- Implementing responsible AI governance frameworks with continuous bias monitoring, PII protection, and explainability controls.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Continuous bias detection keeps outcomes fair and equitable
- Traces and audits reasoning behind every agent decision
- Redacts personally identifiable information to prevent data exposure
- Merges LLMs with structured ML to prevent hallucinations
- Integrates human-in-the-loop oversight and real-time monitoring

**Services a partner could sell**
- **Responsible AI readiness assessment** Their operations workflows mapped, with the first one scoped
- **Responsible AI deployment** The solution running on one workflow inside their own systems
- **Run and extend Responsible AI** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: continuous bias detection keeps outcomes fair and equitable
- Doing this by hand today: traces and audits reasoning behind every agent decision
- Doing this by hand today: redacts personally identifiable information to prevent data exposure

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `implementing`, `responsible`, `governance`, `frameworks`, `continuous`, `bias`, `monitoring`, `protection`, `explainability`

#### Lyzr Nitro

- **id** `sol_lyzr_nitro` · **built on** `page_lyzr_nitro` · https://www.lyzr.ai/partners/google/
- Delivering production-grade agents on Vertex AI with built-in simulation, governance, and CI/CD inside customer GCP environments in 48 hours.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Collapses fourteen separate platforms into one integrated stack running inside GCP VPC
- Runs agent simulation at scale with 50,000 test scenarios before production deployment
- Provides hybrid BPMN orchestration through SuperFlow for complex multi-step agent processes
- Enables fine-tuning of open source models on customer data within their own environment
- Delivers Git-native CI/CD with staged promotion, versioning, and instant rollback per release

**Services a partner could sell**
- **Lyzr Nitro readiness assessment** Their operations workflows mapped, with the first one scoped
- **Lyzr Nitro deployment** The solution running on one workflow inside their own systems
- **Run and extend Lyzr Nitro** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: collapses fourteen separate platforms into one integrated stack running inside GCP VPC
- Doing this by hand today: runs agent simulation at scale with 50,000 test scenarios before production deployment
- Doing this by hand today: provides hybrid BPMN orchestration through SuperFlow for complex multi-step agent processes

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `delivering`, `production`, `grade`, `vertex`, `built`, `simulation`, `governance`, `inside`

#### Orchestration as a Service

- **id** `sol_orchestration_as_a_service` · **built on** `page_orchestration_as_a_service` · https://www.lyzr.ai/orchestration-as-a-service/
- Centralizing AI agent orchestration to eliminate manual coordination and accelerate multi-agent workflow execution.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Coordinates actions of multiple AI agents in defined or dynamic sequences
- Automates handoffs between agents to maintain workflow momentum
- Provides centralized orchestration with role clarity and error resilience
- Manages dependencies between agents with visual or manager-agent models

**Services a partner could sell**
- **Orchestration as a Service readiness assessment** Their operations workflows mapped, with the first one scoped
- **Orchestration as a Service deployment** The solution running on one workflow inside their own systems
- **Run and extend Orchestration as a Service** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: coordinates actions of multiple AI agents in defined or dynamic sequences
- Doing this by hand today: automates handoffs between agents to maintain workflow momentum
- Doing this by hand today: provides centralized orchestration with role clarity and error resilience

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `centralizing`, `orchestration`, `eliminate`, `manual`, `coordination`, `accelerate`, `multi`, `workflow`

#### Agents as a Service

- **id** `sol_agents_as_a_service` · **built on** `page_agents_as_a_service` · https://www.lyzr.ai/agents-as-a-service/
- Building and deploying custom AI agents to automate enterprise workflows without specialized ML engineering teams.
- **Buyer** Head of IT Operations or CIO
- **Trigger** Ticket volume growing faster than the team, or an estate nobody has inventoried

**Capabilities**
- Design and configure custom AI agents via low-code Agent Studio
- Deploy agents as microservices callable via API in minutes
- Integrate agents with databases, CRMs, and custom APIs
- Build multi-agent systems using visual orchestration tools including DAG workflows
- Equip agents with proprietary knowledge bases for context-aware responses

**Services a partner could sell**
- **Agents as a Service readiness assessment** Their it operations workflows mapped, with the first one scoped
- **Agents as a Service deployment** The solution running on one workflow inside their own systems
- **Run and extend Agents as a Service** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: design and configure custom AI agents via low-code Agent Studio
- Doing this by hand today: deploy agents as microservices callable via API in minutes
- Doing this by hand today: integrate agents with databases, CRMs, and custom APIs

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first it operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `incident` · signals: `it operations`, `operations`, `building`, `deploying`, `custom`, `automate`, `enterprise`, `workflows`, `without`, `specialized`, `engineering`

#### Hallucination Manager

- **id** `sol_hallucination_manager` · **built on** `page_hallucination_manager` · https://www.lyzr.ai/hallucination-manager-as-a-service/
- Implementing verified AI accuracy controls with hallucination detection integrated into enterprise applications.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Detects and mitigates hallucinations before outputs reach users
- Cross-references AI outputs against verified data sources for truthfulness
- Uses mathematical logic to verify factual accuracy of responses
- Configures responsible AI policies through UI without coding

**Services a partner could sell**
- **Hallucination Manager readiness assessment** Their operations workflows mapped, with the first one scoped
- **Hallucination Manager deployment** The solution running on one workflow inside their own systems
- **Run and extend Hallucination Manager** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: detects and mitigates hallucinations before outputs reach users
- Doing this by hand today: cross-references AI outputs against verified data sources for truthfulness
- Doing this by hand today: uses mathematical logic to verify factual accuracy of responses

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `implementing`, `verified`, `accuracy`, `controls`, `hallucination`, `detection`, `integrated`, `enterprise`

#### Knowledge Base

- **id** `sol_knowledge_base` · **built on** `page_knowledge_base` · https://www.lyzr.ai/knowledge-base-as-a-service/
- Building a centralized, AI-powered knowledge base that transforms scattered documents into searchable Q&A systems for faster information access.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Ingests PDFs, DOCX, TXT, CSV, JSON and web pages into a centralized index
- Breaks documents into semantic chunks for accurate retrieval
- Answers natural language questions with direct excerpts from source documents
- Offers three retrieval strategies: Basic, MMR, and HyDE for different query types
- Connects knowledge base to AI agents via visual interface without coding

**Services a partner could sell**
- **Knowledge Base readiness assessment** Their operations workflows mapped, with the first one scoped
- **Knowledge Base deployment** The solution running on one workflow inside their own systems
- **Run and extend Knowledge Base** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: ingests PDFs, DOCX, TXT, CSV, JSON and web pages into a centralized index
- Doing this by hand today: breaks documents into semantic chunks for accurate retrieval
- Doing this by hand today: answers natural language questions with direct excerpts from source documents

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `building`, `centralized`, `powered`, `knowledge`, `base`, `transforms`, `scattered`, `documents`

#### Knowledge Graph

- **id** `sol_knowledge_graph` · **built on** `page_knowledge_graph` · https://www.lyzr.ai/knowledge-graph-as-a-service/
- Building and querying knowledge graphs over enterprise documents to enable cross-document reasoning and reduce analysis time.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Transforms unstructured data into an interconnected knowledge graph using automated entity and relationship extraction.
- Answers cross-document questions with single, coherent responses spanning multiple files.
- Provides entity disambiguation to understand precise context of every entity.
- Navigates relationships between concepts from organizational structures to project dependencies.
- Translates complex natural language questions into powerful graph traversals.

**Services a partner could sell**
- **Knowledge Graph readiness assessment** Their operations workflows mapped, with the first one scoped
- **Knowledge Graph deployment** The solution running on one workflow inside their own systems
- **Run and extend Knowledge Graph** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: transforms unstructured data into an interconnected knowledge graph using automated entity and relationship extraction.
- Doing this by hand today: answers cross-document questions with single, coherent responses spanning multiple files.
- Doing this by hand today: provides entity disambiguation to understand precise context of every entity.

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `building`, `querying`, `knowledge`, `graphs`, `over`, `enterprise`, `documents`, `enable`, `cross`, `document`

#### AI Agent Memory

- **id** `sol_ai_agent_memory` · **built on** `page_ai_agent_memory` · https://www.lyzr.ai/cognis/
- Implementing persistent agent memory with local fact extraction and hybrid search for multi-turn AI workflows.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Extracts atomic facts from conversations and auto-categorizes across 13 categories
- Stores facts locally in SQLite and Qdrant with no cloud infrastructure required
- Retrieves relevant context via hybrid vector and BM25 search in 300ms
- Isolates memory by owner_id, agent_id, and session_id to prevent cross-contamination
- Automatically adds, updates, or deletes memories to keep knowledge accurate

**Services a partner could sell**
- **AI Agent Memory readiness assessment** Their operations workflows mapped, with the first one scoped
- **AI Agent Memory deployment** The solution running on one workflow inside their own systems
- **Run and extend AI Agent Memory** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: extracts atomic facts from conversations and auto-categorizes across 13 categories
- Doing this by hand today: stores facts locally in SQLite and Qdrant with no cloud infrastructure required
- Doing this by hand today: retrieves relevant context via hybrid vector and BM25 search in 300ms

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `implementing`, `persistent`, `memory`, `local`, `fact`, `extraction`, `hybrid`, `search`

#### OpenGAP

- **id** `sol_opengap` · **built on** `page_opengap` · https://www.lyzr.ai/oss/opengap/
- Implement framework-agnostic AI agent definitions stored as version-controlled git repositories with multi-framework export capability.
- **Buyer** Chief Operating Officer
- **Trigger** A process that breaks at volume, or exceptions handled by whoever is free

**Capabilities**
- Defines agents as version-controlled files in git repositories using agent.yaml and SOUL.md
- Exports a single agent definition to eight frameworks including Claude, OpenAI, Lyzr, and CrewAI with one adapter flag
- Stores agent identity, memory, skills, and rules as composable files that can be versioned, branched, and merged
- Enables collaboration on agents using git workflows: forking, pull requests, code review, and promotion across environments

**Services a partner could sell**
- **OpenGAP readiness assessment** Their operations workflows mapped, with the first one scoped
- **OpenGAP deployment** The solution running on one workflow inside their own systems
- **Run and extend OpenGAP** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: defines agents as version-controlled files in git repositories using agent.yaml and SOUL.md
- Doing this by hand today: exports a single agent definition to eight frameworks including Claude, OpenAI, Lyzr, and CrewAI with one adapter flag
- Doing this by hand today: stores agent identity, memory, skills, and rules as composable files that can be versioned, branched, and merged

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `integration` · signals: `implement`, `framework`, `agnostic`, `definitions`, `stored`, `version`, `controlled`, `repositories`

#### GitAgent

- **id** `sol_gitagent` · **built on** `page_gitagent` · https://www.lyzr.ai/oss/gitagent/
- Deploy self-improving, auditable AI coding agents with git-native memory and multi-model support for regulated industries.
- **Buyer** VP Engineering
- **Trigger** A backlog that grows faster than it clears

**Capabilities**
- Creates a git branch for each agent session, persisting working memory and decisions as commits
- Evaluates agent outputs through a reinforcement learning loop and commits skill improvements back to the repository
- Decomposes complex tasks into subtasks with full traceability and autonomous planning
- Supports multiple LLM providers through the OpenGAP standard without changing agent definition

**Services a partner could sell**
- **GitAgent readiness assessment** Their engineering workflows mapped, with the first one scoped
- **GitAgent deployment** The solution running on one workflow inside their own systems
- **Run and extend GitAgent** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: creates a git branch for each agent session, persisting working memory and decisions as commits
- Doing this by hand today: evaluates agent outputs through a reinforcement learning loop and commits skill improvements back to the repository
- Doing this by hand today: decomposes complex tasks into subtasks with full traceability and autonomous planning

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first engineering workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `engineering` · signals: `engineering`, `deploy`, `self`, `improving`, `auditable`, `coding`, `native`, `memory`, `multi`

#### Madison — *banking*

- **id** `sol_madison` · **built on** `page_madison` · https://madison.lyzr-ai.com/
- Deploying and governing AI agents in banking operations with compliance oversight and staged promotion controls.
- **Buyer** Chief Risk Officer or Head of Compliance
- **Trigger** An audit date on the calendar, or a regulator asking how a decision was reached

**Capabilities**
- Deploys governed AI agents with compliance gates and controls
- Manages staged promotion of agents through compliance checkpoints
- Enforces regulatory controls during agent deployment and operation

**Services a partner could sell**
- **Madison readiness assessment** Their compliance workflows mapped, with the first one scoped
- **Madison deployment** The solution running on one workflow inside their own systems
- **Run and extend Madison** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: deploys governed AI agents with compliance gates and controls
- Doing this by hand today: manages staged promotion of agents through compliance checkpoints
- Doing this by hand today: enforces regulatory controls during agent deployment and operation

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first compliance workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `governance` · signals: `compliance`, `it operations`, `operations`, `banking`, `deploying`, `governing`, `oversight`, `staged`, `promotion`

#### IT operations agents — *it operations*

- **id** `sol_it_operations` · **built on** `page_it_operations` · https://www.lyzr.ai/it-operations/
- IT operations orchestration layer that correlates monitoring signals and automates incident response and change management.
- **Buyer** Head of IT Operations or CIO
- **Trigger** Ticket volume growing faster than the team, or an estate nobody has inventoried

**Capabilities**
- Correlates signals across metrics, logs, traces and events into actionable incidents
- Builds live incident context brief with affected services, root cause, blast radius and remediation
- Executes autonomous remediation within guardrails without paging humans
- Runs change risk assessment against CMDB and incident history before deployment

**Services a partner could sell**
- **IT operations agents readiness assessment** Their it operations workflows mapped, with the first one scoped
- **IT operations agents deployment** The solution running on one workflow inside their own systems
- **Run and extend IT operations agents** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: correlates signals across metrics, logs, traces and events into actionable incidents
- Doing this by hand today: builds live incident context brief with affected services, root cause, blast radius and remediation
- Doing this by hand today: executes autonomous remediation within guardrails without paging humans

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first it operations workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `incident` · signals: `it operations`, `operations`, `orchestration`, `layer`, `correlates`, `monitoring`, `signals`, `automates`, `incident`, `response`

#### Madison GRC — *banking*

- **id** `sol_madison_grc` · **built on** `page_madison_grc` · https://www.madison.lyzr.ai/
- Operating a connected regulatory obligation and control model with continuous agent-assisted tracing and attestation.
- **Buyer** Chief Risk Officer or Head of Compliance
- **Trigger** An audit date on the calendar, or a regulator asking how a decision was reached

**Capabilities**
- Agents monitor regulatory feeds and trace rule changes to every affected obligation, policy, procedure and control
- Agents link examination requests back to underlying obligations and evidence in the chain
- Named people attest changes against specific object versions with signatures on record
- Agents surface what regulatory text changed and tag everything it touches

**Services a partner could sell**
- **Madison GRC readiness assessment** Their compliance workflows mapped, with the first one scoped
- **Madison GRC deployment** The solution running on one workflow inside their own systems
- **Run and extend Madison GRC** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: agents monitor regulatory feeds and trace rule changes to every affected obligation, policy, procedure and control
- Doing this by hand today: agents link examination requests back to underlying obligations and evidence in the chain
- Doing this by hand today: named people attest changes against specific object versions with signatures on record

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first compliance workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `governance` · signals: `compliance`, `it operations`, `operations`, `banking`, `operating`, `connected`, `regulatory`, `obligation`, `control`, `model`, `continuous`, `assisted`

#### Dwight, AI RFP Scout

- **id** `sol_dwight` · **built on** `page_dwight` · https://www.lyzr.ai/dwight-ai-rfp-scout/
- Running autonomous RFP discovery, scoring and first-draft generation as continuous background agents feeding your bid desk.
- **Buyer** VP Sales or Chief Revenue Officer
- **Trigger** A pipeline target that needs more coverage than the team can give it

**Capabilities**
- Scouts public, private and gated RFP portals continuously, applying custom filters for geography, industry, budget and contract type
- Scores every RFP against your strengths, history and capacity to surface win probability before drafting begins
- Pulls templates and past wins to produce structured first draft in minutes
- Routes RFP alerts to Slack, email and CRM so right stakeholders move fast
- Tracks submission outcomes, response times and content reuse to improve each cycle

**Services a partner could sell**
- **Dwight, AI RFP Scout readiness assessment** Their sales workflows mapped, with the first one scoped
- **Dwight, AI RFP Scout deployment** The solution running on one workflow inside their own systems
- **Run and extend Dwight, AI RFP Scout** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: scouts public, private and gated RFP portals continuously, applying custom filters for geography, industry, budget and contract type
- Doing this by hand today: scores every RFP against your strengths, history and capacity to surface win probability before drafting begins
- Doing this by hand today: pulls templates and past wins to produce structured first draft in minutes

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first sales workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `outreach` · signals: `sales`, `running`, `autonomous`, `discovery`, `scoring`, `first`, `draft`, `generation`, `continuous`, `background`

#### Kathy, AI competitor analyst

- **id** `sol_kathy` · **built on** `page_kathy` · https://www.lyzr.ai/kathy/
- Continuous competitive monitoring and market intelligence platform that surfaces competitor moves and market shifts with strategic implications delivered to leadership and sales teams.
- **Buyer** Head of Marketing
- **Trigger** Content demand outrunning the team, or campaigns waiting on production

**Capabilities**
- Monitors product pages, release notes, press, social and hiring signals continuously to detect launches
- Tracks competitor narratives across blogs, social, ads, podcasts and reports traction not just volume
- Delivers on-demand market briefs synthesized from live signals including funding, hiring and GTM moves
- Flags new competitive moves, models impact and suggests counter-strategies while monitoring ongoing
- Reads live data pipelines to return ranked execution plans with reasoning tied to objectives

**Services a partner could sell**
- **Kathy, AI competitor analyst readiness assessment** Their marketing workflows mapped, with the first one scoped
- **Kathy, AI competitor analyst deployment** The solution running on one workflow inside their own systems
- **Run and extend Kathy, AI competitor analyst** Kept current as their process and their rules change

**Customer problems**
- Doing this by hand today: monitors product pages, release notes, press, social and hiring signals continuously to detect launches
- Doing this by hand today: tracks competitor narratives across blogs, social, ads, podcasts and reports traction not just volume
- Doing this by hand today: delivers on-demand market briefs synthesized from live signals including funding, hiring and GTM moves

**Revenue**
- *implementation* — Assessment charged as an engagement, then the first marketing workflow deployed
- *recurring* — A monthly fee to run it, growing with each further workflow

**Eligibility requires** families: `outreach` · signals: `marketing`, `sales`, `continuous`, `competitive`, `monitoring`, `market`, `intelligence`, `platform`, `surfaces`, `competitor`, `moves`

---

## 3. Commercial motions (5)

`data/motions.json`. One recommendation per motion: three cards on one motion are three versions of the same meeting.

### Upsell into existing AI projects  `governance_upsell`

- Add a layer to work the partner already delivers. The client already has agents in production; this governs them without replacing what they run.
- **Sells to** the accounts they already hold
- **Needs from the partner** a partner already building or running AI in production

### New infrastructure and services offering  `new_category`

- Enter a category the partner does not sell today, on the back of infrastructure or environment work they already do.
- **Sells to** clients whose requirements rule out what the partner can offer now
- **Needs from the partner** infrastructure, private cloud or regulated delivery experience

### Expand existing delivery engagements  `expand_engagement`

- Take an engagement the partner already runs and widen its scope with a Lyzr product, rather than starting a new line of business.
- **Sells to** the engagement they are already inside
- **Needs from the partner** live build, integration or automation engagements

### Build reusable or branded IP  `build_ip`

- Turn repeated delivery into something the partner owns and licenses, instead of rebuilding it per client.
- **Sells to** every client of a product they ship themselves
- **Needs from the partner** a product, an accelerator or repeated identical builds

### Take a Lyzr solution to your segment  `solution_to_segment`

- Deploy a packaged Lyzr solution into a customer segment the partner already serves, instead of building the equivalent from scratch.
- **Sells to** a segment they already have relationships in
- **Needs from the partner** clients in the segment the solution was built for

---

## 4. Engagement shapes (10)

`data/patterns.json`. Durations, staffing and revenue are written here and never by a model. `{work}` and `{unit}` are filled per opportunity.

### `assess-then-build` — expand

- **When** The client already runs the process and the partner already works inside it. The question is which part of it stops being manual first.
- **First offer** {work} assessment — 3 weeks, one {unit}, ends with the process mapped end to end with the manual steps costed, and a scoped pilot on one of them
- **Delivery** 8 to 10 week build on one {unit}, then a managed fee to run and extend it (1 solution architect + 1 to 2 engineers)
- **Expansion** A monthly fee to run it, then the same pattern on the next {unit} in the same account

**Revenue streams**
- *implementation* — Process mapping, solution design, agent configuration, integration with the systems the {unit} already runs on, and deployment of the first build
- *recurring* — Running the agents, handling the exceptions, tuning as the process changes, and support for the people who use it
- *expansion* — The same pattern on the next {unit} in the same account, then the adjacent processes as they come up

**Discovery questions**
- How many {unit}s go through this today, and how often
- Which steps are already rule-based, and which need judgement
- Which systems hold the data the steps read
- Who approves an exception today, and how it reaches them

**Roles** — partner: The process knowledge, the client relationship, the integration and the delivery team · Lyzr: The platform the agents run on, the controls, and support through the first build

### `prove-then-roll-out` — expand

- **When** The work is technically uncertain rather than commercially uncertain. Prove it on one narrow case, then sell the rollout.
- **First offer** {work} feasibility proof — 2 weeks, one {unit}, ends with a working proof on one {unit}, with the accuracy measured against their own examples
- **Delivery** 6 week proof on one {unit}, then a per-{unit} rollout (1 engineer + 1 person from the client who knows the exceptions)
- **Expansion** Each further {unit} is a shorter build on the same proven pattern

**Revenue streams**
- *implementation* — The feasibility proof on one {unit}, then the build that follows it: solution design, integration, testing and release
- *recurring* — Monitoring each live {unit}, tuning the models, and support through every rollout wave
- *expansion* — Each further {unit} as a shorter build on the proven pattern, with no new architecture to pay for

**Discovery questions**
- How many {unit}s exist, and which are highest volume
- What a correct result looks like, and who decides that today
- Which systems the result has to be written back into
- What accuracy would have to be true before they trust it unattended

**Roles** — partner: The client's examples, the integration work and the people who judge the output · Lyzr: The platform, the models and the engineer who sits with you through the proof

### `audit-then-build` — win

- **When** A packaged offer for a client the partner does not have yet. The audit is the way in, and it has to be worth paying for on its own.
- **First offer** {work} audit — 2 to 3 weeks, one {unit}, ends with where the time actually goes in one {unit}, and a scoped build on the worst of it
- **Delivery** 6 week build on one {unit}, then recurring per {unit} (1 consultant who knows the domain + 1 engineer)
- **Expansion** The second {unit} is a shorter build, and the audit becomes the repeatable way in to the next client

**Revenue streams**
- *implementation* — The audit and its findings, then design, build, integration and deployment on the first {unit}
- *recurring* — Running and supporting each {unit} once it is live, with changes as the process moves
- *expansion* — The second {unit} as a shorter build, and the audit itself as the repeatable way in to the next client

**Discovery questions**
- How much of this work happens in a month, and who does it
- Which parts are judgement and which are the same every time
- What the output has to look like, and who signs it
- What they have already tried here, and why it stopped

**Roles** — partner: The domain expertise, the audit, the build and the client relationship · Lyzr: The platform, the templates to start from, and enablement for your team

### `review-then-deploy` — win

- **When** The constraint is the environment rather than the workflow: regulated, sovereign, on-premise, or an architecture that has to be signed off before anything is built.
- **First offer** {work} readiness review — 3 to 4 weeks, one {unit}, ends with what can run where, what the controls have to be, and a deployment plan their risk function can sign
- **Delivery** 10 to 12 week deployment on one {unit}, then infrastructure and support (1 solution architect + 1 infrastructure engineer + a compliance reviewer)
- **Expansion** A support and change contract on the environment, then the next workload into it

**Revenue streams**
- *implementation* — Readiness review, architecture, deployment into their environment, integration and commissioning
- *recurring* — Infrastructure management, monitoring, patching and user support on the deployed environment
- *expansion* — The next workload into the same environment, and a change contract as their estate grows

**Discovery questions**
- Where the data is allowed to live, and who decides that
- What their risk or audit function has already asked about AI
- Which environments are in scope, and who runs them
- What has to be true before a decision can run without a person

**Roles** — partner: The environment, the client's controls, the deployment and the ongoing support · Lyzr: The deployable platform, the governance layer and the architecture review

### `package-then-sell` — win

- **When** They have built much the same thing more than once for different clients. The question is whether it becomes a solution they sell into an industry rather than a project they re-quote every time.
- **First offer** {work} solution blueprint — 4 weeks, one reference {unit}, ends with a packaged solution with a fixed scope, a working demo and a price, ready to take to the next three clients
- **Delivery** 8 week build of the packaged version, then a deployment fee per client (1 product owner + 2 engineers, part time)
- **Expansion** Every new client deploys the same package, so the build is paid for once and each further {unit} is margin

**Revenue streams**
- *implementation* — The blueprint, then building the packaged version once: design, configuration, the integration points and the deployment method
- *recurring* — Running the package for each client who takes it, with support and release management
- *expansion* — Every new client deploys the same package, so each further {unit} is delivery rather than another build

**Discovery questions**
- How many clients have asked for this {work} in the last year
- What changed between the last two times you built it
- Which part of it is the same for every client, and which is not
- Who would buy it if it already existed and had a price

**Roles** — partner: The repeatable solution, the industry knowledge, the sales motion and the deployments · Lyzr: The platform it is packaged on, the templates, and joint go-to-market on the first clients

### `inventory-then-govern` — retain

- **When** The client already has AI running that nobody owns. The money is in the control layer over it, not in building more.
- **First offer** Agent estate assessment — 3 weeks, one {unit}, ends with an inventory of every agent and copilot running, what each one can reach, and a registry pilot
- **Delivery** 4 week discovery and registry, then an annual platform and advisory fee (1 governance consultant + 1 engineer)
- **Expansion** An annual platform fee plus a quarterly review covering new agents as they are added

**Revenue streams**
- *implementation* — Discovery across their agent estate, the registry, policy and control setup, and the platform rollout
- *recurring* — The platform itself, quarterly reviews, policy updates, and advisory as new agents are added
- *expansion* — New agents and new teams brought under the same registry, and the same review extended to the next estate

**Discovery questions**
- How many teams have deployed something, and on how many platforms
- Whether anyone owns AI risk formally, and who they report to
- What the audit or regulator has already asked for
- Which environments and data the running agents can reach

**Roles** — partner: The governance engagement, the risk relationship and the consultants who run it · Lyzr: OpenController for the registry and the controls, and the policy layer

### `take-over-and-run` — retain

- **When** Something is already live and fragile. The offer is to own it: monitoring, incidents, versions and a service level.
- **First offer** {work} operations review — 2 weeks, their current estate, ends with what is running, what is unmonitored, what has already broken, and a takeover plan
- **Delivery** Onboarding sprint to take it over, then a monthly fee per workload (1 engineer on call + 1 service manager)
- **Expansion** The monthly fee grows with each new workload that goes live

**Revenue streams**
- *implementation* — The operations review, the onboarding sprint, the runbooks, and taking the workloads over cleanly
- *recurring* — Running each workload, incident handling, tuning, reporting and user support
- *expansion* — Each new workload that goes live joins the same contract

**Discovery questions**
- What is running in production today, and who built it
- Who gets called when it fails, and what their hours are
- What has already gone wrong, and how they found out
- What a service level would have to cover for them to sign

**Roles** — partner: The support structure, the on-call rota and the client relationship · Lyzr: The platform, the observability and escalation into our engineering

### `roll-out-to-everyone` — expand

- **When** The client wants one capability in front of a whole workforce rather than one use case built well. The work is standing it up, agreeing what good looks like, and getting people to use it.
- **First offer** {work} pilot department — 4 weeks, one {unit}, ends with one department live with usage measured and an adoption plan for the rest
- **Delivery** 6 to 8 week rollout across the first wave, then a per seat fee to run and support it (1 delivery lead + 1 engineer + 1 adoption or change person)
- **Expansion** Each further {unit} joins the same deployment, so the cost is in adoption rather than in another build

**Revenue streams**
- *implementation* — The pilot on one {unit}, then rollout across the first wave: configuration, integration, training and launch
- *recurring* — Running and supporting the deployment, the adoption work, and changes as teams ask for them
- *expansion* — Each further {unit} joins the same deployment, so the work is adoption rather than another build

**Discovery questions**
- How many people would use this, and in which {unit} first
- What they use today for the same thing, approved or not
- Who owns employee tooling and can make it standard
- What has to be true before the policy team signs it off

**Roles** — partner: The rollout, the adoption programme, the integration into how people already work · Lyzr: The product, the governance underneath it, and support through the first wave

### `deploy-in-their-estate` — win

- **When** The client cannot send the work anywhere else. The engagement is installing and commissioning something inside their own environment and proving the first workload on it.
- **First offer** {work} deployment readiness review — 3 weeks, one {unit}, ends with a sited design, the prerequisites confirmed, and a commissioning plan with dates
- **Delivery** 8 to 12 week install and commissioning, then an annual operate and support contract (1 infrastructure architect + 1 engineer, with the client's platform team)
- **Expansion** Capacity grows with each further {unit} placed on the same footprint, under the same contract

**Revenue streams**
- *implementation* — Deployment readiness review, install, commissioning, integration and handover inside their own environment
- *recurring* — The operate and support contract on the footprint: monitoring, upgrades, capacity and user support
- *expansion* — Each further {unit} placed on the same footprint, under the same contract

**Discovery questions**
- Where it would physically sit, and who owns that space
- Which workload has to stay inside the estate, and why
- What the network and identity boundaries look like
- Who signs off a change inside that environment

**Roles** — partner: The siting, the installation, the integration into their estate and the local support · Lyzr: The appliance, the models and governance on it, and the engineering behind the commissioning

### `embed-and-license` — win

- **When** The partner ships software of their own. The work is putting a capability inside that product, under their brand, and selling it to the customers they already have.
- **First offer** {work} embedding assessment — 3 weeks, one {unit}, ends with the integration mapped against their architecture, and a first feature scoped against their roadmap
- **Delivery** 10 to 12 week integration into their product, then a licence that scales with their customers (1 product owner + 2 engineers from their own product team)
- **Expansion** Every customer of their product reaches the capability, so revenue follows their install base rather than their delivery hours

**Revenue streams**
- *implementation* — The embedding assessment, integration into their product, and the engineering to ship it to their customers
- *recurring* — Keeping the embedded capability current as their product and the models change, plus support
- *expansion* — Revenue follows their install base rather than your delivery hours, so every customer of their product reaches the capability

**Discovery questions**
- What their product does today and who pays for it
- Which {unit} the capability would land in first
- How their release cycle and their tenancy model work
- What they would have to build themselves instead, and how long it would take

**Roles** — partner: The product, the customers, the roadmap and the first line of support · Lyzr: The platform layer underneath, the tenancy and governance, and the engineering behind the integration

---

## 5. Lyzr record catalogue (104)

`data/catalog.json` — built by `scripts/build-catalog.js` from lyzr.ai. This is the evidence layer: what Lyzr has delivered, offers, or can do.

### delivered (61)

| Title | Industry | Client | Confidence |
|---|---|---|---|
| Global Professional Services Firm / Lyzr Case Study | Professional services | A Fortune 500 global professional services firm | high |
| Audience Intelligence Automation for a Multicultural Media Agency | Media and marketing strategy | An independent media and marketing strategy agency focused on multicultural audiences | high |
| $10B+ Global Advisory Firm / Lyzr Case Study | Professional services and advisory | One of the world's largest professional services firms | high |
| AI Analyst Research Automation / Lyzr Case Study | Industrial technology and infrastructure | A global leader in industrial technology and infrastructure with approximately $10B in annual revenue | high |
| $200 Mn+ Revenue Global Enterprise / Lyzr Case Study | consulting | a global growth and creative consulting firm | high |
| Global Payments & Commerce Platform / Lyzr Case Study | payments and commerce technology | A global leader in payment and commerce technology with 30M+ devices deployed across 150+ countries | high |
| Professional Services AI Innovation Evaluation Case Study / Lyzr AI | Professional services and consulting | A global professional services and consulting firm | high |
| Professional Services AI Value Pool Evaluation Case Study / Lyzr AI | professional services and consulting | a global professional services and consulting firm | high |
| Fortune Global 500 Insurance Brokerage Case Study / Lyzr AI | Insurance brokerage | One of the world's largest insurance brokerages | high |
| Media Planning Research Agent Built for a Global Advertising Group | advertising and marketing | a global advertising and marketing group | low |
| Digital Trust & Security Provider Automated Competitive Intelligence with Lyzr | Security and trust | A digital trust and security provider | high |
| Technology Services Firm Optimized Resource Allocation with Lyzr | technology services | a global technology services firm | low |
| AI-Powered Procurement Operating System Built for a Global Enterprise | cross-industry | A global enterprise | low |
| Global Enterprise Streamlined HR, Engineering & QA with Lyzr | cross-industry | a global enterprise operating across multiple time zones | high |
| Account Research Agent Built for a Global BPM Company | business process management | a global business-process management organization with a large sales team | high |
| First-Meeting Brief Agent for a 90-Person Sales Team | cross-industry | a 90-person sales organization | high |
| Lyzr Reduced Financial Model Preparation From 10 Hours to Under 5 Minutes | investment and advisory | A leading investment and advisory firm | high |
| Global Organization Scaled Crisis Simulations with Lyzr | Strategy and management consulting | A global strategy and workshop organization | high |
| Procurement Agentic OS Built for a Large-Scale Enterprise Client | cross-industry | a large-scale enterprise client operating procurement across multiple business units, categories, and regions | high |
| Lyzr Helped an Eyewear Brand Turn Online Shopping Into a Guided Buying Experience | eyewear retail | a leading direct-to-consumer eyewear brand | low |
| Yugabyte built an AI-driven GTM intelligence engine with Lyzr | software | a B2B software company | high |
| Global AI Infrastructure Leader Scaled Inbound SDR Operations | AI infrastructure | a global leader in AI infrastructure and accelerated computing | high |
| AI Customer Support Agent for a Leading Retail E-commerce Company | retail e-commerce | a leading retail company specializing in e-commerce operations | low |
| Multi-agent mentorship engine built for MentorCloud on AWS | Human Resources | MentorCloud, an enterprise mentorship platform | high |
| Movate Built an AI Pod for SDLC Automation with Lyzr | software engineering services | a global technology services and engineering firm | high |
| Automated Customer Onboarding for a Leading Japanese Bank | Financial services | One of Japan's largest financial institutions | high |
| Multi-Agent System Reimagines Customer Onboarding for a Global Bank | banking | a global financial institution with a strong digital footprint | low |
| Portfolio-wide AI SDR and Voice Agent system built for FTV Capital | investment and venture capital | A global growth equity firm investing in enterprise tech, fintech, and vertical software | high |
| Lyzr AI agent case study - Accenture ad generator | Marketing | A leading enterprise marketing team | high |
| Lyzr AI agent case study - Lion Medical AI | healthcare | a healthcare provider delivering diagnostic support across 16 medical specialties | high |
| AI-Powered Customer Support Agent for a Global Insurance Provider | insurance | a global insurance provider | high |
| AI-Powered Culture Code Agent for Accenture and Accubate | Enterprise services | Accenture, in partnership with Accubate | high |
| Lyzr AI agent case study - AI-Driven Email Triage | insurance | a global insurance provider | high |
| World's First Agentic CVC Platform Built for a Corporate Venture Team | venture capital | a leading corporate venture team | high |
| Lyzr AI agent case study - eMudhra | Digital signature and authentication | eMudhra, a digital signature and e-signature solutions provider | high |
| AI-Powered Customer Support Agent for a Leading Insurance Provider | insurance | A global insurance provider | high |
| AI Coding Agent for Saksoft to accelerate code retrieval and delivery | software and services | a global digital transformation company specializing in enterprise solutions, data management, and cloud modernization | high |
| AI Resource Optimization Agent for SNS Global | technology services | a technology solutions provider | high |
| Lyzr AI agent case study - Novitium | sales enablement software | an AI-first sales enablement company | high |
| AI-Powered Startup Onboarding Platform Built for Accenture Accubate | professional services | Accenture, a global professional services company | high |
| Multi-agent HR, coding, and QA automation for Saksoft | IT services | a global IT services company with over 1,300 employees across 20 countries | high |
| AI Voice and CRM Outreach Agents for Altrius Advisors | Health insurance advisory | A leading health insurance advisory firm | high |
| Lyzr AI agent case study - Move | airline travel | a leading low-cost airline serving over 165 destinations across Asia and beyond | high |
| Lyzr AI agent case study - Artha99 | investment and research | a thematic investment firm focused on India's manufacturing-led growth | low |
| HFS Research builds multi-agent reasoning system for complex queries | Research and Analytics | HFS Research, a leading global analyst firm | high |
| AI-Powered Interview Evaluation Agent for Curatal | recruitment technology | Curatal, an AI-powered hiring platform | high |
| Policy Coverage Review Assistant built for Yardstick (RegTech) | regulatory technology | Yardstick, a RegTech initiative backed by FinPACT | high |
| AI-Powered Chat Support Agent Built for Witzeal | gaming technology | Witzeal, a leading gaming technology company | high |
| Lyzr AI agent case study - Accenture | industrial AI solutions | a top industrial AI solutions provider | low |
| AI Multi-Agent Invoice Automation Built for NPD Powered | energy solutions | NPD Powered, a leading innovator in energy solutions | high |
| AI-Driven Refund System for a Midsize Bank | financial services | a midsize bank | high |
| Regulatory Compliance Multi-Agent System Built for a Large Bank | financial services | a large bank offering a full spectrum of financial services | high |
| AI Coaching Agents for Psychometric Insights, Built for SurePeople | human resources technology | a global provider of intelligent learning and talent performance solutions | high |
| AI Meeting Translation and Note-Taking Agent Built for Nelson Global | manufacturing | Nelson Global, a global leader in manufacturing clean, efficient sub-systems for agriculture, construction, and power generation | high |
| Accenture: why it invested in Lyzr for banking and insurance | banking and insurance | Accenture | low |
| AI Work-Order Agent Built for Dairyland Power | Energy utilities | A leading energy cooperative | high |
| AI-Powered Incident Prediction and Change Management for NTT Data | digital services and IT | NTT Data, a global digital business and IT services leader | high |
| How our own agent, SivaClaw, ran investor relations | software | Lyzr, a software company | high |
| $4.3B Telecom Infrastructure Leader / Lyzr Case Study | wireless communications infrastructure | A global leader in wireless infrastructure, ~$4.3B annual revenue | high |
| AI Agent Governance Control Plane for a Fortune 50 CPG Company | CPG: beverages and convenient foods | A Fortune 50 CPG company | high |
| Fortune 500 Global Professional Services Case Study / Lyzr AI | Professional services | A Fortune 500 global professional services firm | high |

### capability (18)

| Title | Industry | Client | Confidence |
|---|---|---|---|
| Lyzr and Accenture: what we build together | cross-industry |  | high |
| Agentic OS overview |  |  | low |
| Lyzr Optimus overview | cross-industry |  | low |
| Responsible AI overview |  |  | low |
| Lyzr Nitro overview |  |  | high |
| OpenController overview |  |  | high |
| Orchestration as a Service overview |  |  | low |
| Agents as a Service overview | cross-industry |  | low |
| Hallucination Manager overview |  |  | high |
| Knowledge Base overview |  |  | high |
| Knowledge Graph overview |  |  | high |
| AI Agent Memory overview |  |  | high |
| OpenGAP overview |  |  | high |
| GitAgent overview |  |  | high |
| Docs & API overview |  |  | low |
| Madison overview | banking |  | low |
| Madison GRC overview | banking |  | high |
| Agent Blocks overview |  |  | high |

### offer (25)

| Title | Industry | Client | Confidence |
|---|---|---|---|
| E-commerce: what we do | e-commerce |  | low |
| Benjie: agents for Insurance | insurance |  | high |
| Healthcare: what we do | Healthcare |  | high |
| Jazon: agents for Revenue |  |  | high |
| Government: what we do | government |  | low |
| Fintech: what we do | fintech |  | low |
| Skott: agents for Marketing | cross-industry |  | low |
| Jeff: agents for Customer Service | cross-industry |  | high |
| Diane: agents for Human Resources | human resources |  | high |
| Compliance & Governance: what we do | cross-industry |  | high |
| Legal: what we do |  |  | high |
| Procurement: what we do |  |  | high |
| IT & Platform: what we do |  |  | low |
| Revenue & Sales: what we do | cross-industry |  | high |
| CIO: what we do | cross-industry |  | high |
| AI & Automation: what we do | cross-industry |  | high |
| CTO: what we do |  |  | high |
| Digital Transformation: what we do |  |  | low |
| CEO: what we do | cross-industry |  | high |
| Managing Director: what we do |  |  | low |
| Head of AI: what we do |  |  | high |
| IT operations: what we do | it operations |  | high |
| Private equity & VC: what we do | private equity |  | high |
| Dwight, AI RFP Scout: what we do | cross-industry |  | high |
| Kathy, AI competitor analyst: what we do | cross-industry |  | low |

---

## 6. Resources (174)

`data/resources.json`. Shelved See it / Build it / Sell it at runtime by `lib/resources.js`, not stored.

| Title | Type | URL |
|---|---|---|
| Audience Intelligence Automation for a Multicultural Media Agency | case_study | https://www.lyzr.ai/case-studies/multicultural-audience-intelligence/ |
| AI Analyst Research Automation / Lyzr Case Study | case_study | https://www.lyzr.ai/case-studies/analyst-database-intelligence/ |
| Global Professional Services Firm / Lyzr Case Study | case_study | https://www.lyzr.ai/case-studies/innovation-idea-evaluation/ |
| $10B+ Global Advisory Firm / Lyzr Case Study | case_study | https://www.lyzr.ai/case-studies/agentic-procurement/ |
| AI Campaign Photography Pipeline Built for a Global Premium Automaker | case_study | https://www.lyzr.ai/case-studies/campaign-photography-automation/ |
| $4.3B Telecom Infrastructure Leader / Lyzr Case Study | case_study | https://www.lyzr.ai/case-studies/telecom-order-automation/ |
| Global Payments & Commerce Platform / Lyzr Case Study | case_study | https://www.lyzr.ai/case-studies/payments-support-automation/ |
| AI Agent Governance Control Plane for a Fortune 50 CPG Company | case_study | https://www.lyzr.ai/case-studies/cpg-ai-governance/ |
| Fortune 500 Global Professional Services Case Study / Lyzr AI | case_study | https://www.lyzr.ai/case-studies/venture-screening/ |
| $200 Mn+ Revenue Global Enterprise / Lyzr Case Study | case_study | https://www.lyzr.ai/case-studies/enterprise-ai-governance/ |
| Fortune Global 500 Insurance Brokerage Case Study / Lyzr AI | case_study | https://www.lyzr.ai/case-studies/insurance-billing/ |
| Professional Services AI Innovation Evaluation Case Study / Lyzr AI | case_study | https://www.lyzr.ai/case-studies/professional-services-innovation-evaluation/ |
| Professional Services AI Value Pool Evaluation Case Study / Lyzr AI | case_study | https://www.lyzr.ai/case-studies/case-studies-professional-services-value-pool-evaluation/ |
| Digital Trust & Security Provider Automated Competitive Intelligence with Lyzr | case_study | https://www.lyzr.ai/case-studies/competitive-intelligence-digital-trust/ |
| Media Planning Research Agent Built for a Global Advertising Group | case_study | https://www.lyzr.ai/case-studies/global-advertising-media-planning/ |
| Global Enterprise Streamlined HR, Engineering & QA with Lyzr | case_study | https://www.lyzr.ai/case-studies/global-enterprise-streamlined-hr-engineering-qa-with-lyzr/ |
| AI-Powered Procurement Operating System Built for a Global Enterprise | case_study | https://www.lyzr.ai/case-studies/how-a-global-enterprise-built-an-ai-powered-procurement-operating-system-with-lyzr/ |
| Technology Services Firm Optimized Resource Allocation with Lyzr | case_study | https://www.lyzr.ai/case-studies/how-a-technology-services-firm-optimized-resource-allocation-with-lyzr/ |
| Account Research Agent Built for a Global BPM Company | case_study | https://www.lyzr.ai/case-studies/how-a-global-bpm-company-standardized-account-research-with-lyzr/ |
| First-Meeting Brief Agent for a 90-Person Sales Team | case_study | https://www.lyzr.ai/case-studies/how-a-90-person-sales-team-standardized-meeting-readiness-with-lyzr/ |
| Global Organization Scaled Crisis Simulations with Lyzr | case_study | https://www.lyzr.ai/case-studies/global-organization-scaled-crisis-simulations-with-lyzr/ |
| Procurement Agentic OS Built for a Large-Scale Enterprise Client | case_study | https://www.lyzr.ai/case-studies/how-a-large-scale-enterprise-client-built-a-procurement-agentic-os-with-lyzr/ |
| Lyzr Reduced Financial Model Preparation From 10 Hours to Under 5 Minutes | case_study | https://www.lyzr.ai/case-studies/how-lyzr-reduced-financial-model-preparation-from-10-hours-to-under-5-minutes/ |
| Yugabyte built an AI-driven GTM intelligence engine with Lyzr | case_study | https://www.lyzr.ai/case-studies/yugabyte-built-an-ai-driven-gtm-intelligence-engine-with-lyzr/ |
| Lyzr Helped an Eyewear Brand Turn Online Shopping Into a Guided Buying Experience | case_study | https://www.lyzr.ai/case-studies/how-lyzr-helped-an-eyewear-brand-turn-online-shopping-into-a-guided-buying-experience/ |
| Global AI Infrastructure Leader Scaled Inbound SDR Operations | case_study | https://www.lyzr.ai/case-studies/global-infrastructure-leader-scaled-inbound-sdr-operations/ |
| AI Customer Support Agent for a Leading Retail E-commerce Company | case_study | https://www.lyzr.ai/case-studies/leading-retail-company-re-imagined-customer-support/ |
| Multi-agent mentorship engine built for MentorCloud on AWS | case_study | https://www.lyzr.ai/case-studies/mentorcloud/ |
| Movate Built an AI Pod for SDLC Automation with Lyzr | case_study | https://www.lyzr.ai/case-studies/movate/ |
| Portfolio-wide AI SDR and Voice Agent system built for FTV Capital | case_study | https://www.lyzr.ai/case-studies/ftv-capital/ |
| Automated Customer Onboarding for a Leading Japanese Bank | case_study | https://www.lyzr.ai/case-studies/japanese-bank-automated-customer-onboarding/ |
| Multi-Agent System Reimagines Customer Onboarding for a Global Bank | case_study | https://www.lyzr.ai/case-studies/global-bank-reimagined-customer-experience/ |
| Lyzr AI agent case study - Accenture ad generator | case_study | https://www.lyzr.ai/case-studies/accenture-ad-generator/ |
| Lyzr AI agent case study - Lion Medical AI | case_study | https://www.lyzr.ai/case-studies/lion-medical-ai/ |
| AI-Powered Culture Code Agent for Accenture and Accubate | case_study | https://www.lyzr.ai/case-studies/culture-code-agent/ |
| AI-Powered Customer Support Agent for a Global Insurance Provider | case_study | https://www.lyzr.ai/case-studies/ai-powered-customer-support/ |
| Lyzr AI agent case study - AI-Driven Email Triage | case_study | https://www.lyzr.ai/case-studies/ai-driven-email-triage/ |
| World's First Agentic CVC Platform Built for a Corporate Venture Team | case_study | https://www.lyzr.ai/case-studies/agentic-cvc/ |
| Lyzr AI agent case study - eMudhra | case_study | https://www.lyzr.ai/case-studies/emudhra/ |
| AI-Powered Customer Support Agent for a Leading Insurance Provider | case_study | https://www.lyzr.ai/case-studies/leading-support-agent/ |
| Lyzr AI agent case study - Novitium | case_study | https://www.lyzr.ai/case-studies/novitium/ |
| AI Resource Optimization Agent for SNS Global | case_study | https://www.lyzr.ai/case-studies/sns-global/ |
| AI Coding Agent for Saksoft to accelerate code retrieval and delivery | case_study | https://www.lyzr.ai/case-studies/saksoft-code/ |
| AI-Powered Startup Onboarding Platform Built for Accenture Accubate | case_study | https://www.lyzr.ai/case-studies/accenture-accubate/ |
| Multi-agent HR, coding, and QA automation for Saksoft | case_study | https://www.lyzr.ai/case-studies/saksoft/ |
| AI Voice and CRM Outreach Agents for Altrius Advisors | case_study | https://www.lyzr.ai/case-studies/altrius/ |
| Lyzr AI agent case study - Move | case_study | https://www.lyzr.ai/case-studies/move/ |
| HFS Research builds multi-agent reasoning system for complex queries | case_study | https://www.lyzr.ai/case-studies/hfs-research/ |
| Lyzr AI agent case study - Artha99 | case_study | https://www.lyzr.ai/case-studies/artha99/ |
| AI-Powered Interview Evaluation Agent for Curatal | case_study | https://www.lyzr.ai/case-studies/curatal/ |
| Policy Coverage Review Assistant built for Yardstick (RegTech) | case_study | https://www.lyzr.ai/case-studies/yardstick/ |
| AI-Powered Chat Support Agent Built for Witzeal | case_study | https://www.lyzr.ai/case-studies/witzeal/ |
| Lyzr AI agent case study - Accenture | case_study | https://www.lyzr.ai/case-studies/accenture/ |
| AI-Driven Refund System for a Midsize Bank | case_study | https://www.lyzr.ai/case-studies/rising-financial-provider/ |
| Regulatory Compliance Multi-Agent System Built for a Large Bank | case_study | https://www.lyzr.ai/case-studies/major-banking-institution/ |
| AI Multi-Agent Invoice Automation Built for NPD Powered | case_study | https://www.lyzr.ai/case-studies/customer-service-leader/ |
| AI Coaching Agents for Psychometric Insights, Built for SurePeople | case_study | https://www.lyzr.ai/case-studies/hr-workforce-leader/ |
| AI Meeting Translation and Note-Taking Agent Built for Nelson Global | case_study | https://www.lyzr.ai/case-studies/industrial-manufacturing-firm/ |
| AI-Powered Incident Prediction and Change Management for NTT Data | case_study | https://www.lyzr.ai/case-studies/ntt-data/ |
| AI Work-Order Agent Built for Dairyland Power | case_study | https://www.lyzr.ai/case-studies/leading-energy-provider/ |
| Find the right agent (2 min) | tool | https://www.lyzr.ai/assessment/agent-finder-tool/ |
| Take the enterprise AI assessment | tool | https://www.lyzr.ai/ai-enterprise-platform-assessment |
| Check your agentic AI maturity | tool | https://www.lyzr.ai/assessment/agentic-ai-maturity-assessment-for-enterprises/ |
| Assess your AI governance | tool | https://www.lyzr.ai/assessment/agent-governance-maturity-assessment/ |
| Audit your agent sprawl | tool | https://www.lyzr.ai/assessment/ai-agent-sprawl-audit/ |
| Test your hallucination risk | tool | https://www.lyzr.ai/assessment/hallucination-risk-assessment/ |
| Evaluate an agent for production | tool | https://www.lyzr.ai/assessment/production-agent-evaluation-assessment/ |
| Agentic OS readiness for marketing | tool | https://www.lyzr.ai/assessment/agentic-os-readiness-assessment-for-marketing/ |
| Playbook: agents to production | playbook | https://www.lyzr.ai/playbook/how-to-take-agents-to-production/ |
| Playbook: your agentic AI roadmap | playbook | https://www.lyzr.ai/playbook/agentic-ai-roadmap/ |
| Playbook: become an agentic leader | playbook | https://www.lyzr.ai/playbook/become-an-agentic-leader/ |
| CIO's guide to agent governance | playbook | https://www.lyzr.ai/playbook/the-cio-guide-to-ai-agent-governance/ |
| Banking AI playbook | playbook | https://www.lyzr.ai/playbook/banking/ |
| BFSI dispute resolution guide | playbook | https://www.lyzr.ai/playbook/bfsi-guide-to-dispute-management/ |
| HR agents playbook | playbook | https://www.lyzr.ai/playbook/hr/ |
| AI performance management guide | playbook | https://www.lyzr.ai/playbook/performance-management/ |
| Marketing agents playbook | playbook | https://www.lyzr.ai/playbook/marketing/ |
| AI content playbook | playbook | https://www.lyzr.ai/playbook/content/ |
| Sales agents playbook | playbook | https://www.lyzr.ai/playbook/sales/ |
| Procurement automation: 90-day guide | playbook | https://www.lyzr.ai/playbook/the-strategic-procurement-automation-playbook/ |
| Analyst Army starter pack | playbook | https://www.lyzr.ai/playbook/analyst-army-starter-pack/ |
| Fundraising agent playbook | playbook | https://www.lyzr.ai/playbook/the-fundraising-agent/ |
| How to build a $10M AI practice | playbook | https://www.lyzr.ai/playbook/how-to-build-a-10m-ai-practice/ |
| The Agentforce alternative playbook | playbook | https://www.lyzr.ai/playbook/agentforce-alternative/ |
| 100+ reasons to quit ChatGPT Enterprise | playbook | https://www.lyzr.ai/playbook/100-reasons-not-to-use-chatgpt-for-enterprise/ |
| Enterprise AI buyer's guide | playbook | https://www.lyzr.ai/playbook/the-chatgpt-enterprise-reality-checklist/ |
| 101 enterprise agent use cases | guide | https://www.lyzr.ai/template/101-ai-use-cases/ |
| 50 workflow automation ideas | guide | https://www.lyzr.ai/template/top-50-workflow-automation-ideas/ |
| 16 banking agent use cases | guide | https://www.lyzr.ai/template/banking-ai-use-cases/ |
| 100+ insurance agent use cases | guide | https://www.lyzr.ai/template/insurance-ai-agents-use-cases/ |
| 140+ healthcare use cases | guide | https://www.lyzr.ai/template/140-agentic-use-cases-for-healthcare/ |
| 100+ retail agent use cases | guide | https://www.lyzr.ai/template/100-retail-agent-use-cases/ |
| 100+ agents for finance + ROI calculator | guide | https://www.lyzr.ai/template/100-use-cases-for-cfos/ |
| Use cases for legal teams | guide | https://www.lyzr.ai/template/100-use-cases-for-legal-teams/ |
| 23 HR agents every CHRO should know | guide | https://www.lyzr.ai/template/ai-agents-use-cases-for-hr/ |
| HR savings calculator | guide | https://www.lyzr.ai/template/hr-tax-savings-calculator/ |
| Performance management ROI calculator | guide | https://www.lyzr.ai/template/performance-roi-calculator/ |
| 12 marketing agent use cases | guide | https://www.lyzr.ai/template/ai-marketing-agent-use-cases/ |
| Marketing handbook | guide | https://www.lyzr.ai/template/marketing-handbook/ |
| 12 sales agent use cases | guide | https://www.lyzr.ai/template/ai-sales-agents-use-cases/ |
| 50+ AI automations for sales | guide | https://www.lyzr.ai/template/50-ai-automation-tools-for-sales/ |
| 50+ cold email templates | guide | https://www.lyzr.ai/template/50-killer-cold-email-templates/ |
| 108 support use cases + ROI calculator | guide | https://www.lyzr.ai/template/customer-support-use-cases/ |
| 90-day procurement agent pilot | guide | https://www.lyzr.ai/template/the-90-day-pilot-for-procurement-agent-deployment/ |
| 100+ analyst use cases + scorecard | guide | https://www.lyzr.ai/template/100-use-cases-for-analyst-scorecard/ |
| 100+ use cases for dev shops | guide | https://www.lyzr.ai/template/100-use-cases-for-dev-shops/ |
| Agent use cases for AI consultants | guide | https://www.lyzr.ai/template/agent-use-cases-for-ai-consultants/ |
| 50+ automations for product managers | guide | https://www.lyzr.ai/template/50-ai-automations-for-product-managers/ |
| 50+ automations for data scientists | guide | https://www.lyzr.ai/template/50-ai-automations-for-data-scientists/ |
| Architect use cases | guide | https://www.lyzr.ai/template/architect-agent-usecases/ |
| Shadow AI discovery checklist | guide | https://www.lyzr.ai/template/shadow-ai-discovery-checklist/ |
| White paper: governing the agent estate | report | https://www.lyzr.ai/white-paper/the-enterprise-agent-estate-is-the-next-infrastructure-decision/ |
| White paper: pilot to production | report | https://www.lyzr.ai/white-paper/the-measurement-gap-between-ai-pilots-and-production-deployments/ |
| White paper: the shadow agent crisis | report | https://www.lyzr.ai/white-paper/the-shadow-agent-crisis/ |
| Become a forward-deployed engineer | program | https://fdecollective.com/ |
| Benjie: agents for Insurance | solution_page | https://www.lyzr.ai/insurance-ai-agent-benjie/ |
| Government: what we do | solution_page | https://www.lyzr.ai/government/ |
| Healthcare: what we do | solution_page | https://www.lyzr.ai/healthcare-agents/ |
| Fintech: what we do | solution_page | https://www.lyzr.ai/fintech/ |
| E-commerce: what we do | solution_page | https://www.lyzr.ai/ecommerce-agents/ |
| Jazon: agents for Revenue | solution_page | https://www.lyzr.ai/jazon/ |
| Skott: agents for Marketing | solution_page | https://www.lyzr.ai/skott/ |
| Jeff: agents for Customer Service | solution_page | https://www.lyzr.ai/jeff/ |
| Diane: agents for Human Resources | solution_page | https://www.lyzr.ai/diane/ |
| Procurement: what we do | solution_page | https://www.lyzr.ai/procurement/ |
| Legal: what we do | solution_page | https://www.lyzr.ai/legal-industry/ |
| Compliance & Governance: what we do | solution_page | https://www.lyzr.ai/teams/compliance-teams/ |
| AI & Automation: what we do | solution_page | https://www.lyzr.ai/teams/ai-and-automation-teams/ |
| Revenue & Sales: what we do | solution_page | https://www.lyzr.ai/teams/revenue-and-sales-team/ |
| IT & Platform: what we do | solution_page | https://www.lyzr.ai/teams/platform-teams/ |
| Digital Transformation: what we do | solution_page | https://www.lyzr.ai/teams/digital-transformation-teams/ |
| CIO: what we do | solution_page | https://www.lyzr.ai/roles/cio/ |
| CTO: what we do | solution_page | https://www.lyzr.ai/roles/cto/ |
| CEO: what we do | solution_page | https://www.lyzr.ai/roles/ceo/ |
| Managing Director: what we do | solution_page | https://www.lyzr.ai/roles/md/ |
| Head of AI: what we do | solution_page | https://www.lyzr.ai/roles/heads-of-ai/ |
| Agent Studio overview | product_page | https://studio.lyzr.ai/ |
| Architect overview | product_page | https://architect.new/ |
| OpenController overview | product_page | https://www.lyzr.ai/opencontroller/ |
| Agentic OS overview | product_page | https://www.lyzr.ai/agentic-os/ |
| Sovereign AI overview | product_page | https://www.lyzr.ai/sovereign-ai/ |
| Lyzr Nitro overview | product_page | https://www.lyzr.ai/partners/google/ |
| Lyzr Optimus overview | product_page | https://optimus.lyzr-ai.com/ |
| Responsible AI overview | product_page | https://www.lyzr.ai/responsible-ai-as-a-service/ |
| Orchestration as a Service overview | product_page | https://www.lyzr.ai/orchestration-as-a-service/ |
| Agents as a Service overview | product_page | https://www.lyzr.ai/agents-as-a-service/ |
| Hallucination Manager overview | product_page | https://www.lyzr.ai/hallucination-manager-as-a-service/ |
| Knowledge Base overview | product_page | https://www.lyzr.ai/knowledge-base-as-a-service/ |
| Knowledge Graph overview | product_page | https://www.lyzr.ai/knowledge-graph-as-a-service/ |
| AI Agent Memory overview | product_page | https://www.lyzr.ai/cognis/ |
| OpenGAP overview | product_page | https://www.lyzr.ai/oss/opengap/ |
| GitAgent overview | product_page | https://www.lyzr.ai/oss/gitagent/ |
| Docs & API overview | product_page | https://docs.lyzr.ai/enterprise/get-started/intro |
| Private equity & VC: what we do | solution_page | https://www.lyzr.ai/private-equity/ |
| IT operations: what we do | solution_page | https://www.lyzr.ai/it-operations/ |
| Madison overview | product_page | https://madison.lyzr-ai.com/ |
| Madison GRC overview | product_page | https://www.madison.lyzr.ai/ |
| Agent Blocks overview | product_page | https://www.lyzr.ai/agentblocks/ |
| Dwight, AI RFP Scout: what we do | solution_page | https://www.lyzr.ai/dwight-ai-rfp-scout/ |
| Kathy, AI competitor analyst: what we do | solution_page | https://www.lyzr.ai/kathy/ |
| How Lyzr works with Microsoft Azure | partner_page | https://www.lyzr.ai/partners/microsoft/ |
| How Lyzr works with AWS | partner_page | https://www.lyzr.ai/partners/aws/ |
| Partnering with Lyzr as a consulting firm | partner_page | https://www.lyzr.ai/gsi-si/ |
| Reselling and building on Lyzr | partner_page | https://www.lyzr.ai/partners/ |
| Our security and compliance | trust | https://security.lyzr.ai/ |
| How our own agent, SivaClaw, ran investor relations | story | https://www.lyzr.ai/webinar/how-we-generated-400m-interest-for-our-series-b-funding/ |
| YourStory: our $8M Series A, led by Rocketship | story | https://yourstory.com/ai-story/ai-firm-lyzr-series-a-funding-rocketship |
| Accenture: why it invested in Lyzr for banking and insurance | story | https://newsroom.accenture.com/news/2025/accenture-invests-in-lyzr-to-bring-agentic-ai-to-banking-and-insurance-companies |
| Lyzr and Accenture: what we build together | story | https://www.lyzr.ai/lyzr-and-accenture/ |
| Who we are and how we work with enterprises | story | https://www.lyzr.ai/about-us/ |
| What customers say about us | story | https://www.lyzr.ai/wall-of-love/ |
| How analysts rate us | story | https://www.lyzr.ai/lyzr-analyst-recognition/ |
| Teams running Lyzr agents in production | story | https://www.lyzr.ai/customers/ |
| Every case study, newest first | story | https://www.lyzr.ai/case-studies/ |

---

## 7. Other files in `data/`

| File | What it is |
|---|---|
| `brief-template.json` | The fixed scaffold of the brief. Every partner gets these words. |
| `products.json` | Platform/agent names used for "what you could demo". |
| `proof.json` | Proof points kept separately from the catalogue. |
| `landing-copy.json` | Patch list applied to the landing page. |
