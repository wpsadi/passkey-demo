import { NextResponse } from 'next/server'
import SetupDB from './models/server/SetupDB'


// This function can be marked `async` if using `await` inside
export async function middleware() {
  
  await Promise.all([
    SetupDB()
  ])
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  /* match all request paths except for the the ones that starts with:
  - api
  - _next/static
  - _next/image
  - favicon.com

  */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}