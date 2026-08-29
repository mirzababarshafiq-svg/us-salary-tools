export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith(".pages.dev")) {
    url.hostname = "ussalarytools.com";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
