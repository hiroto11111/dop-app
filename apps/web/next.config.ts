import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@dop/domain", "@dop/pdf"],
  turbopack: {
    root: path.join(process.cwd(), "../..")
  }
};

export default nextConfig;
