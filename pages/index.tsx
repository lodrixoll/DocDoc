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
    const [aiLoading, setAiLoading] = useState(false);

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
            setAiLoading(true);
            const prompt = `
            Your task is to determine the tech stack of the following repository. 
            You will be provided with the detected programming languages, topics (if any), README (if any), and dependencies (if any) of the repository to assist in determining the tech stack.
            Your response should contain languages, JavaScript frameworks, CSS frameworks, and databases (if present) but should not contain small libraries.
            Your response will be used to assist the user in installing technical SaaS products within their project so being accurate is paramount.
            Be concise and provide your response as no more than 10 words.
            Some example responses are:
            - Next.js, TypeScript, and Tailwind CSS
            - React, TypeScript, and Material-UI
            - Node.js, Express, and MongoDB
            - Laravel, Livewire, and Tailwind CSS
            - Django, Bootstrap, and PostgreSQL
            - Angular, RxJS, and NgRx
            - Vue.js, Vuex, and Vuetify
            - Ruby on Rails, PostgreSQL, and Redis
            - Spring Boot, Thymeleaf, and MySQL
            - Flask, SQLAlchemy, and SQLite
            - Python, Tensorflow, Keras
            - Python

                Languages: ${Object.keys(details.languages).join(', ')}
                Topics: ${details.topics.names ? details.topics.names.join(', ') : 'No topics available'}
                README: ${details.readme || 'No README available'}
                Dependencies: ${details.dependencies || 'No dependencies available'}
            `;

            console.log("Prompt:", prompt);

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
        } finally {
            setAiLoading(false);
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
                                <div className="spinner-border text-danger" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
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
                {aiLoading ? (
                    <div className="spinner-border text-danger mt-3" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    aiResponse && (
                        <div className="mt-3">
                            <h3>AI Response</h3>
                            <p>{aiResponse}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Home;

