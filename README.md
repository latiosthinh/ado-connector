# ADO Connector for Next.js

A simple, powerful library to expose Azure DevOps (ADO) capabilities in your Next.js application.

## Installation

```bash
npm install ado-connector
# or
yarn add ado-connector
```

## Usage

### 1. Set up Environment Variables

Ensure you have the following environment variables in your `.env.local`:

```env
ADO_ORG=your-organization
ADO_PROJECT=your-project
ADO_PAT=your-personal-access-token
```

### 2. Create the API Route

Create a file at `app/api/ado/[[...ado]]/route.ts` (App Router) or `pages/api/ado/[[...ado]].ts` (Pages Router).

**App Router (`app/api/ado/[[...ado]]/route.ts`):**

```typescript
import { createAdoHandler } from 'ado-connector';

const handler = createAdoHandler({
  organization: process.env.ADO_ORG!,
  project: process.env.ADO_PROJECT!,
  pat: process.env.ADO_PAT!,
});

export { handler as GET, handler as POST };
```

### 3. Access the API

Now your application exposes the following endpoints:

- `GET /api/ado/pipelines`: List all pipelines (enriched with latest run and artifacts).
- `GET /api/ado/pipelines?mode=simple`: List all pipelines (basic info).
- `GET /api/ado/pipelines/:id`: Get pipeline details.
- `GET /api/ado/pipelines/:id/runs`: Get runs for a pipeline.
- `GET /api/ado/pipelines/:id/runs/:runId`: Get a specific run.
- `GET /api/ado/builds/:id/artifacts`: Get artifacts for a specific build.

## Features

- **Easy Integration**: Plug and play with Next.js Route Handlers.
- **Type Safe**: Written in TypeScript with full type definitions.
- **Enriched Data**: Automatically aggregates pipeline runs and artifacts for a comprehensive view.
