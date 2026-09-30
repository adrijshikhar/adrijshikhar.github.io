import assert from 'node:assert/strict';
import { loadResumeData } from '../src/lib/resume.ts';

const data = loadResumeData();

// Personal info checks
assert.equal(data.personal.name, 'Adrij Shikhar');
assert.equal(data.personal.email, 'adrijshikhar26@gmail.com');
assert.equal(data.personal.phone, '+918218058928');
assert.equal(data.personal.website, 'https://adrijshikhar.dev');
assert.equal(data.personal.linkedin, 'https://www.linkedin.com/in/adrij-shikhar');

// Experience checks
assert.ok(Array.isArray(data.experience) && data.experience.length > 0);
const hevo = data.experience[0];
assert.equal(hevo.company, 'Hevo Data');
assert.equal(hevo.role, 'Senior Software Engineer');
assert.equal(hevo.domains.length, 6, 'Hevo must have exactly 6 technical domains');

// Projects checks
assert.ok(Array.isArray(data.projects));
const projectNames = data.projects.map(p => p.name);
assert.deepEqual(projectNames, ['Binsight', 'aim', 'cxstatusline', 'catalyst']);

// Earlier experience, skills, education, references
assert.ok(data.earlier_experience.length >= 4);
assert.ok(data.skills.length >= 5);
assert.equal(data.education.institution, 'Indian Institute of Technology, Roorkee');
assert.ok(data.education.summary);
assert.equal(data.references.length, 2);

console.log('✓ test-resume-data passed: all schema requirements satisfied');
