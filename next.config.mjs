/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Optional: if you want to allow http as well (not recommended)
        // protocol: "https", can be omitted if you want both http & https
        // pathname: "/**",  // optional – restricts to all paths under the host (default is all paths)
      },
    ],
  },
};

export default nextConfig;