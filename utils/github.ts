export async function fetchGitHubRepositories(accessToken: string) {
    const response = await fetch('https://api.github.com/user/repos', {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
}

export async function fetchRepositoryDetails(owner: string, repo: string, accessToken: string) {
    const [languages, topics] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
            headers: {
                Authorization: `token ${accessToken}`,
            },
        }).then(res => res.json()),
        fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.mercy-preview+json', // Required for topics API
            },
        }).then(res => res.json()),
    ]);

    return { languages, topics };
}

export async function fetchReadme(owner: string, repo: string, accessToken: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3.raw',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch README');
    }

    const readme = await response.text();
    return readme;
}