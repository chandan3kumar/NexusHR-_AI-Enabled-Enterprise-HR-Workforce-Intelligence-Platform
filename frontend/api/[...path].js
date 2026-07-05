const http = require("http");
const https = require("https");

module.exports = function handler(req, res) {
  const backendOrigin = process.env.BACKEND_ORIGIN;

  if (!backendOrigin) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "BACKEND_ORIGIN is not configured." }));
    return;
  }

  const target = new URL(req.url, backendOrigin);
  const client = target.protocol === "https:" ? https : http;
  const { host, origin, referer, ...headers } = req.headers;

  const proxyRequest = client.request(
    target,
    {
      method: req.method,
      headers: {
        ...headers,
        host: target.host
      }
    },
    (proxyResponse) => {
      res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(res);
    }
  );

  proxyRequest.on("error", () => {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Backend is unavailable." }));
  });

  req.pipe(proxyRequest);
};
