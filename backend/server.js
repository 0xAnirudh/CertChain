/**
 * server.js
 * Main Express server — sets up middleware, routes, and static files.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { Blockchain } = require("./blockchain");
const { router: certRouter, setBlockchain } = require("./routes/certificates");

const app = express();
const PORT = 3001;

// ─── Initialise the blockchain singleton ────────────────────────────────────
const blockchain = new Blockchain();
setBlockchain(blockchain); // inject into routes

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve the frontend static files ────────────────────────────────────────
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const frontendSourcePath = path.join(__dirname, "../frontend");
const frontendStaticPath = fs.existsSync(frontendDistPath)
  ? frontendDistPath
  : frontendSourcePath;
const frontendIndexPath = fs.existsSync(path.join(frontendDistPath, "index.html"))
  ? path.join(frontendDistPath, "index.html")
  : path.join(frontendSourcePath, "index.html");

app.use(express.static(frontendStaticPath));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api", certRouter);

// ─── Verification redirect (from QR code) ───────────────────────────────────
// QR codes point to /verify/:hash — serve the frontend SPA and let
// JS on the client read the hash from the URL.
app.get("/verify/:hash", (req, res) => {
  res.sendFile(frontendIndexPath);
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    blockchain: blockchain.getChainStats(),
  });
});

// ─── Catch-all: serve frontend for any unmatched route ───────────────────────
app.get("*", (req, res) => {
  res.sendFile(frontendIndexPath);
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔗 Blockchain Certificate System running`);
  console.log(`   ➜  http://localhost:${PORT}`);
  console.log(`   ➜  API: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
