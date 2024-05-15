import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { fetchGitHubRepositories, fetchRepositoryDetails, fetchReadme } from '../utils/github';

interface Repository {
    id: number;
    name: string;
}

const Home: React.FC = () => {
    const { data: session } = useSession() as { data: Session & { login?: string } };
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [repoDetails, setRepoDetails] = useState<{ languages: any, topics: any } | null>(null);
    const [readme, setReadme] = useState<string | null>(null);

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
            fetchRepositoryDetails(session.login, selectedRepo.name, session.accessToken)
                .then(setRepoDetails)
                .catch(error => console.error('Error fetching repository details:', error));
    
            fetchReadme(session.login, selectedRepo.name, session.accessToken)
                .then(setReadme)
                .catch(error => console.error('Error fetching README:', error));
        }
    }, [selectedRepo, session]);

    function getInitials(name: string | undefined): string {
        if (!name) return "";
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.length > 1 ? initials[0] + initials[initials.length - 1] : initials;
    }

    return (
        <div className="container clamp d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
                <h1 className="mb-5"><span style={{ color: '#1976d2' }}>doc</span><span className="text-danger">doc</span></h1>
                <img src="/images/icons/favicon.svg" alt="favicon" className="img-fluid mb-5" />
                {session && (
                    <p style={{ color: '#dc3545', fontSize: '20px' }}>select repo</p>
                )}
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
                                    {repositories.map(repo => (
                                        <option key={repo.id} value={repo.name}>{repo.name}</option>
                                    ))}
                                </select>
                            )}
                            {repoDetails && (
                                <div className="mt-4">
                                    <h3>Repository Details</h3>
                                    <p><strong>Languages:</strong> {Object.keys(repoDetails.languages).join(', ')}</p>
                                    <p><strong>Topics:</strong> {repoDetails.topics.names ? repoDetails.topics.names.join(', ') : 'No topics available'}</p>
                                </div>
                            )}
                            {/* {readme && (
                                <div className="mt-4">
                                    <h3>README</h3>
                                    <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{readme}</pre>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;

