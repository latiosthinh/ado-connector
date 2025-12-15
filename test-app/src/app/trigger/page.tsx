"use client";

import { useState, useEffect } from "react";

export default function TriggerPage() {
    const [pipelineId, setPipelineId] = useState("");
    const [branch, setBranch] = useState("");
    const [tags, setTags] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [repositoryId, setRepositoryId] = useState<string | null>(null);

    // Fetch pipeline details to get repository ID, then fetch branches
    useEffect(() => {
        if (!pipelineId) {
            setBranches([]);
            setRepositoryId(null);
            return;
        }

        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                // First get pipeline details to extract repository ID
                const pipelineRes = await fetch(`/api/ado/pipelines/${pipelineId}`);
                if (pipelineRes.ok) {
                    const pipelineData = await pipelineRes.json();
                    // Extract repository ID from pipeline configuration
                    // Typically in pipelineData.configuration.repository.id
                    const repoId = pipelineData?.configuration?.repository?.id;

                    if (repoId) {
                        setRepositoryId(repoId);
                        const branchesRes = await fetch(`/api/ado/repositories/${repoId}/branches`);
                        if (branchesRes.ok) {
                            const branchesData = await branchesRes.json();
                            setBranches(branchesData);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to fetch branches:', e);
            } finally {
                setLoadingBranches(false);
            }
        };

        fetchBranches();
    }, [pipelineId]);

    const handleTrigger = async () => {
        setLoading(true);
        setResult(null);
        try {
            const tagList = tags.split(",").map((t) => t.trim()).filter((t) => t);
            const res = await fetch(`/api/ado/pipelines/${pipelineId}/runs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    branch: branch || undefined,
                    tags: tagList.length > 0 ? tagList : undefined,
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setResult({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Trigger Pipeline</h1>
            <div style={{ marginBottom: "10px" }}>
                <label>Pipeline ID: </label>
                <input
                    value={pipelineId}
                    onChange={(e) => setPipelineId(e.target.value)}
                    placeholder="e.g., 29"
                    style={{ marginLeft: "10px" }}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label>Branch: </label>
                {loadingBranches ? (
                    <span style={{ marginLeft: "10px" }}>Loading branches...</span>
                ) : branches.length > 0 ? (
                    <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        style={{ marginLeft: "10px" }}
                    >
                        <option value="">-- Select Branch --</option>
                        {branches.map((b) => (
                            <option key={b.ref} value={b.ref}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="refs/heads/main"
                        style={{ marginLeft: "10px" }}
                    />
                )}
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label>Tags (comma separated, optional): </label>
                <input
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2"
                />
            </div>
            <button onClick={handleTrigger} disabled={loading || !pipelineId}>
                {loading ? "Triggering..." : "Run Pipeline"}
            </button>

            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Result:</h3>
                    <RunStatus pipelineId={pipelineId} initialRun={result} />
                </div>
            )}
        </div>
    );
}

function RunStatus({ pipelineId, initialRun }: { pipelineId: string; initialRun: any }) {
    const [run, setRun] = useState(initialRun);
    const [canceling, setCanceling] = useState(false);

    useEffect(() => {
        if (!run?.id) return;

        // Stop polling if run is in terminal state
        if (run.state === 'canceling' || run.state === 'completed') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/ado/pipelines/${pipelineId}/runs/${run.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setRun(data);
                }
            } catch (e) {
                console.error(e);
            }
        }, 5000); // 5 seconds for test
        return () => clearInterval(interval);
    }, [pipelineId, run?.id, run?.state]);

    const handleCancel = async () => {
        if (!run?.id) return;
        setCanceling(true);
        try {
            const res = await fetch(`/api/ado/pipelines/${pipelineId}/runs/${run.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: 'canceling' })
            });
            if (res.ok) {
                const data = await res.json();
                setRun(data);
            } else {
                alert('Failed to cancel run');
            }
        } catch (e) {
            console.error(e);
            alert('Error canceling run');
        } finally {
            setCanceling(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <p><strong>Run ID:</strong> {run?.id}</p>
            <p><strong>State:</strong> {run?.state}</p>
            <p><strong>Result:</strong> {run?.result || 'Running...'}</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleTimeString()}</p>

            {run?.state !== 'completed' && (
                <button onClick={handleCancel} disabled={canceling} style={{ backgroundColor: 'red', color: 'white' }}>
                    {canceling ? 'Canceling...' : 'Cancel Run'}
                </button>
            )}

            <div style={{ marginTop: '10px' }}>
                <details>
                    <summary>Full JSON</summary>
                    <pre>{JSON.stringify(run, null, 2)}</pre>
                </details>
            </div>
        </div>
    );
}
