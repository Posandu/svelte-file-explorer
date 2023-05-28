import fs from 'fs';

// Function to retrieve the directory structure of a GitHub repository
async function getGitHubRepoDirectory(owner, repo, path = '') {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return parseGitHubRepoDirectory(data, owner, repo);
    } catch (error) {
        console.error('Error retrieving GitHub repository directory:', error);
    }
}

// Function to parse the GitHub repository directory and generate the JSON object
async function parseGitHubRepoDirectory(data, owner, repo) {
    const directory = {
        name: data[0].name,
        type: 'directory',
        children: []
    };

    for (const item of data) {
        if (item.type === 'dir') {
            const subdirectory = await getGitHubRepoDirectory(owner, repo, item.path);
            directory.children.push(subdirectory);
        } else {
            const file = {
                name: item.name,
                type: 'file',
                children: [],
                properties: {
                    contentURL: item.download_url
                }
            };
            directory.children.push(file);
        }
    }

    return directory;
}

// Specify the owner, repository name, and path (optional, leave empty for the root directory)
const owner = 'yashash-pugalia';
const repo = 'win11svelte';
const path = '';

// Retrieve the GitHub repository directory and log the JSON object
getGitHubRepoDirectory(owner, repo, path)
    .then(directory => {
        console.log(directory);
        fs.writeFileSync('directory.json', JSON.stringify(directory));
    })
    .catch(error => {
        console.error('Error:', error);
    });
