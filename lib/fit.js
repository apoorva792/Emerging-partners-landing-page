/* Whether a catalogue record may appear on a given card, and in what role.
 *
 * Word overlap was never enough. "Agents monitor claims as they arrive, cross-referencing
 * behavioural patterns" and "agents read demand signals and suggest purchase orders" share
 * plenty of vocabulary and nothing else: one is insurance fraud detection, the other is
 * supply chain forecasting. A Fortude brief went out with the first printed as the
 * mechanism of the second.
 *
 * So a record is tested on three axes instead:
 *
 *   process  what kind of work it is: testing, forecasting, incident handling, governance
 *   domain   whose business it is: insurance, telecom, manufacturing, healthcare
 *   systems  what it runs inside: Infor, Jira, SAP, ServiceNow
 *
 * A match on words with a mismatch on any of these is not a match. And the roles are not
 * equal: explaining how something works, proving an outcome and demonstrating a capability
 * are three different claims, and the third is the strongest. */

import { termSet } from './words.js';

/* What kind of work it is. Deliberately a small, blunt vocabulary: the point is to tell
 * forecasting apart from claims processing, not to build a taxonomy of everything. */
export const PROCESS = {
  testing: /\b(regression|test(ing|s|case|cases|suite|suites|script|scripts)?|qa|quality assurance|defect|defects|bug|bugs|release cycle|impact analysis|uat)\b/i,
  forecasting: /\b(forecast\w*|demand plan\w*|replenish\w*|inventory|stockout|safety stock|planning cycle|purchase order suggestion\w*)\b/i,
  ordering: /\b(order (capture|processing|entry|management|validation)|purchase order|sales order|invoice\w*|three.way match|procure\w*|supplier\w*|sourcing|requisition\w*|edi)\b/i,
  incident: /\b(incident\w*|ticket\w*|service desk|help ?desk|outage|alert\w*|remediat\w*|vulnerabilit\w*|triage|escalat\w*|sla)\b/i,
  analytics: /\b(dashboard\w*|report\w*|kpi\w*|analytic\w*|natural language quer\w*|q&a|data warehouse|lakehouse|bi\b|insight\w*|metric\w*)\b/i,
  documents: /\b(document (extraction|processing|review)|ocr|contract review|intake|underwrit\w*|extraction|unstructured)\b/i,
  governance: /\b(governance|audit trail\w*|observabilit\w*|polic\w*|compliance|control plane|registry|guardrail\w*|lineage|entitlement\w*)\b/i,
  outreach: /\b(outbound|sdr|prospect\w*|lead gen\w*|campaign\w*|email sequence|meeting\w* booked|crm outreach|pipeline generation)\b/i,
  support: /\b(customer (support|service)|chatbot|csat|first response|self.service|resolution time|contact cent\w*)\b/i,
  people: /\b(recruit\w*|candidate\w*|onboard\w*|offboard\w*|employee\w*|payroll|attrition|mentor\w*|people ops|hr)\b/i,
  engineering: /\b(code (generation|review|retrieval|search)|repositor\w*|pull request\w*|ci\/cd|sdlc|developer\w*|merge|commit\w*)\b/i,
  integration: /\b(integration\w*|middleware|api |file transfer|mft|data pipeline\w*|etl|ingest\w*|connector\w*|migration)\b/i,
  claims: /\b(claim|claims|fraud|adjuster\w*|loss ratio|subrogation|policy servicing)\b/i,
  lending: /\b(loan\w*|lending|credit (decision|risk)|kyc|aml|mortgage|underwriting decision)\b/i,
  /* Three more, for work that is about where something runs or who ships it rather than
   * about a business process. Without these an appliance deployment and an OEM embedding
   * classify as nothing, and a record that classifies as nothing travels everywhere. */
  workspace: /\b(workforce|employee experience|digital workplace|adoption|every employee|per seat|intranet|collaboration|coworker|co-worker)\b/i,
  infrastructure: /\b(on.premise|on premises|data cent(re|er)|private cloud|air.?gap\w*|sovereign\w*|residency|appliance|bare metal|colocation|hardware|cluster\w*|landing zone)\b/i,
  embedding: /\b(white.?label\w*|oem|embed\w*|sdk\w*|multi.?tenan\w*|tenant isolation|licen[cs]\w*|resell\w*|their own product|platform vendor)\b/i,
};

/* Whose business it is. A record that asserts one of these is about that industry, and
 * putting it in front of a partner serving a different one is the error this exists to
 * catch. Only strong markers: "operations" is not a domain. */
export const DOMAIN = {
  insurance: /\b(insurance|insurer\w*|claims adjust\w*|underwrit\w*|policy servicing|actuarial|policyholder\w*)\b/i,
  banking: /\b(bank|banks|banking|lending|loan\w*|credit union|fintech|kyc|aml|wealth management)\b/i,
  telecom: /\b(telecom\w*|telco|network operator|subscriber\w*|mobile operator|bss\b|oss\b)\b/i,
  healthcare: /\b(patient\w*|clinical|hospital\w*|provider network|payer\w*|ehr|emr|life sciences|pharma\w*)\b/i,
  retail: /\b(retail\w*|ecommerce|e-commerce|merchandis\w*|storefront\w*|point of sale|shopper\w*)\b/i,
  manufacturing: /\b(manufactur\w*|plant\w*|factory|factories|production line|shop floor|bill of materials|mrp)\b/i,
  logistics: /\b(supply chain|logistics|warehous\w*|distribut\w*|freight|shipment\w*|fulfilment|fulfillment)\b/i,
  education: /\b(student\w*|learner\w*|curriculum|university|universities|edtech|course\w*)\b/i,
  legal: /\b(legal|litigation|counsel|contract lifecycle|paralegal)\b/i,
  publicsector: /\b(government|public sector|citizen\w*|municipal\w*|agency procurement)\b/i,
};

/* The thing a workflow acts on. Process families are too coarse for this: order
 * validation and invoice reconciliation are both `ordering`, and a card that starts on
 * orders and ends on invoices is describing two services. The object is what stays
 * constant across a card that holds together, so it is what we check across its sections. */
const OBJECTS = {
  order: /\b(purchase order\w*|sales order\w*|customer order\w*|order line\w*|orders?)\b/i,
  invoice: /\b(invoice\w*|accounts payable|remittance\w*|reconcil\w*|credit note\w*|statement\w*)\b/i,
  ticket: /\b(ticket\w*|incident\w*|service request\w*|case file\w*)\b/i,
  claim: /\b(claims?)\b/i,
  test: /\b(test\w*|regression suite\w*|release cycle\w*|qa cycle\w*|defect\w*)\b/i,
  agent_estate: /\b(agent estate|agent fleet|agent registry|agent inventory|shadow agent\w*)\b/i,
  /* Not a bare "form": "forms part of" is not a document. */
  document: /\b(documents?|contracts?|(application|claim|order|intake) forms?|attachments?|paperwork)\b/i,
  report: /\b(dashboards?|reports?|kpis?|metrics?|quer(y|ies))\b/i,
  supplier: /\b(suppliers?|vendors?|trading partners?)\b/i,
  employee: /\b(employees?|staff|workforce|colleagues?|headcount)\b/i,
  candidate: /\b(candidates?|applicants?|r[ée]sum[ée]s?)\b/i,
  /* "Lead time" is supply chain and "leads to" is English, so neither counts. */
  lead: /\b(sales leads?|inbound leads?|lead generation|lead gen|prospects?|sales pipeline|leads(?! to\b)(?! time\b))\b/i,
  shipment: /\b(shipments?|consignments?|freight|deliver(y|ies))\b/i,
  inventory: /\b(inventory|stock levels?|replenish\w*|demand plan\w*|forecasts?)\b/i,
  work_order: /\b(work orders?|job cards?|maintenance orders?|dispatch\w*)\b/i,
  payment: /\b(payments?|settlements?|payouts?|disbursement\w*)\b/i,
};

/* Named systems. A step that says "ingested Jira, GitHub and TestRail" describes work
 * inside a toolchain, and a client who runs Infor CloudSuite does not have one. */
/* Grouped, because the question is never "is it the same product" but "is it the same
 * kind of place". An engagement inside SAP transfers to a client running Infor: both are
 * the ERP a business runs on, and the work is recognisably the same work. An engagement
 * inside Jira, GitHub and TestRail does not, because that is a software team's toolchain
 * and an ERP client does not have one. */
const SYSTEMS = {
  erp: /\b(SAP|S\/4|HANA|BTP|Ariba|SuccessFactors|NetSuite|Dynamics|Business Central|Oracle|EBS|Infor|CloudSuite|M3|Epicor|PeopleSoft|Workday)\b/i,
  itsm: /\b(ServiceNow|Zendesk|Freshservice|Remedy)\b/i,
  devtools: /\b(Jira|Confluence|GitHub|GitLab|Bitbucket|TestRail|Rally|SonarQube|Jenkins|SharePoint)\b/i,
  data: /\b(Snowflake|Databricks|Redshift|BigQuery|Fabric|Informatica|Kafka|Synapse)\b/i,
  cloud: /\b(AWS|Bedrock|SageMaker|Azure|GCP|Kubernetes|Terraform|OpenAI|Anthropic|Vertex)\b/i,
  middleware: /\b(MuleSoft|Boomi|webMethods|Sterling|IDoc|EDI)\b/i,
  crm: /\b(Salesforce|HubSpot|Shopify|Magento|Sitecore)\b/i,
  observability: /\b(Splunk|Datadog|Grafana|New Relic)\b/i,
  bi: /\b(Tableau|Power BI|Qlik|Looker)\b/i,
  security: /\b(Tenable|Okta|CrowdStrike|Qualys)\b/i,
};

const hitsOf = (table, text) => {
  const t = String(text ?? '');
  return new Set(Object.entries(table).filter(([, re]) => re.test(t)).map(([k]) => k));
};

export const families = (text) => hitsOf(PROCESS, text);
export const domains = (text) => hitsOf(DOMAIN, text);
/* Which kinds of system it runs inside, not which products. */
export const systems = (text) => hitsOf(SYSTEMS, text);
/* What the work acts on. The subject a card has to keep hold of from its headline to its
 * outreach email. */
export const objects = (text) => hitsOf(OBJECTS, text);

/* Does this piece of a card drift off the subject the card is about? Not a question of
 * overlap but of contradiction: a section that names no object is simply unspecific, and
 * a section that names a different one is about a different service. */
export function drifts(cardObjects, sectionText) {
  const got = objects(sectionText);
  if (!cardObjects.size || !got.size) return null;
  /* Foreign objects, not absent ones. A deliverable that reads "invoices are reconciled
   * against the goods receipt and the purchase order" mentions the card's own subject and
   * is still a second service: it is the mixing itself that has to be caught, so one
   * object the card never claims is enough. */
  const foreign = [...got].filter((o) => !cardObjects.has(o));
  if (!foreign.length) return null;
  return { got: foreign, want: [...cardObjects] };
}

const shares = (a, b) => [...a].some((x) => b.has(x));

/* Everything a card claims about a line, in one string, so a record is judged against the
 * opportunity as a whole rather than against whichever field happens to match. */
export const lineText = (line) => [
  line.headline, line.work, line.unit, line.paid_service, line.customer_problem,
  line.what_it_is, line.why_you, line.function,
].filter(Boolean).join(' ');

export const recordText = (r) => [
  r.sellable_as, r.title, r.industry, (r.built ?? []).join(' '), (r.topics ?? []).join(' '),
  (r.results ?? []).join(' '), r.client,
].filter(Boolean).join(' ');

/* The three axes, read once per comparison. `scope` is the world the card lives in: the
 * partner's industries and the systems their clients actually run, which is wider than
 * anything the line itself says. */
export function profileOf(text, scope = {}) {
  const own = domains(text);
  return {
    families: families(text),
    /* The card's own industry where it has one, and only otherwise the partner's whole
     * footprint. Unioning the two made the guard useless on exactly the firms that need
     * it: Fortude serves insurance among other things, so adding insurance to every card
     * meant an insurance claims record no longer conflicted with a food distribution
     * forecasting play. A card is about one business, not all of their businesses. */
    domains: own.size ? own : new Set(scope.domains ?? []),
    /* Systems work the other way round. What a client runs is a fact about the partner's
     * book rather than about the sentence, so the wider set is the right one. */
    systems: new Set([...systems(text), ...(scope.systems ?? [])]),
  };
}

/* A domain conflict is a veto, not a penalty. Where both sides name an industry and they
 * are different industries, the record is about someone else's business, and no amount of
 * shared vocabulary makes it relevant. */
/* Industries that are the same world. A manufacturer's procurement and a distributor's
 * supply chain are recognisably one another's business, and treating them as a conflict
 * blocked a procurement engagement from a supply chain card for no reason. Insurance and
 * logistics are not neighbours, which is the case this guard exists for. */
const NEIGHBOURS = [
  ['manufacturing', 'logistics', 'retail'],
  ['banking', 'insurance'],
  ['healthcare', 'education', 'publicsector'],
];
const widen = (set) => {
  const out = new Set(set);
  for (const group of NEIGHBOURS) if (group.some((g) => set.has(g))) for (const g of group) out.add(g);
  return out;
};

export function conflicts(a, b) {
  if (!a.size || !b.size) return false;
  return !shares(widen(a), widen(b));
}

/* May this record appear on this card, in this role?
 *
 *   mechanism  explains how the thing works. Same kind of work, no foreign industry.
 *   reference  "built on this". Same bar: it is still a claim that we have done this.
 *   proof      prints a number measured elsewhere. The outcome itself has to be about
 *              the same kind of work, not merely the engagement it came from.
 *   demo       the strongest claim of the four, because the partner will show it to a
 *              client. Nothing domain-specific unless the domain matches exactly.
 */
export function compatible(record, line, role, scope = {}) {
  const want = profileOf(lineText(line), scope);
  const got = profileOf(recordText(record));

  if (conflicts(want.domains, got.domains)) {
    return { ok: false, why: `about ${[...got.domains].join('/')}, this card is ${[...want.domains].join('/') || 'not'}` };
  }
  /* Nothing in the line reads as a recognisable kind of work, so there is nothing to
   * check it against. The caller's word overlap test still applies. */
  if (!want.families.size) return { ok: true, why: 'no process family to test against' };

  if (!shares(want.families, got.families)) {
    return { ok: false, why: `${[...got.families].join('/') || 'no recognisable process'} is not ${[...want.families].join('/')}` };
  }

  /* And it has to have happened somewhere their clients could recognise. A record whose
   * named systems are disjoint from the ones this partner's clients run is a description
   * of work inside a different stack: "impact analysis across Jira, GitHub and TestRail"
   * is a true account of a software delivery engagement and a misleading one about an
   * Infor release cycle, however much testing vocabulary the two share. A record that
   * names no systems at all is unaffected, because it is claiming nothing about where. */
  if (role !== 'demo' && got.systems.size && want.systems.size && !shares(want.systems, got.systems)) {
    return { ok: false, why: `runs inside a ${[...got.systems].slice(0, 2).join('/')} stack, their clients run ${[...want.systems].slice(0, 2).join('/')}` };
  }

  if (role === 'proof') {
    /* The result is the thing being borrowed, so the result is what has to be on point.
     * "Response rates tripled" is an outreach outcome whatever else the engagement did. */
    const outcome = families((record.results ?? []).join(' '));
    if (outcome.size && !shares(want.families, outcome)) {
      return { ok: false, why: `the result measures ${[...outcome].join('/')}, not ${[...want.families].join('/')}` };
    }
  }

  if (role === 'demo') {
    /* A demo is shown to the partner's client. An agent built for an industry they do not
     * serve is not a demo, it is a distraction. */
    if (got.domains.size && !shares(want.domains, got.domains)) {
      return { ok: false, why: `built for ${[...got.domains].join('/')}` };
    }
  }

  return { ok: true, why: `${[...want.families].filter((f) => got.families.has(f)).join('/')} on both sides` };
}

/* Which of a record's steps belong on this card. A step that names a system the partner's
 * clients do not run describes work inside somebody else's toolchain: "ingested Jira,
 * GitHub, SharePoint, TestRail and Rally" is a true sentence about a software delivery
 * engagement and a false one about an Infor release cycle. */
export function stepsFor(record, line, scope = {}) {
  const want = profileOf(lineText(line), scope);
  const terms = termSet(`${line.work} ${line.headline} ${line.unit} ${line.function}`);
  return (record.built ?? []).filter((step) => {
    const text = String(step);
    /* A foreign industry in the step itself is the clearest possible signal. */
    if (conflicts(want.domains, domains(text))) return false;
    /* Named systems have to be ones their clients run, where we know what those are. */
    const named = systems(text);
    if (named.size && want.systems.size && !shares(want.systems, named)) return false;
    /* And it has to be about this kind of work, by family or by the words of the work. */
    const fam = families(text);
    if (want.families.size && fam.size && !shares(want.families, fam)) return false;
    return (want.families.size && shares(want.families, fam))
      || [...terms].some((w) => text.toLowerCase().includes(w));
  });
}
