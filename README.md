# Between

A working, entirely fictional agent-dating laboratory: 25 people, 50 authored source fixtures, 300 six-turn pairwise dates, and 24 ranked connections per person.

- [Live website and preloaded demo](https://aayushkumbharkar.github.io/between-agent-dating/)
- [YouTube walkthrough — 2:45](https://youtu.be/MOl_oT76cTE)
- [Captioned video player and MP4 download](https://aayushkumbharkar.github.io/between-agent-dating/demo.html)
- [Public source repository](https://github.com/aayushkumbharkar/between-agent-dating)

## Run

Requires Node.js 20+. No dependencies or API keys.

```sh
npm start
# http://localhost:4173
npm test
```

## Try the full flow

1. Click **Add a person**, then **Use Maya’s demo links**. Confirm that the profiles are fictional and the Instagram fixture is public.
2. Click **Read sources & build agent**. The profile opens before rankings. Inspect the two source documents and individual evidence lines.
3. Click **Watch my agent date**, then **Start a date**. The six-turn conversation unfolds. Pause, step, or read all; expand a turn to inspect its decision and source.
4. Read the date verdict and score breakdown, then open **Connections**. Each person has 24 ranked matches. **Why this fit** explains the score and links to the conversation.
5. Create a new fictional character through the optional source-document fields. Give it unique `https://linkedin.example/in/<handle>` and `https://instagram.example/<handle>` URLs, an explicit adult age, and the labeled source format shown in the form. New profiles persist in browser localStorage, and all pairings are recalculated.
6. **Export experiment** downloads sources, analyses, transcripts, and rankings as JSON.

## What the agents actually do

The default harness is deterministic and rule-based, not an LLM. Each agent carries a source-backed persona. A conversation follows discover → respond → negotiate → resolve → clarify intention → decide. Response branches depend on both personas: shared interests determine the opener, social-energy differences elicit a boundary, incompatible scheduling prompts a compromise, and intention conflicts remain unresolved rather than being papered over.

The agents do not call external services, use hidden personal information, or perform real-world actions. Venues change the scene, not the score. All 300 conversations are computed when the application loads. The live player exposes the same engine turn by turn.

## Analysis and scoring

The parser recognizes explicit labeled statements from exactly two documents. LinkedIn carries name, adult age, city, role, about, and named values; Instagram carries bio, interests, pace, social energy, relationship intention, and needs. Every analyzed field retains a source quote. Missing preferences are unknown. There is no inferred sexuality, relationship status, personality diagnosis, or unstated romantic need.

Pair score weights: values 25, interests 20, intention 25, planning rhythm 10, social energy 10, and negotiation 10. Values/interests use shared-item count divided by the larger set. Flexible rhythm or balanced energy gives partial alignment; opposing endpoints score 0.2. Negotiation is the mean of rhythm and energy alignment. It is a **heuristic derived from the same preferences**, not an independent measure of conversational chemistry. Unknown dimensions contribute zero and lower evidence coverage.

Personal score = 90% pair score + 10% proportion of this person's interests shared by the other. An intention mismatch caps both pair and personal scores at 49. City differences are flagged; there is no invented distance preference. Ties sort by name. Scores are not probabilities and have no empirical validation.

## Technical stack / scraping

Vanilla JavaScript ES modules, semantic HTML, CSS, a dependency-free Node preview server, Node's test runner, and static Sites hosting. Profile storage is browser-local. Illustrations are inline SVGs. Typography uses Google Fonts with local system fallbacks.

**No Instagram or LinkedIn scraper is used.** Following the clarified fictional-person requirement, `dist/data.js` supplies 50 original fixture documents. The `.example` domain names are explicitly fictional identifiers and are resolved locally, not fetched. Arbitrary real LinkedIn/Instagram URLs are rejected with a useful error. The custom flow supports pasted fictional text, not live social-network scraping.

## Files

- `dist/data.js`: 25 source pairs, authored fiction.
- `dist/engine.js`: extraction, evidence, conversational policies, and scoring.
- `dist/app.js`: roster, profiles, source viewer, import, date playback, rankings, and export.
- `dist/styles.css`: responsive editorial interface.
- `tests/engine.test.mjs`: complete pairing, ranking, conflict, evidence, and validation checks.
- `server.mjs`: local static preview server.
- `.openai/hosting.json`: Sites static deployment configuration.
- `SUBMISSION.md`: concise explanation and demo outline.

## Limits

This is a transparent fictional simulation, not a production matchmaking service. There is no account system, shared database, live social scraping, or LLM integration. Custom profiles are specific to the visitor's browser. The included fixture example remains available without input.

The YouTube walkthrough is uploaded as unlisted. The completed MP4, captions, and walkthrough page are also included in `dist/` and available on the public website. Video duration: 165.2 seconds; 1440 × 900 H.264 video with AAC narration.

Validation: 10 engine tests passed. Browser QA exercised source import, evidence inspection, date playback, self-date rejection, per-person rankings, JSON export, custom partial profiles, persistence, reduced motion, and 390px layouts.
