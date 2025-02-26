// /scripts/generate-contents.js

const fs = require('fs');
const fetch = require('node-fetch');  // Node 18 ke case mein native fetch available ho sakta hai, par safe side ke liye node-fetch install karo.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // GitHub Actions automatically provide karta hai GITHUB_TOKEN
const OWNER = 'webkmsyed';
const REPO = 'chai-code-cohort';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/`;

// Jo files/folders ignore karne hain
const ignoreList = ['LICENSE', 'README.md', '.gitignore', 'index.html'];

// Function: Fetch folder contents from GitHub API for a given path
async function fetchFolder(path = '') {
  const url = API_BASE + path;
  const res = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
}

// Recursive function to fetch all items (files & folders) in a given path
async function fetchAllItems(path = '') {
  let results = [];
  const contents = await fetchFolder(path);
  for (const item of contents) {
    if (ignoreList.includes(item.name)) continue;
    results.push(item);
    if (item.type === 'dir') {
      const subItems = await fetchAllItems(item.path);
      results = results.concat(subItems);
    }
  }
  return results;
}

// Main function to generate JSON file
async function main() {
  try {
    const allItems = await fetchAllItems('');
    // Ensure data folder exists
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data');
    }
    fs.writeFileSync('data/contents.json', JSON.stringify(allItems, null, 2));
    console.log('Contents JSON generated successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
