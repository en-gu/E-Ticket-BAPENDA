/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Silence multi-lockfile workspace warning
    root: __dirname,
  },

  // Headers keamanan
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
