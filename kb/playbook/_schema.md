# partner_playbook — schema

One file per sellable service line. The opportunity engine retrieves across these,
scores `fits_when` against the company profile, and renders the top 2–3 as cards.

| Field | Who writes it | Notes |
|---|---|---|
| `id` | drafted | stable slug, never reused |
| `archetype` | drafted | one of the 5 in `_archetypes.md`; `also_fits` for cross-over |
| `name` | drafted | what the partner would put on their own website |
| `one_liner` | drafted | what the agent's end client gets, in their words |
| `fits_when` | drafted | signals in the crawled profile that trigger this card |
| `buyer` | drafted | who at the end client signs |
| `pitch_to_their_client` | drafted | the line the partner repeats in a meeting |
| `why_you` | drafted | template; the engine fills the blank from their profile |
| `delivery.shape` | drafted | build length + what recurs |
| `delivery.team_needed` | drafted | so a 15-person firm can self-assess |
| `delivery.lyzr_products` | drafted | what it rides on |
| `first_offer` | drafted | the scoped engagement they sell *first* — name, shape, what it ends with |
| `proof` | drafted | case id from `lyzr_case_studies`; result quoted verbatim |

Rules the engine must follow:
- `buyer`, `pitch_to_their_client`, `delivery.shape`, `delivery.team_needed`,
  `delivery.lyzr_products`, `first_offer` and `fits_when` are rendered on the card as
  written here. The model argues from them and may not reword them, so they have to read
  as finished copy in this file.
- `proof.result` is quoted exactly; customer name only when `named: true`
