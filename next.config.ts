import type { NextConfig } from "next";

// Enable dynamic base path for GitHub Pages subfolder deployments
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = '';
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '');
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: repo ? `/${repo}` : '',
  assetPrefix: repo ? `/${repo}/` : '',
};

export default nextConfig;
