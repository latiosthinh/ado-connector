"use client";

import { useState, useEffect } from "react";

interface Pipeline {
    id: number;
    name: string;
    latestRun?: {
        id: number;
        name: string;
        state: string;
        result?: string;
        createdDate: string;
    };
    commitSubject?: string | null;
}

export default function PipelinesPage() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const res = await fetch('/api/ado/pipelines');
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status}`);
                }
                const data = await res.json();
                setPipelines(data.items || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPipelines();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "20px" }}>
                <h1>Pipelines</h1>
                <p>Loading pipelines...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "20px" }}>
                <h1>Pipelines</h1>
                <p style={{ color: "red" }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Pipelines with Commit Subjects</h1>
            <p>Total: {pipelines.length} pipelines</p>

            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
                border: "1px solid #ddd"
            }}>
                <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                        <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>ID</th>
                        <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Pipeline Name</th>
                        <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Latest Run</th>
                        <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>State</th>
                        <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Commit Subject</th>
                    </tr>
                </thead>
                <tbody>
                    {pipelines.map((pipeline) => (
                        <tr key={pipeline.id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{pipeline.id}</td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                <strong>{pipeline.name}</strong>
                            </td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                {pipeline.latestRun ? (
                                    <div>
                                        <div>Run #{pipeline.latestRun.id}</div>
                                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                                            {pipeline.latestRun.name}
                                        </div>
                                    </div>
                                ) : (
                                    <span style={{ color: "#999" }}>No runs</span>
                                )}
                            </td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                {pipeline.latestRun ? (
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "0.9em",
                                        backgroundColor:
                                            pipeline.latestRun.state === 'completed'
                                                ? (pipeline.latestRun.result === 'succeeded' ? '#d4edda' : '#f8d7da')
                                                : pipeline.latestRun.state === 'inProgress' ? '#fff3cd'
                                                    : '#e2e3e5',
                                        color:
                                            pipeline.latestRun.state === 'completed'
                                                ? (pipeline.latestRun.result === 'succeeded' ? '#155724' : '#721c24')
                                                : pipeline.latestRun.state === 'inProgress' ? '#856404'
                                                    : '#383d41'
                                    }}>
                                        {pipeline.latestRun.state}
                                        {pipeline.latestRun.result && ` (${pipeline.latestRun.result})`}
                                    </span>
                                ) : (
                                    <span>-</span>
                                )}
                            </td>
                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                {pipeline.commitSubject ? (
                                    <span style={{ fontFamily: "monospace", fontSize: "0.9em" }}>
                                        {pipeline.commitSubject}
                                    </span>
                                ) : (
                                    <span style={{ color: "#999", fontStyle: "italic" }}>No commit data</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h3>Navigation</h3>
                <ul>
                    <li><a href="/trigger">Trigger Pipeline</a> - Test branch selection and run triggering</li>
                    <li><a href="/api/ado/pipelines">Raw JSON</a> - View raw API response</li>
                </ul>
            </div>
        </div>
    );
}
