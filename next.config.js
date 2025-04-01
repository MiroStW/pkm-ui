/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Properly handle server-only packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to resolve these server-only packages on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Native Node.js modules
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        crypto: false,
        stream: false,
        os: false,
        path: false,
        zlib: false,
      };
    }

    return config;
  },

  // Increase the timeout for tests
  staticPageGenerationTimeout: 180,
};

export default nextConfig;
