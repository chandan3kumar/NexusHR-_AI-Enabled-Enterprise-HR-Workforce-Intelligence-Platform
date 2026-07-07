const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const port = Number(process.argv[2] || process.env.PORT || 3000);
const root = __dirname;
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:8081";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  if (url.pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      response.writeHead(204, apiHeaders(request));
      response.end();
      return;
    }
    proxyApi(request, response, url);
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      ...securityHeaders()
    });
    response.end(content);
  });
});

function proxyApi(request, response, url) {
  const target = new URL(url.pathname + url.search, backendOrigin);
  const client = target.protocol === "https:" ? https : http;
  const { host, origin, referer, ...forwardHeaders } = request.headers;
  const proxyRequest = client.request(target, {
    method: request.method,
    headers: {
      ...forwardHeaders,
      host: target.host
    }
  }, proxyResponse => {
    response.writeHead(proxyResponse.statusCode || 500, {
      ...safeProxyHeaders(proxyResponse.headers),
      ...apiHeaders(request)
    });
    proxyResponse.pipe(response);
  });

  proxyRequest.on("error", error => {
    console.error(`Proxy error for ${target.href}: ${error.message}`);
    response.writeHead(502, {
      "Content-Type": "application/json; charset=utf-8",
      ...apiHeaders(request)
    });
    response.end(JSON.stringify({
      message: "Service is unavailable"
    }));
  });

  request.pipe(proxyRequest);
}

function safeProxyHeaders(headers) {
  const blocked = new Set([
    "access-control-allow-origin",
    "access-control-allow-methods",
    "access-control-allow-headers",
    "access-control-allow-credentials",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy"
  ]);
  return Object.fromEntries(
    Object.entries(headers).filter(([key]) => !blocked.has(key.toLowerCase()))
  );
}

function apiHeaders(request) {
  const allowedOrigin = `http://localhost:${port}`;
  const origin = request.headers.origin;
  return {
    ...(origin === allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    ...securityHeaders()
  };
}

function securityHeaders() {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  };
}

server.listen(port, () => {
  console.log(`NexusHR frontend running at http://localhost:${port}`);
});
