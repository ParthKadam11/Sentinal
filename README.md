# Sentinal

A lightweight, developer-focused AI routing, telemetry, and budget-guard for multi-provider chat integrations — built as a polished product demo.

**Motto:** Guard spend, amplify trust.

Sentinal sits between your app and multiple LLM providers (OpenAI, Groq, etc.), routing requests, recording usage and latency, estimating cost, and enforcing daily budgets so you never get surprised by runaway spend.

**Highlights**
- **Multi-provider routing**: Send messages to different LLM providers via a single API.
- **Telemetry & analytics**: Tracks tokens, latency, model, and estimated cost per request.
- **Budget guard**: Configurable daily budget check that blocks requests when exceeded.
- **Cost estimation**: Per-model pricing and estimated spend calculation for informed decisions.
- **SmartBudget Router (NEW)**: Dynamic, cost-aware routing and auto-throttling to maximize value while protecting budgets.

**Use cases / Product Demo Scenarios**
- **Safe AI orchestration for product teams**: Route requests to different models/providers while monitoring cost and latency in real time.
- **Cost-aware developer tooling**: Integrate Sentinal into staging environments to test model behavior with cost controls enabled.
- **Provider comparison dashboards**: Collect provider-level metrics to compare latency, token usage, and spend.
- **Proof-of-concept for on-prem / edge routing**: Lightweight Hono server that can be deployed near your services.

**What’s included**
- API routes to interact with the system: chat and analytics endpoints.
- Provider integrations: OpenAI and Groq (example providers under `src/services/providers`).
- Database logging of requests using Drizzle ORM with a `requestLogs` table to power analytics.
- Pricing utilities for token-to-cost calculation.

SmartBudget Router

Sentinal now includes the SmartBudget Router: an intelligent, cost-aware routing layer that chooses the best provider and model per request based on latency, estimated cost, and confidence. It optimizes for budget and performance by routing low-cost requests to cheaper providers, escalating to higher-capacity models only when necessary, and automatically throttling or rejecting requests as budget thresholds approach.

What it does:
- Dynamically selects provider and model per-request to balance cost, latency, and quality.
- Applies confidence-aware fallbacks: if a cheaper route can't meet quality thresholds, it transparently escalates to a better model.
- Auto-throttles or rejects requests when configured budget setpoints are hit, preventing surprise spend.
- Records routing rationale and cost trade-offs in telemetry for explainability and analytics.

Why it matters:
- Keeps AI experimentation safe and predictable for teams by preventing runaway spend.
- Delivers practical, observable savings while preserving user experience.

Example: Send a chat request specifying a desired cost/latency profile; the SmartBudget Router returns an answer along with the routing decision and estimated cost, making trade-offs visible to developers and product teams.

Quick links
- Routes: [src/routes/chat.ts](src/routes/chat.ts)
- Analytics: [src/routes/analytics.ts](src/routes/analytics.ts)
- Providers: [src/services/providers/index.ts](src/services/providers/index.ts)
- Pricing logic: [src/utils/pricing.ts](src/utils/pricing.ts)
- DB schema: [src/db/schema.ts](src/db/schema.ts)

Getting started (local)

1. Install dependencies

```
pnpm install
```

2. Create a `.env` in the project root with the required keys

```
DATABASE_URL=postgres://user:pass@localhost:5432/sentinal
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gr-...
```

3. Run in dev mode

```
pnpm run dev
```

The server listens on port `3000` by default. Open `http://localhost:3000`.

API (product-demo) — endpoints you can try

- POST /chat
	- Description: Send a message to a named provider and get a response. Sentinal will first check the daily budget and log telemetry for the request.
	- Example request:

```
curl -X POST http://localhost:3000/chat \
	-H "Content-Type: application/json" \
	-d '{"provider":"openai","message":"Hello from Sentinal demo"}'
```

- GET /analytics
	- Description: Aggregate telemetry (total requests, tokens, average latency, estimated cost).

```
curl http://localhost:3000/analytics
```

- GET /analytics/recent
	- Description: Returns the most recent raw request logs recorded in the `requestLogs` table.

```
curl http://localhost:3000/analytics/recent
```

- GET /analytics/providers
	- Description: Provider-level breakdown (requests, tokens, avg latency, estimated spend).

```
curl http://localhost:3000/analytics/providers
```

- GET /analytics/budget
	- Description: Shows today's spend against the configured daily budget and whether new requests are allowed.

```
curl http://localhost:3000/analytics/budget
```

How it works (architecture)

- HTTP server: `Hono` provides a tiny, fast router (see `src/index.ts`).
- Provider adapters: `src/services/providers/*` expose `generateXResponse()` functions for each provider. The central `generateResponse()` function routes to the selected provider.
- Telemetry: Each provider integration logs usage and cost estimates into `requestLogs` via Drizzle ORM (`src/db/schema.ts`).
- Pricing: `src/utils/pricing.ts` maps token counts and model names to estimated USD cost using `src/utils/modelPricing.ts`.
- Budgeting: `src/services/budget.ts` computes today's spend and blocks chat requests when the configured `DAILY_BUDGET_USD` is exceeded.

Extending Sentinal
- Add a new provider adapter in `src/services/providers` that follows the shape of the existing `openai.ts` and `groq.ts` implementations.
- Add model pricing entries in `src/utils/modelPricing.ts` to ensure cost estimates work for new models.
- Update `src/db/schema.ts` if you want to capture additional telemetry fields.

Design notes & demo talking points
- The project demonstrates safe experimentation with LLMs: budget enforcement prevents surprise costs while telemetry enables data-driven provider selection.
- Lightweight and modular: swap or add providers with minimal code, and the central analytics keep a consistent schema for comparisons.
- Good demo flow: 1) Start server 2) Send chat requests to both providers 3) Show `/analytics/providers` comparing latency/cost 4) Toggle the budget low and show new requests are rejected.

Development & testing
- Build: `pnpm run build` (compiles TypeScript)
- Run production build: set `NODE_ENV=production` and `pnpm run start` after building.

Environment variables
- `DATABASE_URL` — Postgres connection used by Drizzle
- `OPENAI_API_KEY` — OpenAI API key for the OpenAI provider
- `GROQ_API_KEY` — Groq API key for the Groq provider

Notes & caveats
- This repo includes example providers and a simple cost model for demo purposes — treat per-model pricing as illustrative, not production-grade.
- Telemetry logging is tolerant of errors; providers attempt to record usage but will not break the user-facing response if logging fails.

License
- MIT
