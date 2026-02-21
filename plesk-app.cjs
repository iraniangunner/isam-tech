const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const appRoot = process.cwd();
const fallbackMaintenanceHeadline = "Scheduled Platform Update";
const fallbackMaintenanceMessage =
  "ISAM is improving the web experience. We will be back online shortly.";

const candidateDocRoots = [
  process.env.PLESK_DOC_ROOT,
  path.resolve(appRoot, "frontend", "dist"),
].filter(Boolean);

const docRoot =
  candidateDocRoots.find((candidate) => {
    try {
      return fs.statSync(candidate).isDirectory();
    } catch {
      return false;
    }
  }) || candidateDocRoots[0];

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const immutableAssetPattern = /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/i;

const maintenanceBooleanKeys = ["MAINTENANCE_MODE", "VITE_MAINTENANCE_MODE"];
const maintenanceHeadlineKeys = ["MAINTENANCE_HEADLINE", "VITE_MAINTENANCE_HEADLINE"];
const maintenanceMessageKeys = ["MAINTENANCE_MESSAGE", "VITE_MAINTENANCE_MESSAGE"];
const maintenanceContactEmailKeys = [
  "MAINTENANCE_CONTACT_EMAIL",
  "VITE_MAINTENANCE_CONTACT_EMAIL",
];
const maintenanceAssetAllowList = new Set(["/img/isam-logo.png"]);

function readFirstEnvValue(keys, fallback = "") {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return fallback;
}

function readFirstEnvRaw(keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

function normalizeEnvValue(value) {
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseBooleanEnvValue(value) {
  return ["1", "true", "yes", "on"].includes(normalizeEnvValue(value).toLowerCase());
}

function readBooleanEnvWithSource(keys) {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === "string" && raw.trim() !== "") {
      return {
        sourceVar: key,
        raw,
        enabled: parseBooleanEnvValue(raw),
      };
    }
  }

  return {
    sourceVar: null,
    raw: "",
    enabled: false,
  };
}

function resolveRequestPathname(requestUrl) {
  const rawPath = (requestUrl || "/").split("?")[0] || "/";
  try {
    return {
      ok: true,
      pathname: decodeURIComponent(rawPath),
    };
  } catch {
    return {
      ok: false,
      pathname: "/",
    };
  }
}

function setMaintenanceHeader(res, maintenanceConfig) {
  res.setHeader("X-Maintenance-Mode", maintenanceConfig.enabled ? "on" : "off");
}

function getMaintenanceConfig() {
  const status = readBooleanEnvWithSource(maintenanceBooleanKeys);

  return {
    enabled: status.enabled,
    sourceVar: status.sourceVar,
    sourceValue: status.raw,
    headline: readFirstEnvValue(
      maintenanceHeadlineKeys,
      fallbackMaintenanceHeadline,
    ),
    message: readFirstEnvValue(
      maintenanceMessageKeys,
      fallbackMaintenanceMessage,
    ),
    contactEmail: readFirstEnvValue(maintenanceContactEmailKeys, ""),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMaintenancePage(config) {
  const headline = escapeHtml(config.headline || fallbackMaintenanceHeadline);
  const message = escapeHtml(config.message || fallbackMaintenanceMessage);
  const contactEmail = (config.contactEmail || "").trim();
  const contactSection = contactEmail
    ? `<p class="contact">Questions? <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(
        contactEmail,
      )}</a></p>`
    : "";
  const currentYear = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${headline}</title>
    <style>
      :root {
        --bg: #f6f7f8;
        --panel: #ffffff;
        --text: #171717;
        --muted: #525252;
        --border: #e5e5e5;
        --accent: #0a0a0a;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background:
          radial-gradient(circle at 15% 20%, rgb(23 23 23 / 6%), transparent 30%),
          radial-gradient(circle at 85% 10%, rgb(115 115 115 / 10%), transparent 45%),
          var(--bg);
        color: var(--text);
        font-family: "Plus Jakarta Sans", "Open Sans", sans-serif;
      }
      .card {
        width: min(760px, 100%);
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--panel);
        padding: 2.8rem;
        box-shadow: 0 25px 40px rgb(0 0 0 / 10%);
        text-align: center;
      }
      .logo {
        width: min(220px, 50%);
        margin: 0 auto 1rem;
      }
      .kicker {
        margin: 0 0 0.9rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        font-size: 0.82rem;
        color: var(--muted);
      }
      h1 {
        margin: 0;
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 1.1;
        color: var(--accent);
      }
      .message {
        margin: 1rem auto 0;
        color: var(--muted);
        font-size: 1.04rem;
        line-height: 1.7;
        max-width: 56ch;
      }
      .contact {
        margin: 1.35rem 0 0;
        color: var(--muted);
      }
      a {
        color: var(--accent);
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }
      .footer {
        margin: 1.25rem 0 0;
        font-size: 0.85rem;
        color: #737373;
      }
      @media (max-width: 680px) {
        .card { padding: 1.8rem; }
        .logo { width: min(180px, 60%); }
      }
    </style>
  </head>
  <body>
    <main class="card" aria-labelledby="maintenance-title">
      <img class="logo" src="/img/isam-logo.png" alt="ISAM logo" />
      <p class="kicker">ISAM</p>
      <h1 id="maintenance-title">${headline}</h1>
      <p class="message">${message}</p>
      ${contactSection}
      <p class="footer">&copy; ${currentYear} ISAM. All rights reserved.</p>
    </main>
  </body>
</html>`;
}

function sendMaintenancePage(res, config, method) {
  const statusCode = 503;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  if (method === "HEAD") {
    res.end();
    return;
  }
  res.end(renderMaintenancePage(config));
}

function resolvePathFromRequest(pathname) {
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const resolved = path.resolve(docRoot, `.${relativePath}`);
  const normalizedRoot = path.resolve(docRoot);
  if (!resolved.startsWith(normalizedRoot)) return null;
  return resolved;
}

function setCacheHeaders(res, requestPath, extension) {
  if (extension === ".html") {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    return;
  }

  if (immutableAssetPattern.test(requestPath)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=86400");
}

function sendFile(filePath, requestPath, res) {
  const extension = path.extname(filePath).toLowerCase();
  const type = mimeTypes[extension] || "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("Content-Type", type);
  setCacheHeaders(res, requestPath, extension);
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const pathResolution = resolveRequestPathname(req.url);
  const method = (req.method || "GET").toUpperCase();
  const maintenanceConfig = getMaintenanceConfig();

  setMaintenanceHeader(res, maintenanceConfig);

  if (!pathResolution.ok) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Bad request");
    return;
  }

  const pathname = pathResolution.pathname;

  if (pathname === "/__maintenance-status") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        enabled: maintenanceConfig.enabled,
        sourceVar: maintenanceConfig.sourceVar,
        pid: process.pid,
        uptimeSeconds: Number(process.uptime().toFixed(3)),
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  if (pathname === "/healthz" || pathname === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("ok");
    return;
  }

  if (
    maintenanceConfig.enabled &&
    (method === "GET" || method === "HEAD") &&
    !maintenanceAssetAllowList.has(pathname)
  ) {
    sendMaintenancePage(res, maintenanceConfig, method);
    return;
  }

  const requestedPath = resolvePathFromRequest(pathname);
  if (!requestedPath) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Bad request");
    return;
  }

  fs.stat(requestedPath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(requestedPath, pathname, res);
      return;
    }

    if (!err && stats.isDirectory()) {
      const nestedIndexPath = path.resolve(requestedPath, "index.html");
      fs.stat(nestedIndexPath, (nestedErr, nestedStats) => {
        if (!nestedErr && nestedStats.isFile()) {
          sendFile(nestedIndexPath, `${pathname}/index.html`, res);
          return;
        }

        const indexPath = path.resolve(docRoot, "index.html");
        fs.stat(indexPath, (indexErr, indexStats) => {
          if (!indexErr && indexStats.isFile()) {
            sendFile(indexPath, "/index.html", res);
            return;
          }

          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Not found");
        });
      });
      return;
    }

    const indexPath = path.resolve(docRoot, "index.html");
    fs.stat(indexPath, (indexErr, indexStats) => {
      if (!indexErr && indexStats.isFile()) {
        sendFile(indexPath, "/index.html", res);
        return;
      }

      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Not found");
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  const startupMaintenanceConfig = getMaintenanceConfig();
  console.log(`[plesk-app] Listening on port ${port}`);
  console.log(`[plesk-app] Serving static files from ${docRoot}`);
  console.log(
    `[plesk-app] Maintenance mode: ${
      startupMaintenanceConfig.enabled ? "enabled" : "disabled"
    } (source: ${startupMaintenanceConfig.sourceVar || "none"})`,
  );
});
