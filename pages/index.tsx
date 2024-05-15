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
    const [aiResponse, setAiResponse] = useState<string | null>(null);

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
            const fetchDetails = async () => {
                try {
                    const languages = await fetchRepositoryLanguages(session.login!, selectedRepo.name, session.accessToken!);
                    setRepoLanguages(languages);

                    const topics = await fetchRepositoryTopics(session.login!, selectedRepo.name, session.accessToken!);
                    setRepoTopics(topics);

                    const readme = await fetchReadme(session.login!, selectedRepo.name, session.accessToken!);
                    setReadme(readme);

                    const dependencies = await fetchDependencies(session.login!, selectedRepo.name, session.accessToken!);
                    setDependencies(dependencies);

                    // Send details to OpenAI
                    await sendDetailsToOpenAI({ languages, topics, readme, dependencies });
                } catch (error) {
                    console.error('Error fetching repository details:', error);
                }
            };

            fetchDetails();
        }
    }, [selectedRepo, session]);

    function getInitials(name: string | undefined): string {
        if (!name) return "";
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.length > 1 ? initials[0] + initials[initials.length - 1] : initials;
    }

    const sendDetailsToOpenAI = async (details: { languages: any, topics: any, readme: string | null, dependencies: string | null }) => {
        try {
            const prompt = `
                Determine the tech stack of the following repository. Provide your response as no more than 10 words.

                Languages: ${Object.keys(details.languages).join(', ')}
                Topics: ${details.topics.names ? details.topics.names.join(', ') : 'No topics available'}
                README: ${details.readme || 'No README available'}
                Dependencies: ${details.dependencies || 'No dependencies available'}
            `;

            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            const data = await response.json();
            setAiResponse(data.content);
        } catch (error) {
            console.error('Error sending details to OpenAI:', error);
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
                        </div>
                    )}
                </div>
                {aiResponse && (
                    <div className="mt-3">
                        <h3>AI Response</h3>
                        <p>{aiResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

