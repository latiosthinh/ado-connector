
import { AdoClient } from './src/client';

// Simple mock setup
const simpleMockFetch = async (url: string, options: any) => {
    console.log(`Fetch called with URL: ${url}`);
    if (url.includes('$top=10') && url.includes('$skip=5')) {
        console.log('PASS: URL contains top and skip');
    } else if (url.includes('$top=20') && url.includes('$skip=0')) {
        console.log('PASS: URL contains top and skip');
    } else if (!url.includes('$top') && !url.includes('$skip')) {
        console.log('PASS: URL does not contain top/skip (as expected for no pagination)');
    } else {
        console.error('FAIL: URL mismatch');
        process.exit(1);
    }
    return {
        ok: true,
        json: async () => ({ value: [] })
    };
};
(global as any).fetch = simpleMockFetch;

async function run() {
    const client = new AdoClient({
        organization: 'test-org',
        project: 'test-project',
        pat: 'test-pat'
    });

    console.log('--- Test 1: listPipelines(10, 5) ---');
    await client.listPipelines(10, 5);

    console.log('\n--- Test 2: listPipelineRuns(123, 20, 0) ---');
    await client.listPipelineRuns(123, 20, 0);

    console.log('\n--- Test 3: listPipelines() (no pagination) ---');
    await client.listPipelines();
}

run().catch(console.error);
