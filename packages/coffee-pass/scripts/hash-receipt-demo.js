#!/usr/bin/env node
const crypto = require('crypto');
const id = process.argv[2];
if (!id) { console.log('usage: node hash-receipt-demo.js <receipt-id>'); process.exit(0); }
const h = crypto.createHash('sha256').update(String(id).trim().toLowerCase()).digest('hex').slice(0, 16);
console.log('receipt_fingerprint', h);
