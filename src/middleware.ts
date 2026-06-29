import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies } = context;

  // Protect routes starting with /dashboard or /submissions or /settings
  const protectedRoutes = ["/dashboard", "/submissions", "/settings"];
  
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    const session = cookies.get("session");
    console.log('Middleware: Checking session cookie for', url.pathname, 'Found:', !!session);
    if (!session) {
      return Response.redirect(new URL("/login", url), 302);
    }
  }

  return next();
});
