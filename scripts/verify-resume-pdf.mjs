import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const pdfPath = resolve(process.cwd(), 'public/assets/resume.pdf');
assert.ok(existsSync(pdfPath), 'public/assets/resume.pdf must exist');
assert.ok(statSync(pdfPath).size > 10000, 'PDF size must be greater than 10KB');

// Run pdfinfo to verify exactly 2 A4 pages
const pdfinfoOut = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf-8' });
const pagesMatch = pdfinfoOut.match(/Pages:\s+(\d+)/);
assert.ok(pagesMatch, 'Could not read page count from pdfinfo');
const pageCount = parseInt(pagesMatch[1], 10);
assert.equal(pageCount, 2, `Expected strictly 2 pages, got ${pageCount}`);

const sizeMatch = pdfinfoOut.match(/Page size:\s+([0-9.]+)\s+x\s+([0-9.]+)\s+pts\s+\(A4\)/);
assert.ok(sizeMatch, 'Page size must be standard A4');

// Run pdftotext to verify essential text content
const text = execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf-8' });
assert.ok(text.includes('Adrij Shikhar'), 'Missing name');
assert.ok(text.includes('adrijshikhar26@gmail.com'), 'Missing updated email');
assert.ok(text.includes('+918218058928'), 'Missing phone');
assert.ok(text.includes('Hevo Data'), 'Missing Hevo Data');
assert.ok(text.includes('Binsight'), 'Missing Binsight');
assert.ok(text.includes('aim'), 'Missing aim');
assert.ok(text.includes('cxstatusline'), 'Missing cxstatusline');
assert.ok(text.includes('catalyst'), 'Missing catalyst');
assert.ok(text.includes('Indian Institute of Technology, Roorkee'), 'Missing education');
assert.ok(text.includes('Tariq Iqbal'), 'Missing reference 1');
assert.ok(text.includes('Shubham Goyal'), 'Missing reference 2');

console.log('✓ verify-resume-pdf passed: exactly 2 A4 pages with all required content');
