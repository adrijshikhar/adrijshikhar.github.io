/**
 * Regenerates scripts/resume-print.html and public/assets/resume.pdf
 * from src/content/resume.yaml.
 *
 *   bun run gen:resume
 *
 * Strict 2-Page A4 Technical Paper layout:
 * - Page 1: Header (Name, Title, Telemetry) + Hevo Data Experience (6 domains)
 * - Page 2: Selected Systems Projects + Earlier Experience + Skills + Education + References
 *
 * Runs headless Chrome with local WOFF2 font embedding and verifies output.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const YAML_SRC = join(ROOT, 'src/content/resume.yaml');
const HTML_OUT = join(ROOT, 'scripts/resume-print.html');
const PDF_OUT = join(ROOT, 'public/assets/resume.pdf');
const VERIFY_SCRIPT = join(ROOT, 'scripts/verify-resume-pdf.mjs');

const CHROME = process.env.CHROME_BIN ||
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome');

const stripProtocol = (url) => url ? url.replace(/^https?:\/\/(www\.)?/, '') : '';

function generateResumeHtml(data, rootDir) {
  const fontSG = pathToFileURL(join(rootDir, 'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2')).href;
  const fontFG = pathToFileURL(join(rootDir, 'node_modules/@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2')).href;
  const fontPM400 = pathToFileURL(join(rootDir, 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')).href;
  const fontPM600 = pathToFileURL(join(rootDir, 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2')).href;

  const p = data.personal;

  const experienceHtml = data.experience.map(exp => `
    <div class="company-block">
      <div class="company-header">
        <div class="company-role">
          <span class="company-name">${exp.company}</span>
          <span class="sep">•</span>
          <span class="role-name">${exp.role}</span>
        </div>
        <div class="company-meta">
          <span>${exp.location}</span>
          <span class="sep">/</span>
          <span>${exp.period}</span>
        </div>
      </div>
      ${exp.domains.map(d => `
        <div class="domain-group">
          <div class="domain-title">${d.title}</div>
          <ul class="bullet-list">
            ${d.bullets.map(b => `<li>${b}</li>`).join('\n            ')}
          </ul>
        </div>
      `).join('\n      ')}
    </div>
  `).join('\n');

  const projectsHtml = data.projects.map(proj => {
    const links = [];
    if (proj.url) links.push(`<a href="${proj.url}">${stripProtocol(proj.url)}</a>`);
    if (proj.github) links.push(`<a href="${proj.github}">${stripProtocol(proj.github)}</a>`);
    return `
      <div class="project-entry">
        <div class="entry-header">
          <div class="entry-title-row">
            <span class="entry-name">${proj.name}</span>
            <span class="entry-sep">•</span>
            <span class="entry-role">${proj.role}</span>
          </div>
          <span class="period">${proj.period}</span>
        </div>
        ${links.length ? `<div class="entry-links">${links.join('<span class="sep-dot">•</span>')}</div>` : ''}
        <div class="tech-pills">
          <span class="tech-label">Technologies:</span>
          ${proj.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
        </div>
        <ul class="bullet-list">
          ${proj.bullets.map(b => `<li>${b}</li>`).join('\n          ')}
        </ul>
      </div>
    `;
  }).join('\n');

  const earlierHtml = data.earlier_experience.map(e => `
    <div class="earlier-entry">
      <div class="earlier-header">
        <span class="earlier-company">${e.company}</span>
        <span class="entry-sep">•</span>
        <span class="earlier-role">${e.role}</span>
        <span class="earlier-period">${e.period}</span>
      </div>
      <div class="earlier-summary">${e.summary}</div>
    </div>
  `).join('\n');

  const skillsHtml = data.skills.map(s => `
    <div class="skill-row">
      <span class="skill-category">${s.category}:</span>
      <span class="skill-items">${s.items.join(', ')}</span>
    </div>
  `).join('\n');

  const referencesHtml = data.references.map(r => `
    <div class="ref-card">
      <div class="ref-main">
        <span class="ref-name">${r.name}</span>
        <span class="sep">•</span>
        <span class="ref-title">${r.title}, ${r.company}</span>
      </div>
      <div class="ref-link"><a href="${r.linkedin}">${stripProtocol(r.linkedin)}</a></div>
    </div>
  `).join('\n');

  const educationHtml = `
    <div class="education-block">
      <div class="education-row">
        <div class="education-info">
          <span class="education-main">${data.education.institution}</span>
          <span class="sep">•</span>
          <span class="education-degree">${data.education.degree}</span>
        </div>
        <div class="education-period">${data.education.period}</div>
      </div>
      ${data.education.summary ? `<div class="education-summary">${data.education.summary}</div>` : ''}
    </div>
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${p.name} — Resume</title>
<style>
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 300 700;
  src: url('${fontSG}') format('woff2');
}
@font-face {
  font-family: 'Familjen Grotesk';
  font-style: normal;
  font-weight: 400 700;
  src: url('${fontFG}') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  src: url('${fontPM400}') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  src: url('${fontPM600}') format('woff2');
}

@page {
  size: A4;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

html, body {
  width: 210mm;
  background: #FFFFFF;
  color: #1E293B;
  font-family: 'Familjen Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@media screen {
  body {
    background: #E2E8F0;
    padding: 20mm 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12mm;
  }
  .page {
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12);
  }
}

.page {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  overflow: hidden;
  box-sizing: border-box;
  padding: 11mm 13mm;
  background: #FFFFFF;
  position: relative;
}

.page-1 {
  page-break-after: always;
  break-after: page;
}

.page-2 {
  page-break-after: avoid;
  break-after: avoid;
}

/* Header */
.header {
  border-bottom: 1.2px solid #0F172A;
  padding-bottom: 2.2mm;
  margin-bottom: 3.2mm;
}
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2mm;
}
.header-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22pt;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1;
  color: #0F172A;
}
.header-subtitle {
  font-family: 'Familjen Grotesk', sans-serif;
  font-size: 9.4pt;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 1.8mm;
  margin-top: 1.4mm;
}
.header-subtitle .sep {
  color: #94A3B8;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8pt;
}
.telemetry-grid {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 7.3pt;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 1mm;
  line-height: 1.3;
}
.telemetry-row {
  display: flex;
  align-items: center;
  gap: 2mm;
}
.telemetry-row a {
  color: #1D4ED8;
  text-decoration: none;
}
.telemetry-row .dot {
  color: #CBD5E1;
}

/* Section Common */
.section {
  margin-bottom: 2.8mm;
}
.section-title-bar {
  border-bottom: 1px solid #CBD5E1;
  padding-bottom: 0.8mm;
  margin-bottom: 2mm;
}
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9.6pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #0F172A;
}

/* Company / Entry Headers */
.company-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2.4mm;
}
.company-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11pt;
  font-weight: 700;
  color: #0F172A;
}
.role-name {
  font-family: 'Familjen Grotesk', sans-serif;
  font-size: 9.5pt;
  font-weight: 600;
  color: #1E293B;
}
.company-meta {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 7.8pt;
  color: #475569;
}
.sep {
  color: #94A3B8;
  margin: 0 1.2mm;
}

/* Domains */
.domain-group {
  margin-bottom: 2.4mm;
}
.domain-group:last-child {
  margin-bottom: 0;
}
.domain-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8.8pt;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 0.6mm;
}
.bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bullet-list li {
  position: relative;
  padding-left: 3.5mm;
  font-size: 8.15pt;
  line-height: 1.34;
  color: #1E293B;
  margin-bottom: 0.8mm;
  text-align: justify;
}
.bullet-list li:last-child {
  margin-bottom: 0;
}
.bullet-list li::before {
  content: '•';
  position: absolute;
  left: 0.5mm;
  color: #64748B;
  font-size: 8pt;
}

/* Page 2: Projects */
.project-entry {
  margin-bottom: 2.8mm;
}
.project-entry:last-child {
  margin-bottom: 0;
}
.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2mm;
  margin-bottom: 0.8mm;
}
.entry-title-row {
  display: flex;
  align-items: baseline;
  gap: 1.4mm;
  flex-shrink: 0;
}
.entry-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9.8pt;
  font-weight: 700;
  color: #0F172A;
}
.entry-sep {
  color: #94A3B8;
  font-size: 7.5pt;
}
.entry-role {
  font-family: 'Familjen Grotesk', sans-serif;
  font-size: 8.3pt;
  font-weight: 600;
  color: #475569;
}
.entry-links {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 7.2pt;
  color: #475569;
  margin-top: -0.4mm;
  margin-bottom: 1.1mm;
}
.entry-links a {
  color: #1D4ED8;
  text-decoration: none;
}
.entry-links a:hover {
  text-decoration: underline;
}
.sep-dot {
  color: #CBD5E1;
  margin: 0 1.2mm;
}
.tech-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2mm;
  margin-bottom: 1.1mm;
}
.tech-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 6.8pt;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-right: 0.4mm;
}
.tech-pill {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 6.7pt;
  font-weight: 500;
  background: #F1F5F9;
  border: 0.8px solid #CBD5E1;
  color: #334155;
  padding: 0.3mm 1.5mm;
  border-radius: 2px;
}

/* Page 2: Earlier Experience */
.earlier-entry {
  margin-bottom: 1.6mm;
}
.earlier-entry:last-child {
  margin-bottom: 0;
}
.earlier-header {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8.5pt;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 0.4mm;
  display: flex;
  align-items: baseline;
  gap: 1.2mm;
}
.earlier-company {
  font-weight: 700;
  color: #0F172A;
}
.earlier-role {
  font-family: 'Familjen Grotesk', sans-serif;
  font-weight: 500;
  color: #334155;
}
.earlier-period {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 7.3pt;
  color: #64748B;
  margin-left: auto;
}
.earlier-summary {
  font-family: 'Familjen Grotesk', sans-serif;
  font-size: 8.05pt;
  line-height: 1.3;
  color: #334155;
}

/* Page 2: Skills */
.skill-row {
  font-size: 8.15pt;
  line-height: 1.36;
  margin-bottom: 1mm;
}
.skill-row:last-child {
  margin-bottom: 0;
}
.skill-category {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: #0F172A;
  margin-right: 1.2mm;
}
.skill-items {
  font-family: 'Familjen Grotesk', sans-serif;
  color: #334155;
}

/* Page 2: Education */
.education-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.education-main {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9pt;
  font-weight: 700;
  color: #0F172A;
}
.education-degree {
  font-family: 'Familjen Grotesk', sans-serif;
  font-weight: 500;
  color: #334155;
}
.education-period {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 7.5pt;
  color: #64748B;
}
.education-summary {
  font-family: 'Familjen Grotesk', sans-serif;
  font-size: 8.15pt;
  line-height: 1.34;
  color: #334155;
  margin-top: 1mm;
}

/* Page 2: References */
.references-list {
  display: flex;
  flex-direction: column;
  gap: 1.8mm;
}
.ref-card {
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
  padding: 1.8mm 2.8mm;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.ref-main {
  display: flex;
  align-items: baseline;
}
.ref-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8.8pt;
  font-weight: 700;
  color: #0F172A;
}
.ref-title {
  font-family: 'Familjen Grotesk', sans-serif;
  font-size: 8pt;
  color: #334155;
}
.ref-link {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 7.2pt;
}
.ref-link a {
  color: #1D4ED8;
  text-decoration: none;
}
.ref-link a:hover {
  text-decoration: underline;
}

/* Page 2 Spacing Rhythm */
.page-2 .section {
  margin-bottom: 3.6mm;
}
.page-2 .project-entry {
  margin-bottom: 3.2mm;
}
.page-2 .project-entry:last-child {
  margin-bottom: 0;
}
</style>
</head>
<body>
<div class="page page-1">
  <header class="header">
    <div class="header-main">
      <div>
        <h1 class="header-name">${p.name}</h1>
        <div class="header-subtitle">
          <span class="role-title">${p.title}</span>
          <span class="sep">/</span>
          <span class="role-desc">${p.subtitle}</span>
        </div>
      </div>
    </div>
    <div class="telemetry-grid">
      <div class="telemetry-row">
        <span><a href="mailto:${p.email}">${p.email}</a></span>
        <span class="dot">•</span>
        <span><a href="tel:${p.phone.replace(/\s+/g, '')}">${p.phone}</a></span>
        <span class="dot">•</span>
        <span>${p.location}</span>
      </div>
      <div class="telemetry-row">
        <span><a href="${p.website}">${stripProtocol(p.website)}</a></span>
        <span class="dot">•</span>
        <span><a href="${p.github}">${stripProtocol(p.github)}</a></span>
        <span class="dot">•</span>
        <span><a href="${p.linkedin}">${stripProtocol(p.linkedin)}</a></span>
      </div>
    </div>
  </header>

  <section class="section">
    <div class="section-title-bar">
      <h2 class="section-title">TECHNICAL SKILLS</h2>
    </div>
    ${skillsHtml}
  </section>

  <section class="section">
    <div class="section-title-bar">
      <h2 class="section-title">WORK EXPERIENCE</h2>
    </div>
    ${experienceHtml}
  </section>

  <section class="section" style="margin-bottom:0">
    <div class="section-title-bar">
      <h2 class="section-title">EARLIER ENGINEERING EXPERIENCE</h2>
    </div>
    ${earlierHtml}
  </section>
</div>

<div class="page page-2">
  <section class="section">
    <div class="section-title-bar">
      <h2 class="section-title">SELECTED SYSTEMS PROJECTS</h2>
    </div>
    ${projectsHtml}
  </section>

  <section class="section">
    <div class="section-title-bar">
      <h2 class="section-title">EDUCATION</h2>
    </div>
    ${educationHtml}
  </section>

  <section class="section" style="margin-bottom:0">
    <div class="section-title-bar">
      <h2 class="section-title">REFERENCES</h2>
    </div>
    <div class="references-list">
      ${referencesHtml}
    </div>
  </section>
</div>
</body>
</html>`;
}

// 1. Read YAML and generate HTML
const rawYaml = readFileSync(YAML_SRC, 'utf-8');
const data = yaml.load(rawYaml);
const htmlContent = generateResumeHtml(data, ROOT);
writeFileSync(HTML_OUT, htmlContent, 'utf-8');
console.log('  wrote scripts/resume-print.html');

// 2. Generate PDF via headless Chrome
execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--allow-file-access-from-files',
  '--no-pdf-header-footer',
  `--print-to-pdf=${PDF_OUT}`,
  pathToFileURL(HTML_OUT).href
], { stdio: 'ignore' });

console.log(`  wrote public/assets/resume.pdf (${(statSync(PDF_OUT).size / 1024).toFixed(0)} KB)`);

// 3. Verify output
execFileSync(process.execPath, [VERIFY_SCRIPT], { stdio: 'inherit' });
