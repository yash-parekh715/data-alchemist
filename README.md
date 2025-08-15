# Data Alchemist ✨

Smart CSV prep tool for Clients, Workers, and Tasks. Upload files, validate and edit in fast grids, describe rules in plain English (AI), filter with a tiny DSL, then export clean CSVs + rules.json.

## 🚀 Live demo

- https://data-alchemist-delta-six.vercel.app/

## 🌟 Features

- 📥 Import: Upload CSVs, auto-normalization for lists, numbers, JSON (see samples/).
- ⚡ Fast grids: AG Grid with editing, sort/filter, and per-entity views.
- 🔎 Search/DSL: Natural language → DSL via AI, or type DSL directly in the search bar (safe, local evaluation). See [src/components/search/NLSearch.tsx](src/components/search/NLSearch.tsx) and [src/lib/dsl.ts](src/lib/dsl.ts).
- ✅ Validation: Schema and cross-entity checks with a Web Worker; summary panel and revalidate actions. See [src/hooks/useCrossValidation.ts](src/hooks/useCrossValidation.ts).
- 🧠 Rules + AI: Build rules or “Suggest from text” (Gemini). See [src/components/rules/RuleBuilder.tsx](src/components/rules/RuleBuilder.tsx) and API at [src/app/api/ai/route.ts](src/app/api/ai/route.ts).
- 📤 Export: Gated until errors resolved; outputs cleaned CSVs and rules.json with metadata.

## 🧰 Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS, AG Grid
- Google Generative AI via @google/generative-ai (Gemini 2.5 Pro)
- Web Worker for cross-validation

## 🗂️ Project structure

- app/ — pages, API route: [src/app/api/ai/route.ts](src/app/api/ai/route.ts)
- components/ — grids, search, rules, export, weights
- hooks/, lib/, store/, workers/, types/, samples/

## 🛠️ Getting started (local)

1. Prereqs: Node 18+ and npm
2. Install
   - npm i
3. Env (AI optional)
   - Create .env.local
     - GOOGLE_API_KEY=your_key
     - GEMINI_MODEL=gemini-2.5-pro
4. Run
   - npm run dev
   - Open http://localhost:3000
5. Try it
   - Upload samples from [samples/](samples/)
   - Fix issues in Validation Summary
   - Use the DSL/NL search bars above each grid
   - Add a rule or “Suggest from text”
   - Export when errors = 0

## ☁️ Deploy

- Vercel recommended. Add env vars (GOOGLE_API_KEY, GEMINI_MODEL). Docs: https://nextjs.org/docs/app/building-your-application/deploying

## 🔒 Notes

- AI calls only send your text prompt and schema; grid filtering is evaluated locally.
- If you don’t set GOOGLE_API_KEY, AI features are disabled but the app still works
