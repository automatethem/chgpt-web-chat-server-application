/** @type {import('next').NextConfig} */
const dotenv = require('dotenv');
const path = require("path");

dotenv.config();

const nextConfig = {
  //reactStrictMode: true, 
  reactStrictMode: false, //개발 모드일 경우 useEffect가 두번 실행되는 것 방지
  swcMinify: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };

    return config;
  }
}

module.exports = nextConfig
