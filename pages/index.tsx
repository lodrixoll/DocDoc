import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { fetchGitHubRepositories, fetchRepositoryLanguages, fetchRepositoryTopics, fetchReadme, fetchDependencies } from '../utils/github';

interface Repository {
    id: number;
    name: string;
}

const Home: React.FC = () => {
    const { data: session } = useSession() as { data: Session & { login?: string } };
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [repoLanguages, setRepoLanguages] = useState<any | null>(null);
    const [repoTopics, setRepoTopics] = useState<any | null>(null);
    const [readme, setReadme] = useState<string | null>(null);
    const [dependencies, setDependencies] = useState<string | null>(null);
    const [testMessage, setTestMessage] = useState<string>('');

    useEffect(() => {
        if (session?.accessToken && typeof session.accessToken === 'string') {
            setLoading(true);
            fetchGitHubRepositories(session.accessToken)
                .then(setRepositories)
                .catch(error => console.error('Error fetching repositories:', error))
                .finally(() => setLoading(false));
        }
    }, [session]);

    useEffect(() => {
        if (selectedRepo && session?.accessToken && session.login) {
            fetchRepositoryLanguages(session.login, selectedRepo.name, session.accessToken)
                .then(setRepoLanguages)
                .catch(error => console.error('Error fetching repository languages:', error));
    
            fetchRepositoryTopics(session.login, selectedRepo.name, session.accessToken)
                .then(setRepoTopics)
                .catch(error => console.error('Error fetching repository topics:', error));
    
            fetchReadme(session.login, selectedRepo.name, session.accessToken)
                .then(setReadme)
                .catch(error => console.error('Error fetching README:', error));

            fetchDependencies(session.login, selectedRepo.name, session.accessToken)
                .then(setDependencies)
                .catch(error => console.error('Error fetching dependencies:', error));
        }
    }, [selectedRepo, session]);

    function getInitials(name: string | undefined): string {
        if (!name) return "";
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.length > 1 ? initials[0] + initials[initials.length - 1] : initials;
    }

    const handleTestRequest = async () => {
        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'This is a test message' }],
                }),
            });

            const data = await response.json();
            setTestMessage(data.content);
        } catch (error) {
            console.error('Error making test request:', error);
        }
    };

    return (
        <div className="container clamp d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
                <h1 className="mb-5"><span style={{ color: '#1976d2' }}>doc</span><span className="text-danger">doc</span></h1>
                <img src="/images/icons/favicon.svg" alt="favicon" className="img-fluid mb-5" />
                <div className="d-flex justify-content-center mt-3">
                    <input type="text" className="form-control" placeholder="Enter documentation URL" style={{ backgroundColor: '#E9EBEE', marginRight: '20px', borderColor: '#1976d2' }} />
                    {!session ? (
                        <button onClick={() => signIn('github')} className="btn btn-danger ml-2 text-nowrap" title="Connect GitHub">Connect GitHub</button>
                    ) : (
                        <div>
                            <div className="user-info" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button onClick={() => signOut()} className="btn btn-sm btn-secondary mr-2">Sign Out</button>
                                    <div className="user-initials" style={{ backgroundColor: '#1976d2', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
                                        {getInitials(session.user?.name || "")}
                                    </div>
                                </div>
                            </div>
                            {loading ? (
                                <p>Loading repositories...</p>
                            ) : (
                                <select className="form-control" style={{ backgroundColor: '#dc3545', color: 'white'}} onChange={(e) => setSelectedRepo(repositories.find(repo => repo.name === e.target.value) || null)}>
                                    <option value="">Select</option>
                                    {repositories.map(repo => (
                                        <option key={repo.id} value={repo.name}>{repo.name}</option>
                                    ))}
                                </select>
                            )}
                            {repoLanguages && repoTopics && (
                                <div className="mt-4">
                                    <h3>Repository Details</h3>
                                    <p><strong>Languages:</strong> {Object.keys(repoLanguages).join(', ')}</p>
                                    <p><strong>Topics:</strong> {repoTopics.names ? repoTopics.names.join(', ') : 'No topics available'}</p>
                                </div>
                            )}
                            {/* {dependencies && (
                                <div className="mt-4">
                                    <h3>Dependencies</h3>
                                    <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{dependencies}</pre>
                                </div>
                            )} */}
                            {/* {readme && (
                                <div className="mt-4">
                                    <h3>README</h3>
                                    <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{readme}</pre>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
                <button onClick={handleTestRequest} className="btn btn-primary mt-3">Send Test Message</button>
                {testMessage && (
                    <div className="mt-3">
                        <h3>Test Message Response</h3>
                        <p>{testMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

