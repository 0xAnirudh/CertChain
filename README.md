# 🔗 CertChain — Blockchain Certificate Verification System

A tamper-proof digital certificate issuance and verification system built with a custom blockchain implementation, SHA-256 hashing, QR codes, and a clean dark-terminal UI.

---

## ✨ Features

- **Custom Blockchain** — Linked blocks with SHA-256 hashing + proof-of-work mining (no external chain required)
- **Certificate Issuance** — Issue certificates with student name, course, issuer, date, and grade
- **QR Code Generation** — Each certificate gets a scannable QR pointing to its verification URL
- **Tamper Detection** — Any modification to block data breaks the hash chain and is detected instantly
- **Chain Explorer** — Visual blockchain inspector showing all blocks and their cryptographic links
- **Single-Page Frontend** — Dark terminal aesthetic, no React required

---

## 📁 Project Structure

```
blockchain-cert/
├── backend/
│   ├── server.js           # Express server + static file serving
│   ├── blockchain.js       # Custom Block & Blockchain classes (SHA-256)
│   ├── routes/
│   │   └── certificates.js # REST API endpoints
│   └── package.json
├── frontend/
│   └── index.html          # SPA — Issue / Verify / Explorer tabs
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- npm

### 1. Install Dependencies

```bash
cd blockchain-cert/backend
npm install
```

### 2. Start the Server

```bash
npm start
# or for hot-reload during development:
npm run dev
```

The server starts at: **http://localhost:3000**

---

## 🔌 REST API Reference

### `POST /api/issue`
Issue a new certificate and add a block to the blockchain.

**Request body:**
```json
{
  "studentName": "Anirudh Chourey",
  "course": "Information Technology",
  "issuer": "UIETH, PUSSGRC",
  "date": "16-08-2023",
  "grade": "distinction"
}
```

**Response:**
```json
{
  "success": true,
  "certificate": {
    "certificateId": "uuid-v4",
    "studentName": "Anirudh Chourey",
    "blockHash": "sha256hex...",
    "blockIndex": 1,
    "timestamp": "ISO-8601"
  },
  "qrCode": "data:image/png;base64,...",
  "verifyUrl": "http://localhost:3000/verify/<hash>"
}
```

---

### `GET /api/verify/:hash`
Verify a certificate by its SHA-256 block hash.

**Response (valid):**
```json
{
  "valid": true,
  "status": "VERIFIED",
  "certificate": { "studentName": "...", "course": "...", ... },
  "chainIntegrity": "INTACT"
}
```

---

### `GET /api/chain`
Returns the full blockchain (all blocks + stats).

---

### `GET /api/chain/validate`
Validates the entire blockchain integrity.

```json
{ "valid": true, "stats": { "totalBlocks": 5, "totalCertificates": 4 } }
```

---

## 🔐 How the Blockchain Works

```
┌─────────────────────────────────┐
│  GENESIS BLOCK (#0)             │
│  hash: 00a3f9bc...              │
│  prevHash: "0"                  │
└────────────────┬────────────────┘
                 │ prevHash links →
┌────────────────▼────────────────┐
│  BLOCK #1  [Certificate]        │
│  student: Anirudh Chourey       │
│  hash: 00b72e1a...              │
│  prevHash: 00a3f9bc...          │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│  BLOCK #2  [Certificate]        │
│  student: Piyush Maurya         │
│  hash: 00c41d88...              │
│  prevHash: 00b72e1a...          │
└─────────────────────────────────┘
```

- Each block's **hash** is computed from: `index + timestamp + certData + previousHash + nonce`
- If anyone modifies a certificate, the hash changes → the next block's `previousHash` no longer matches → **chain invalid**
- Proof-of-work (difficulty=2): hashes must start with `00` to be accepted

---

## 🛡️ Security Design

| Feature | Implementation |
|---|---|
| Immutability | SHA-256 hash of all block data |
| Chain linking | `previousHash` field in every block |
| Tamper detection | `validateChain()` recomputes every hash |
| Proof of work | Mining loop with difficulty prefix |
| QR verification | URL contains the unique block hash |

---

## 🖼️ Using QR Codes

1. Issue a certificate → a QR code is generated
2. The QR encodes: `http://your-domain/verify/<sha256-hash>`
3. Anyone can scan the QR → frontend auto-verifies the certificate
4. No account needed to verify — fully public

---

## 🔧 Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `difficulty` | `2` | Proof-of-work difficulty |

Set `PORT` via environment:
```bash
PORT=8080 npm start
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `cors` | Cross-origin requests |
| `qrcode` | QR code generation |
| `uuid` | Unique certificate IDs |

---

## 🚀 Production Deployment

1. Update `BASE_URL` in `frontend/index.html` to your domain
2. Optionally add MongoDB (replace in-memory chain with persistent storage)
3. Add JWT auth for the admin `/issue` endpoint
4. Deploy backend to Railway, Render, or VPS
5. Serve frontend via nginx or Vercel
