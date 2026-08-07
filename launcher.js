const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT || 3210);
const HOST = "127.0.0.1";
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = decoded === "/" ? "/index.html" : decoded;
  const normalized = path.normalize(cleaned).replace(/^([.][.][/\\])+/, "");
  return path.join(ROOT, normalized);
}

const server = http.createServer((req, res) => {
  const filePath = safePath(req.url || "/");
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Acces refuse");
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Fichier introuvable");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`  Tituplantus Nomen Plantae  -  ${url}`);
  console.log("  Fermer cette fenetre pour arreter.");
  console.log("");
  openAppWindow(url);
});

function tryCommand(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
    child.unref();
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
    // Si toujours vivant après 1s, considère OK
    setTimeout(() => resolve(true), 1000);
  });
}

async function openAppWindow(url) {
  let usedAppMode = false;

  // 1) Essaye Chrome/Chromium/Edge en mode --app (fenêtre épurée, sans barre)
  const chromeNames = process.platform === "win32"
    ? ["chrome", "edge"]
    : ["google-chrome", "chromium", "chromium-browser", "microsoft-edge", "chrome"];

  for (const name of chromeNames) {
    const ok = await tryCommand(name, [
      `--app=${url}`,
      "--window-size=1400,900",
    ]);
    if (ok) { usedAppMode = true; break; }
  }

  if (!usedAppMode) {
    // 2) Essaye Firefox en nouvelle fenêtre (pas de mode --app, mais propre)
    const ffNames = process.platform === "win32"
      ? ["firefox"]
      : ["firefox", "firefox-esr", "firefox-developer-edition"];

    for (const name of ffNames) {
      const ok = await tryCommand(name, ["--new-window", url]);
      if (ok) { usedAppMode = true; break; }
    }
  }

  // 3) Fallback : navigateur par défaut du système
  if (!usedAppMode) {
    console.log("  (ouverture dans le navigateur par défaut)");
    if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    } else {
      spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
    }
  }
}

function closeGracefully() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", closeGracefully);
process.on("SIGTERM", closeGracefully);
