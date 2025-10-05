/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude problematic directories from webpack scanning
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/Application Data/**',
        'C:\\Users\\ASUS\\Application Data\\**',
      ],
    };
    
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
