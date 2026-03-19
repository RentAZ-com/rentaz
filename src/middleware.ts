import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Let all pages through - auth is handled client-side in each page
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
