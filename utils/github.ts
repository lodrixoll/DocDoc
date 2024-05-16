export async function fetchGitHubRepositories(accessToken: string) {
    const response = await fetch('https://api.github.com/user/repos', {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
}

export async function fetchRepositoryLanguages(owner: string, repo: string, accessToken: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repository languages');
    }

    const languages = await response.json();
    return languages;
}

export async function fetchRepositoryTopics(owner: string, repo: string, accessToken: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
        headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.mercy-preview+json', // Required for topics API
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repository topics');
    }

    const topics = await response.json();
    return topics;
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

// need to add deep directory integration. 
// will fail for projects with /src or /ui directories
//
//
export async function fetchDependencies(owner: string, repo: string, accessToken: string) {
    const filesToCheck = [
        'package.json', 'yarn.lock', // JavaScript/TypeScript
        'requirements.txt', 'Pipfile', 'pyproject.toml', // Python
        'Gemfile', 'Gemfile.lock', // Ruby
        'pom.xml', 'build.gradle', // Java
        'composer.json', 'composer.lock', // PHP
        'Cargo.toml', 'Cargo.lock', // Rust
        'go.mod', 'go.sum', // Go
        '*.csproj', '*.fsproj', '*.vbproj', // .NET
        'mix.exs', // Elixir
        'CMakeLists.txt', 'Makefile', // C/C++
        'stack.yaml', 'cabal.project', // Haskell
        'cpanfile', // Perl
        'DESCRIPTION', 'renv.lock', // R
        'build.sbt', // Scala
        'rebar.config', // Erlang
        'pubspec.yaml', // Dart
        'Package.swift', // Swift
        'Podfile', // Objective-C
        'build.gradle.kts', // Kotlin
        'Project.toml', 'Manifest.toml', // Julia
        'project.clj', 'deps.edn', // Clojure
        'dune', // OCaml
        'shard.yml' // Shell (Crystal)
    ];

    const fetchFile = async (file: string) => {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3.raw',
            },
        });

        if (response.ok) {
            return await response.text();
        }
        return null;
    };

    const fetchPromises = filesToCheck.map(file => fetchFile(file));
    const results = await Promise.all(fetchPromises);
    const dependencies = results.find(result => result !== null);

    return dependencies || null;
}


// ---------- Experimenting ----------
//
//
export async function fetchRepositoryCommits(owner: string, repo: string, accessToken: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repository commits');
    }

    const commits = await response.json();
    return commits;
}

export async function fetchRepositoryPullRequests(owner: string, repo: string, accessToken: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, { // fetch all pull requests
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repository pull requests');
    }

    const pullRequests = await response.json();
    return pullRequests;
}

export async function fetchRepositoryIssues(owner: string, repo: string, accessToken: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repository issues');
    }

    const issues = await response.json();
    return issues;
}

export async function fetchEnvFiles(owner: string, repo: string, accessToken: string): Promise<string | null> {
    const envFiles = [
        '.env.example', '.env.sample', '.env',
        '.env.development', '.env.production', '.env.local', '.env.test'
    ];
    const directories = ['', 'config/', 'env/', 'environments/'];

    const fetchFile = async (filePath: string): Promise<string | null> => {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3.raw',
            },
        });

        if (response.ok) {
            return await response.text();
        }
        return null;
    };

    for (const dir of directories) {
        for (const file of envFiles) {
            const content = await fetchFile(`${dir}${file}`);
            if (content) {
                return content;
            }
        }
    }

    return null;
}

export async function searchEnvFilesRecursively(owner: string, repo: string, accessToken: string, path: string = ''): Promise<string | null> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
    }

    const items = await response.json();
    for (const item of items) {
        if (item.type === 'file' && item.name.startsWith('.env')) {
            const content = await fetchEnvFiles(owner, repo, accessToken);
            if (content) {
                return content;
            }
        } else if (item.type === 'dir') {
            const content = await searchEnvFilesRecursively(owner, repo, accessToken, item.path);
            if (content) {
                return content;
            }
        }
    }

    return null;
}