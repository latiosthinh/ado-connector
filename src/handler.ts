import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AdoClient, AdoConfig } from './client';

export function createAdoHandler(config: AdoConfig) {
    const client = new AdoClient(config);

    async function handleRequest(
        req: NextRequest,
        context: { params: Promise<{ ado?: string[] }> | { ado?: string[] } }
    ) {
        const params = await context.params;
        const pathSegments = params && Object.values(params)[0];
        const segments = Array.isArray(pathSegments) ? pathSegments : [];

        let resource, id, subResource, subId, method;

        try {
            if (segments.length === 0) {
                return NextResponse.json({ message: 'ADO Connector API' });
            }

            [resource, id, subResource, subId] = segments;
            method = req.method;

            if (resource === 'pipelines') {
                const pipelineId = parseInt(id);
                if (isNaN(pipelineId)) {
                    return NextResponse.json({ error: 'Invalid Pipeline ID' }, { status: 400 });
                }

                if (!id) { // This branch is actually unreachable if we access id above, but logic structure needs care.
                    // valid logic:
                    // resource, id, sub, subId.
                    // if id is undefined, parseInt is NaN.
                    // But "pipelines" without ID is listPipelines.
                    // Wait, "pipelines" matches...
                    // segments: ["pipelines"] -> id undefined.
                }

                // Let's rewrite the logic slightly to be cleaner.
                if (!id) {
                    if (method === 'GET') {
                        // list logic
                        const mode = req.nextUrl.searchParams.get('mode');
                        const topParam = req.nextUrl.searchParams.get('top') || req.nextUrl.searchParams.get('$top');
                        const skipParam = req.nextUrl.searchParams.get('skip') || req.nextUrl.searchParams.get('$skip');
                        const top = topParam ? parseInt(topParam) : undefined;
                        const skip = skipParam ? parseInt(skipParam) : undefined;

                        if (mode === 'simple') {
                            const data = await client.listPipelines(top, skip);
                            return NextResponse.json(data);
                        } else {
                            const data = await client.getPipelinesWithLatestRunAndArtifacts(top, skip);
                            return NextResponse.json(data);
                        }
                    }
                } else {
                    const pipelineId = parseInt(id);
                    if (isNaN(pipelineId)) {
                        return NextResponse.json({ error: 'Invalid Pipeline ID' }, { status: 400 });
                    }

                    if (!subResource) {
                        if (method === 'GET') {
                            const data = await client.getPipeline(pipelineId);
                            return NextResponse.json(data);
                        }
                    } else if (subResource === 'runs') {
                        if (!subId) {
                            if (method === 'GET') {
                                const topParam = req.nextUrl.searchParams.get('top') || req.nextUrl.searchParams.get('$top');
                                const skipParam = req.nextUrl.searchParams.get('skip') || req.nextUrl.searchParams.get('$skip');
                                const top = topParam ? parseInt(topParam) : undefined;
                                const skip = skipParam ? parseInt(skipParam) : undefined;
                                const data = await client.listPipelineRuns(pipelineId, top, skip);
                                return NextResponse.json(data);
                            } else if (method === 'POST') {
                                const body = await req.json().catch(() => ({}));
                                const data = await client.runPipeline(pipelineId, body);
                                return NextResponse.json(data);
                            }
                        } else {
                            const runId = parseInt(subId);
                            if (isNaN(runId)) {
                                return NextResponse.json({ error: 'Invalid Run ID' }, { status: 400 });
                            }

                            if (method === 'GET') {
                                const data = await client.getRun(pipelineId, runId);
                                return NextResponse.json(data);
                            } else if (method === 'PATCH') {
                                const body = await req.json().catch(() => ({}));
                                if (body.state === 'canceling') {
                                    const data = await client.cancelRun(pipelineId, runId);
                                    return NextResponse.json(data);
                                } else {
                                    // Handle other patch cases or return 400
                                    // For now ignore or 400
                                }
                            }
                        }
                    }
                }
            } else if (resource === 'builds') {
                // ... validation for builds if needed
                if (id && subResource === 'artifacts') {
                    const buildId = parseInt(id);
                    if (isNaN(buildId)) return NextResponse.json({ error: 'Invalid Build ID' }, { status: 400 });
                    if (method === 'GET') {
                        const data = await client.listBuildArtifacts(buildId);
                        return NextResponse.json(data);
                    }
                }
            }

            return NextResponse.json({ error: 'Not Found' }, { status: 404 });

        } catch (error: any) {
            console.error('ADO API Error Details:', error);
            console.error('Request Info:', { resource, id, subResource, subId, method });

            // Try to extract status code from error string "STATUS TEXT - MSG"
            const statusMatch = error.message.match(/^(\d{3})\s/);
            const status = statusMatch ? parseInt(statusMatch[1]) : 500;

            return NextResponse.json({ error: error.message }, { status });
        }
    }

    return handleRequest;
}
