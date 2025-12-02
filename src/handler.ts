import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AdoClient, AdoConfig } from './client';

export function createAdoHandler(config: AdoConfig) {
    const client = new AdoClient(config);

    return async function GET(
        req: NextRequest,
        { params }: { params: { ado?: string[] } } // Expecting a catch-all route param, e.g., [[...ado]]
    ) {
        // If mounted at /api/ado, and we call /api/ado/pipelines, params.ado will be ['pipelines']
        // If we call /api/ado, params.ado might be undefined or empty array

        // We need to know the param name used by the user. 
        // Actually, in App Router, the second argument is context, which contains params.
        // But the key in params depends on the folder name, e.g. [...slug].
        // We can try to guess or ask user to pass the segments.
        // However, a cleaner way for a library is to just parse the URL or expect the user to pass the segments if they wrap it.
        // But standard pattern is: export const GET = createAdoHandler(config);
        // In that case, we receive the standard Next.js args.
        // We can iterate over params values to find the array.

        // Let's look at the path.
        // req.nextUrl.pathname gives the full path.
        // We can't easily know where we are mounted.
        // So relying on params is better.

        const pathSegments = params && Object.values(params)[0]; // Take the first param value, assuming it's the catch-all

        const segments = Array.isArray(pathSegments) ? pathSegments : [];

        // Route dispatching
        // /pipelines
        // /pipelines/:id
        // /pipelines/:id/runs
        // /pipelines/:id/runs/:runId
        // /builds/:id/artifacts

        try {
            if (segments.length === 0) {
                return NextResponse.json({ message: 'ADO Connector API' });
            }

            const [resource, id, subResource, subId] = segments;

            if (resource === 'pipelines') {
                if (!id) {
                    // GET /pipelines -> List all (enriched as per original requirement? or just list?)
                    // The original code had /pipelines returning enriched data.
                    // Let's support query param ?mode=simple for just list, default to enriched?
                    // Or keep it simple and add /pipelines/enriched

                    const mode = req.nextUrl.searchParams.get('mode');
                    if (mode === 'simple') {
                        const data = await client.listPipelines();
                        return NextResponse.json(data);
                    } else {
                        // Default to the "full service" enriched view as requested originally
                        const data = await client.getPipelinesWithLatestRunAndArtifacts();
                        return NextResponse.json(data);
                    }
                } else {
                    // GET /pipelines/:id
                    if (!subResource) {
                        const data = await client.getPipeline(parseInt(id));
                        return NextResponse.json(data);
                    } else if (subResource === 'runs') {
                        if (!subId) {
                            // GET /pipelines/:id/runs
                            const data = await client.listPipelineRuns(parseInt(id));
                            return NextResponse.json(data);
                        } else {
                            // GET /pipelines/:id/runs/:runId
                            const data = await client.getRun(parseInt(id), parseInt(subId));
                            return NextResponse.json(data);
                        }
                    }
                }
            } else if (resource === 'builds') {
                if (id && subResource === 'artifacts') {
                    // GET /builds/:id/artifacts
                    const data = await client.listBuildArtifacts(parseInt(id));
                    return NextResponse.json(data);
                }
            }

            return NextResponse.json({ error: 'Not Found' }, { status: 404 });

        } catch (error: any) {
            console.error('ADO API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
