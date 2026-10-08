#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'examples', 'programmer');
const REQUIRED = ['## Role', '## Context', '## Task', '## Constraints', '## Acceptance criteria'];

function main() {
  const files = fs.readdirSync(DIR).filter((name) => name.endsWith('.md')).sort();
  if (files.length < 3) {
    console.error(`FAIL test:examples — expected at least 3 briefs, found ${files.length}`);
    process.exit(1);
  }
  const errors = [];
  for (const name of files) {
    const text = fs.readFileSync(path.join(DIR, name), 'utf8');
    for (const heading of REQUIRED) {
      if (!text.includes(heading)) errors.push(`${name} missing ${heading}`);
    }
    if (/user_profile\.json/i.test(text)) errors.push(`${name} must not promise a user profile`);
  }
  if (errors.length) {
    console.error('FAIL test:examples');
    for (const err of errors) console.error(' - ' + err);
    process.exit(1);
  }
  console.log(`PASS test:examples (${files.length} briefs)`);
}

main();
