/**
 * routes/certificates.js
 * REST API endpoints for certificate issuance and verification.
 */

const express = require("express");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const router = express.Router();

const ADMIN_USERNAME = "anirudhchourey";
const ADMIN_PASSWORD = "Anirudhc@8c";
const adminSessions = new Set();

// ─── Shared blockchain instance (injected from server.js) ───────────────────
let blockchain;
const setBlockchain = (bc) => { blockchain = bc; };

function getAuthToken(req) {
  const headerToken = req.headers["x-admin-token"];
  if (typeof headerToken === "string" && headerToken.trim()) {
    return headerToken.trim();
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return "";
}

function requireAdmin(req, res, next) {
  const token = getAuthToken(req);
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({
      success: false,
      error: "You need to login as admin to access this feature.",
    });
  }

  next();
}

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: "Invalid admin credentials.",
    });
  }

  const token = crypto.randomBytes(24).toString("hex");
  adminSessions.add(token);

  res.json({
    success: true,
    token,
    username: ADMIN_USERNAME,
  });
});

router.get("/auth/status", (req, res) => {
  const token = getAuthToken(req);
  res.json({
    success: true,
    isAdmin: Boolean(token && adminSessions.has(token)),
  });
});

router.post("/auth/logout", (req, res) => {
  const token = getAuthToken(req);
  if (token) {
    adminSessions.delete(token);
  }

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/issue
//  Issue a new certificate and mint a blockchain block.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/issue", requireAdmin, async (req, res) => {
  try {
    const { studentName, course, issuer, date, grade } = req.body;

    // Input validation
    if (!studentName || !course || !issuer || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: studentName, course, issuer, date",
      });
    }

    // Validate chain integrity before issuing
    const integrity = blockchain.validateChain();
    if (!integrity.valid) {
      return res.status(500).json({
        success: false,
        error: "Blockchain integrity compromised. Cannot issue certificate.",
        details: integrity.error,
      });
    }

    // Build certificate payload
    const certificateId = uuidv4();
    const certData = {
      certificateId,
      studentName: studentName.trim(),
      course: course.trim(),
      issuer: issuer.trim(),
      date,
      grade: grade?.trim() || "Pass",
      issuedAt: new Date().toISOString(),
    };

    // Mint the block (includes proof-of-work mining)
    const block = blockchain.issueCertificate(certData);

    // Generate QR code containing verification URL
    // In production, replace localhost with your deployed domain
    const verifyUrl = `${req.protocol}://${req.get("host")}/verify/${block.hash}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0f172a", light: "#f8fafc" },
    });

    res.status(201).json({
      success: true,
      message: "Certificate issued and recorded on the blockchain.",
      certificate: {
        ...certData,
        blockHash: block.hash,
        blockIndex: block.index,
        timestamp: block.timestamp,
        previousHash: block.previousHash,
      },
      qrCode: qrCodeDataUrl,
      verifyUrl,
    });
  } catch (err) {
    console.error("Issue error:", err);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/verify/:hash
//  Verify a certificate by its block hash.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/verify/:hash", (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length !== 64) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Invalid hash format. Expected 64-character SHA-256 hex string.",
      });
    }

    // Validate chain integrity first
    const integrity = blockchain.validateChain();
    if (!integrity.valid) {
      return res.status(200).json({
        success: true,
        valid: false,
        status: "CHAIN_COMPROMISED",
        error: integrity.error,
      });
    }

    // Look up the block
    const block = blockchain.getCertificateByHash(hash);
    if (!block || block.index === 0) {
      return res.status(200).json({
        success: true,
        valid: false,
        status: "NOT_FOUND",
        message: "No certificate found with this hash.",
      });
    }

    res.json({
      success: true,
      valid: true,
      status: "VERIFIED",
      certificate: {
        ...block.certificateData,
        blockHash: block.hash,
        blockIndex: block.index,
        timestamp: block.timestamp,
        previousHash: block.previousHash,
      },
      chainIntegrity: "INTACT",
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/chain
//  Return the full blockchain (admin use).
// ─────────────────────────────────────────────────────────────────────────────
router.get("/chain", requireAdmin, (req, res) => {
  const stats = blockchain.getChainStats();
  res.json({
    success: true,
    stats,
    chain: blockchain.getFullChain(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/chain/validate
//  Validate the integrity of the entire blockchain.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/chain/validate", requireAdmin, (req, res) => {
  const result = blockchain.validateChain();
  const stats = blockchain.getChainStats();
  res.json({
    success: true,
    ...result,
    stats,
  });
});

module.exports = { router, setBlockchain };
