import type { NextConfig } from "next";

// 로컬 API 서버 주소입니다. 다른 주소를 쓰려면 API_URL 환경 변수로 바꿉니다.
const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  // 브라우저가 같은 출처(localhost:3000)의 /api로 요청하면 Next.js가 API 서버로 전달합니다.
  // 출처가 같으므로 CORS 설정이 필요 없습니다.
  // k8s에서는 Ingress가 /api 요청을 API Service로 먼저 보내므로 이 규칙까지 오지 않습니다.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
