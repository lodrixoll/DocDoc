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
    let dependencies = null;

    for (const file of filesToCheck) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3.raw',
            },
        });

        if (response.ok) {
            dependencies = await response.text();
            break;
        }
    }

    if (!dependencies) {
        throw new Error('Failed to fetch dependencies');
    }

    return dependencies;
}