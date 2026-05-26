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
    ];
  },
};

export default nextConfig;
