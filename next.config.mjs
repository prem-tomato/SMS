/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; script-src-elem 'self' 'unsafe-inline' https:; object-src 'none';",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
