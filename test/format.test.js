import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCsv, fold, initials, riskLevel } from '../src/lib/format.js';
import data from '../src/data.js';

test('Turkish names are folded for search', () => {
  assert.equal(fold('IŞIK ÇÖĞÜ'), 'isik cogu');
  assert.equal(initials('ışık çelik'), 'IÇ');
});

test('risk levels change at the documented boundaries', () => {
  assert.equal(riskLevel(34).level, 'healthy');
  assert.equal(riskLevel(35).level, 'watch');
  assert.equal(riskLevel(59).level, 'watch');
  assert.equal(riskLevel(60).level, 'high');
});

test('CSV includes the weekly and customer data', () => {
  const csv = buildCsv();
  assert.ok(csv.startsWith('\uFEFF"Hafta";"Katılan";"Ayrılan";"Net"\r\n'));
  assert.ok(csv.includes('"Abone";"Plan";"Üyelik (ay)"'));
  assert.ok(csv.includes(`"${data.customers[0].name}"`));
});
