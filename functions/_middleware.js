export async function onRequest(context) {
  const url = new URL(context.request.url);
  let shouldRedirect = false;

  if (url.hostname.endsWith(".pages.dev")) {
    url.hostname = "ussalarytools.com";
    url.protocol = "https:";
    shouldRedirect = true;
  }

  let pathname = url.pathname;
  if (pathname.endsWith("/index.html")) {
    pathname = pathname.replace(/\/index\.html$/, "");
    shouldRedirect = true;
  } else if (pathname.endsWith(".html")) {
    pathname = pathname.replace(/\.html$/, "");
    shouldRedirect = true;
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    url.pathname = pathname || "/";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
