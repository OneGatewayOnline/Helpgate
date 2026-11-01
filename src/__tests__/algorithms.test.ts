// Algorithmic Unit Tests for HelpGate
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// 1. GST Calculation Tests
describe('GST Calculations', () => {
  function computeGstExclusive(amount: number, rate: number) {
    const net = amount;
    const gst = (amount * rate) / 100;
    const total = net + gst;
    return { net, gst, total };
  }

  function computeGstInclusive(amount: number, rate: number) {
    const total = amount;
    const net = (amount * 100) / (100 + rate);
    const gst = total - net;
    return { net, gst, total };
  }

  it('18% GST Exclusive on ₹10,000', () => {
    const res = computeGstExclusive(10000, 18);
    assert.equal(res.net, 10000);
    assert.equal(res.gst, 1800);
    assert.equal(res.total, 11800);
  });

  it('18% GST Inclusive on ₹11,800 extracts base ₹10,000', () => {
    const res = computeGstInclusive(11800, 18);
    assert.equal(Math.round(res.net), 10000);
    assert.equal(Math.round(res.gst), 1800);
    assert.equal(res.total, 11800);
  });

  it('5% GST Exclusive on ₹1,000', () => {
    const res = computeGstExclusive(1000, 5);
    assert.equal(res.gst, 50);
    assert.equal(res.total, 1050);
  });
});

// 2. Unicode Base64 Encoding Tests
describe('Base64 Unicode Encoding & Decoding', () => {
  function utf8ToBase64(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToUtf8(base64Str: string): string {
    const binary = atob(base64Str.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  it('Correctly round-trips ASCII strings', () => {
    const original = 'HelpGate 100% Free Technology';
    const encoded = utf8ToBase64(original);
    const decoded = base64ToUtf8(encoded);
    assert.equal(decoded, original);
  });

  it('Correctly round-trips Unicode emojis and multilingual text without corruption', () => {
    const original = 'One Gateway Online 🚀 नमस्ते 🌟 مرحبا';
    const encoded = utf8ToBase64(original);
    const decoded = base64ToUtf8(encoded);
    assert.equal(decoded, original);
  });
});

// 3. UUID v4 RFC 4122 Compliance Tests
describe('UUID v4 Structure', () => {
  it('Generated UUID matches RFC 4122 pattern', () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const id = crypto.randomUUID();
    assert.equal(uuidPattern.test(id), true);
  });
});
