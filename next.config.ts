import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/lifecycle",
        destination: "/cis",
        permanent: false,
      },
      {
        source: "/lifecycle/:path*",
        destination: "/cis/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
