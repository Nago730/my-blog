import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 관리자 권한이 필요한 경로 패턴
const ADMIN_PATHS = ['/admin', '/admin/write', '/admin/projects/write'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 경로인지 확인
  const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path));

  if (isAdminPath) {
    const session = request.cookies.get('__session')?.value;

    // 세션 쿠키가 없으면 바로 404로 rewrite (URL은 유지되지만 내용은 404)
    if (!session) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    try {
      // 미들웨어(Edge Runtime)에서는 firebase-admin을 직접 쓰기 어렵습니다.
      // 여기서는 토큰의 존재 여부만 1차로 확인하고, 
      // 실제 데이터 조작(Server Actions)에서 firebase-admin으로 완벽하게 검증합니다.

      // 보안을 더 강화하고 싶다면 여기서 JWT를 디코딩하여 이메일을 확인할 수 있습니다.
      // 하지만 서명(Signature) 검증 없이 이메일만 보는 것은 변조 가능성이 있으므로 
      // "존재 여부"만 확인하고 404 처리를 하는 것이 현재 최선입니다.

      return NextResponse.next();
    } catch (error) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
