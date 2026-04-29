/**
 * blockchain.js
 * Core blockchain implementation for certificate verification.
 * Uses SHA-256 hashing and linked blocks to ensure tamper-proof storage.
 */

const crypto = require("crypto");

// ─────────────────────────────────────────────
//  Block Class
//  Each block represents one issued certificate.
// ─────────────────────────────────────────────
class Block {
  constructor(index, certificateData, previousHash = "0") {
    this.index = index;
    this.timestamp = new Date().toISOString();
    this.certificateData = certificateData; // { studentName, course, issuer, date, certificateId }
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * Compute SHA-256 hash of the block's contents.
   * Any change to data will produce a completely different hash,
   * breaking the chain integrity.
   */
  calculateHash() {
    const content =
      this.index +
      this.timestamp +
      JSON.stringify(this.certificateData) +
      this.previousHash +
      this.nonce;

    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Simple proof-of-work: mine until hash starts with difficulty prefix.
   * Keeps the blockchain concept authentic without heavy computation.
   */
  mineBlock(difficulty = 2) {
    const prefix = "0".repeat(difficulty);
    while (!this.hash.startsWith(prefix)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

// ─────────────────────────────────────────────
//  Blockchain Class
//  Manages the chain of certificate blocks.
// ─────────────────────────────────────────────
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Proof-of-work difficulty
  }

  /** Genesis block — the first block, with no certificate data. */
  createGenesisBlock() {
    return new Block(
      0,
      { studentName: "GENESIS", course: "GENESIS", issuer: "SYSTEM", date: "2024-01-01" },
      "0"
    );
  }

  /** Returns the most recently added block. */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Issue a new certificate by adding a block to the chain.
   * @param {Object} certData - Certificate payload
   * @returns {Block} The newly created block
   */
  issueCertificate(certData) {
    const newBlock = new Block(
      this.chain.length,
      certData,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Look up a certificate block by its SHA-256 hash.
   * @param {string} hash - The block hash to search for
   * @returns {Block|null} The matching block, or null
   */
  getCertificateByHash(hash) {
    return this.chain.find((block) => block.hash === hash) || null;
  }

  /**
   * Look up a certificate by certificateId inside certData.
   * @param {string} certId
   */
  getCertificateById(certId) {
    return (
      this.chain.find(
        (block) =>
          block.certificateData && block.certificateData.certificateId === certId
      ) || null
    );
  }

  /**
   * Validate the entire blockchain.
   * Checks:
   *  1. Each block's stored hash matches its recalculated hash.
   *  2. Each block's previousHash matches the prior block's hash.
   * @returns {{ valid: boolean, error?: string }}
   */
  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Recompute hash from scratch and compare
      const recomputed = new Block(
        current.index,
        current.certificateData,
        current.previousHash
      );
      recomputed.timestamp = current.timestamp;
      recomputed.nonce = current.nonce;
      const recomputedHash = recomputed.calculateHash();

      if (current.hash !== recomputedHash) {
        return {
          valid: false,
          error: `Block #${i} has been tampered with. Hash mismatch.`,
        };
      }

      if (current.previousHash !== previous.hash) {
        return {
          valid: false,
          error: `Block #${i} is broken from its predecessor. Chain compromised.`,
        };
      }
    }
    return { valid: true };
  }

  /**
   * Return summary statistics about the chain.
   */
  getChainStats() {
    return {
      totalBlocks: this.chain.length,
      totalCertificates: this.chain.length - 1, // exclude genesis
      isValid: this.validateChain().valid,
      latestHash: this.getLatestBlock().hash,
    };
  }

  /** Return the full chain (for admin inspection). */
  getFullChain() {
    return this.chain;
  }
}

module.exports = { Block, Blockchain };
