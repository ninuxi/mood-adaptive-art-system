/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Enable webpack 5 optimizations
  webpack: (config, { isServer }) => {
    // Add support for importing audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|flac)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media/',
          outputPath: `${isServer ? '../' : ''}static/media/`,
        },
      },
    });

    // Optimize for performance
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  // Environment variables for development
  env: {
    CUSTOM_KEY: 'mood-development',
  },
  // Optimize bundle analysis
  generateBuildId: async () => {
    return `mood-${new Date().toISOString().split('T')[0]}`;
  },
};

module.exports = nextConfig;