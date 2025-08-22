import { auth } from "@/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (req.auth || path.startsWith("/api/")) {
    return;
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${req.nextUrl.origin}/api/auth/signin`,
    },
  });
});

export const config = {
  matcher: [
    "/((?!api/auth/signout|_next/static|_next/image|favicon.ico|manifest.json).*)",
  ],
};
