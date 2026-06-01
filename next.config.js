const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Allow @use 'styles/abstracts/tokens' as t; from any .module.scss
    includePaths: [path.join(__dirname, 'src')],
  },
};

module.exports = nextConfig;
