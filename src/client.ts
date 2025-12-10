import base64 from 'base-64';

export interface AdoConfig {
    organization: string;
    project: string;
    pat: string;
    apiVersion?: string;
}

export class AdoClient {
    private baseUrl: string;
    private authHeader: string;
    private apiVersion: string;

    constructor(config: AdoConfig) {
        if (!config.organization || !config.project || !config.pat) {
            throw new Error('Missing ADO configuration (organization, project, or pat)');
        }
        this.apiVersion = config.apiVersion || '7.1';
        this.baseUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis`;
        this.authHeader = `Basic ${base64.encode(':' + config.pat)}`;
    }

    private async fetchJson(url: string, options?: RequestInit) {
        const res = await fetch(url, {
            headers: {
                Authorization: this.authHeader,
                'Content-Type': 'application/json',
            },
            ...options
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${res.statusText} - ${text}`);
        }
        return res.json();
    }

    private async fetchAllPaged(url: string, itemsKey = 'value') {
        let all: any[] = [];
        let nextUrl: string | null = url;
        while (nextUrl) {
            const body = await this.fetchJson(nextUrl);
            const items = body[itemsKey] || [];
            all = all.concat(items);
            const token = body.continuationToken || null;
            nextUrl = token ? `${url}&continuationToken=${encodeURIComponent(token)}` : null;
        }
        return all;
    }

    async listPipelines(top?: number, skip?: number) {
        let url = `${this.baseUrl}/pipelines?api-version=${this.apiVersion}`;
        if (top !== undefined) url += `&top=${top}`;

        let allResults: any[] = [];
        // Always fetch all to get correct total count
        allResults = await this.fetchAllPaged(url);
        const total = allResults.length;

        let items = allResults;
        if (skip !== undefined || top !== undefined) {
            const start = skip || 0;
            const end = top ? start + top : undefined;
            items = allResults.slice(start, end);
        }
        return { total, items };
    }

    async getPipeline(id: number) {
        const url = `${this.baseUrl}/pipelines/${id}?api-version=${this.apiVersion}`;
        return this.fetchJson(url);
    }

    async listPipelineRuns(pipelineId: number, top?: number, skip?: number) {
        let url = `${this.baseUrl}/pipelines/${pipelineId}/runs?api-version=${this.apiVersion}`;
        if (top !== undefined) url += `&top=${top}`;

        let allResults: any[] = [];
        allResults = await this.fetchAllPaged(url);
        const total = allResults.length;

        let items = allResults;
        if (skip !== undefined || top !== undefined) {
            const start = skip || 0;
            const end = top ? start + top : undefined;
            items = allResults.slice(start, end);
        }
        return { total, items };
    }

    async getRun(pipelineId: number, runId: number) {
        const url = `${this.baseUrl}/pipelines/${pipelineId}/runs/${runId}?api-version=${this.apiVersion}`;
        return this.fetchJson(url);
    }

    async listBuildArtifacts(buildId: number) {
        // Note: Build artifacts API is under 'build/builds', not 'pipelines'
        // We need to reconstruct the URL slightly differently or use the same base if it matches.
        // The original code used: https://dev.azure.com/${ADO_ORG}/${ADO_PROJECT}/_apis/build/builds/${buildId}/artifacts
        // Our baseUrl is .../_apis. So we can append build/builds...
        const url = `${this.baseUrl}/build/builds/${buildId}/artifacts?api-version=${this.apiVersion}`;
        return this.fetchJson(url).then(r => r.value || []);
    }

    async runPipeline(pipelineId: number, options?: {
        resources?: {
            repositories?: {
                self?: {
                    refName?: string; // Branch name, e.g., "refs/heads/main"
                }
            }
        },
        templateParameters?: Record<string, any>,
        variables?: Record<string, { value: string, isSecret?: boolean }>
    }) {
        const url = `${this.baseUrl}/pipelines/${pipelineId}/runs?api-version=${this.apiVersion}`;
        const body = options || {};
        return this.fetchJson(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    // Aggregated method from original code
    async getPipelinesWithLatestRunAndArtifacts(top?: number, skip?: number) {
        const { items: pipelines, total } = await this.listPipelines(top, skip);
        const enriched = await Promise.all(pipelines.map(async (p: any) => {
            try {
                const { items: runs } = await this.listPipelineRuns(p.id, 1);
                const latest = runs[0] || null;
                let artifacts: any[] = [];
                const buildId = latest?.resources?.build?.id || latest?.build?.id; // Check both locations
                if (buildId) {
                    try {
                        artifacts = await this.listBuildArtifacts(buildId);
                    } catch (e) {
                        console.warn(`Failed to fetch artifacts for build ${buildId}`, e);
                    }
                }
                return { id: p.id, name: p.name, url: p._links?.web?.href, latestRun: latest, artifacts };
            } catch (e) {
                console.warn(`Failed to fetch details for pipeline ${p.id}`, e);
                return p;
            }
        }));
        return { total, items: enriched };
    }
}
