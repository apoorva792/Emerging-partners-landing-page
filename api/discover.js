import { discover } from '../lib/journey.js';
import { guard, json, body, record } from './_handler.js';

/* Started by the browser while the visitor is still on the last question, so the twenty
 * seconds this takes are spent before the wait rather than inside it. The picks are handed
 * straight back to /api/recommend. */
export default guard(async (req, res) => {
  const { id, profile, answers, partial } = await body(req);
  const out = await discover(profile, answers, { partial: !!partial });
  /* Why a candidate was turned down is written for us, not for them, and it is the kind
   * of sentence that reads badly over someone's shoulder. It goes to the run file here
   * rather than travelling to the browser and back. */
  await record(id, {
    shortlist: {
      considered: out.considered,
      not_recommended: out.not_recommended,
      research: out.research,
      picked: out.picks.map((p) => ({ id: p.id, headline: p.headline, score: p.score, scores: p.scores })),
    },
  });
  return json(res, 200, { opening: out.opening, picks: out.picks, ms: out.ms });
});
