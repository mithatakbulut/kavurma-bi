import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCsv, fmtWeight, fold, initials, riskLevel } from '../src/lib/format.js';
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

test('weight formatting uses whole kilos for integers', () => {
  assert.equal(fmtWeight(95), '95 kg');
  assert.equal(fmtWeight(1), '1 kg');
  assert.equal(fmtWeight(0), '0 kg');
});

test('weight formatting uses one Turkish decimal for fractional kilos', () => {
  assert.equal(fmtWeight(0.5), '0,5 kg');
  assert.equal(fmtWeight(1.25), '1,3 kg');
});

test('weight formatting rejects negative, non-finite and non-number input', () => {
  const dash = '\u2014';
  for (const value of [-1, -0.5, NaN, Infinity, -Infinity, '95', null, undefined, true, {}]) {
    assert.equal(fmtWeight(value), dash, `expected em dash for ${String(value)}`);
  }
});
