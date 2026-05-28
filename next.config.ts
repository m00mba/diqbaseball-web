import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "admin.diqbaseball.com" }],
        destination: "/admin/login",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "host", value: "admin.iqbio.io" }],
        destination: "/admin/login",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "host", value: "player.iqbio.io" }],
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
