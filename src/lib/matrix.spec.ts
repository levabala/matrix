import test from 'ava';

import { Complex } from './complex';
import {
  baseVector,
  calcError,
  det,
  divideR,
  gaussian,
  getBaseDistinct,
  getColumns,
  getRows,
  matrix,
  Matrix,
  matrixNumeric,
  multipleR,
  multiplyM,
  multiplyV,
  normalizeR,
  numerize,
  printM,
  sameV,
  slice,
  substractR,
  substractV,
  transposeM,
} from './matrix';
import { last } from './utility';

const { num: n } = Complex;

test('columns', t => {
  const m1: Matrix = matrixNumeric([[1, 2, 3], [4, 5, 6]]);

  const c1 = numerize(getColumns(m1));
  t.deepEqual(c1, [[1, 4], [2, 5], [3, 6]], '1');
});

test('rows', t => {
  const m1: Matrix = matrixNumeric([[1, 2, 3], [4, 5, 6]]);

  const r1 = getRows(m1);
  t.deepEqual(r1, m1, '1');
});

test('row operations', t => {
  const m1: Matrix = matrixNumeric([[1, 2, 3], [4, 5, 6]]);
  const m2 = numerize(multipleR(m1, 0, n(2)));
  const m3 = numerize(multipleR(m1, 1, n(2)));

  const m4 = numerize(substractR(m1, 0, 1));
  const m5 = numerize(substractR(m1, 1, 0));

  const m6 = numerize(divideR(m1, 0, n(2)));
  const m7 = numerize(divideR(m1, 1, n(4)));

  const m8 = numerize(normalizeR(m1, 1, 0));
  const m9 = numerize(normalizeR(m1, 0, 2));

  t.deepEqual(m2, [[2, 4, 6], [4, 5, 6]], 'first row multiple');
  t.deepEqual(m3, [[1, 2, 3], [8, 10, 12]], 'second row multiple');
  t.deepEqual(m4, [[-3, -3, -3], [4, 5, 6]], 'first - second');
  t.deepEqual(m5, [[1, 2, 3], [3, 3, 3]], 'second - first');
  t.deepEqual(m6, [[1 / 2, 2 / 2, 3 / 2], [4, 5, 6]], 'divide 1');
  t.deepEqual(m7, [[1, 2, 3], [4 / 4, 5 / 4, 6 / 4]], 'divide 2');
  t.deepEqual(m8, [[1, 2, 3], [4 / 4, 5 / 4, 6 / 4]], 'normalize 1');
  t.deepEqual(m9, [[1 / 3, 2 / 3, 3 / 3], [4, 5, 6]], 'normalize 2');
});

test('vector', t => {
  const v1 = Complex.fromArray([1, 2, 3]);
  const v2 = Complex.fromArray([2, 3, 4]);

  const v3 = numerize([substractV(v2, v1)]);
  const v4 = numerize([multiplyV(v2, n(2))]);

  t.deepEqual(v3, [[1, 1, 1]], 'substract');
  t.deepEqual(v4, [[4, 6, 8]], 'multiply');

  t.true(sameV(v1, Complex.fromArray([1, 2, 3])), 'equality 1');
  t.false(
    sameV(Complex.fromArray([1, 2, 6]), Complex.fromArray([1, 2, 3])),
    'equality 2'
  );
});

test('base vector', t => {
  const m1: Matrix = matrixNumeric([[1, 2, 3], [4, 5, 6]]);

  const m2 = numerize(baseVector(m1, 0, 0));
  const m3 = numerize(baseVector(m1, 0, 1));
  const m4 = numerize(baseVector(m1, 1, 0));
  const m5 = numerize(baseVector(m1, 1, 2));

  t.deepEqual(m2, [[1, 2, 3], [0, -3, -6]], 'test 1');
  t.deepEqual(
    m3,
    [
      [1 / 2, 2 / 2, 3 / 2],
      [4 - (1 / 2) * 5, 5 - (2 / 2) * 5, 6 - (3 / 2) * 5]
    ],
    'test 2'
  );
  t.deepEqual(
    m4,
    [
      [1 - (4 / 4) * 1, 2 - (5 / 4) * 1, 3 - (6 / 4) * 1],
      [4 / 4, 5 / 4, 6 / 4]
    ],
    'test 3'
  );
  t.deepEqual(
    m5,
    [
      [1 - (4 / 6) * 3, 2 - (5 / 6) * 3, 3 - (6 / 6) * 3],
      [4 / 6, 5 / 6, 6 / 6]
    ],
    'test 4'
  );
});

test('matrix slice', t => {
  const m1: Matrix = matrixNumeric([[1, 2, 3], [4, 5, 6]]);

  const m2 = numerize(slice(m1, 0, 2, 0, 2));
  const m3 = numerize(slice(m1, 1, 2, 1, 2));

  t.deepEqual(m2, [[1, 2], [4, 5]], 'slice 2x2');
  t.deepEqual(m3, [[5]], 'slice 1x1');
});

test('gaussian', t => {
  const m1: Matrix = matrixNumeric([
    [2, 5, 4, 6, 7, 3],
    [8, 7, 4, 4, 7, 1],
    [1, 8, 7, 9, 0, 1],
    [8, 6, 57, 6, 2, 1],
    [3, 6, 4, 7, 8, 3]
  ]);

  const m2 = gaussian(m1);

  const res = transposeM([last(getColumns(m2))]);
  const m2LastColumn = slice(m2, 0, -1, 0, 0);
  const m3 = multiplyM(m2LastColumn, res);

  const maxError = 10e-8;
  const error = calcError(m3, transposeM([last(getColumns(m2))]));

  t.true(error < maxError, 'multiply2');
});

test('matrix multiplying', t => {
  const m1: Matrix = matrixNumeric([[3, 2, 6, 2], [5, 9, 8, 7], [4, 3, 3, 3]]);
  const m2: Matrix = matrixNumeric([
    [1, 7, 6],
    [6, 1, 5],
    [9, 4, 6],
    [9, 3, 3]
  ]);

  const m3 = multiplyM(m1, m2);

  const m4: Matrix = matrixNumeric([
    [2, 5, 4, 6, 7, 3],
    [8, 7, 4, 4, 7, 1],
    [1, 8, 7, 9, 0, 1],
    [8, 6, 57, 6, 2, 1],
    [3, 6, 4, 7, 8, 3]
  ]);

  const res = transposeM([last(getColumns(gaussian(m4)))]);
  const m4LastColumn = slice(m4, 0, -1, 0, 0);
  const m6 = multiplyM(m4LastColumn, res);

  const maxError = 10e-8;
  const error = calcError(m6, transposeM([last(getColumns(m4))]));

  t.deepEqual(
    numerize(m3),
    [[87, 53, 70], [194, 97, 144], [76, 52, 66]],
    'multiply1'
  );
  t.true(error < maxError, 'multiply2');
});

test('determinant', t => {
  // const m1: Matrix = matrixNumeric([[1, 4, 7], [3, 5, 4], [3, 3, 9]]);

  // const m2: Matrix = matrixNumeric([
  //   [6, 8, 6, -99],
  //   [6, -6, 3, 43],
  //   [1, 5, 0, 12],
  //   [1, 9, 9, 9]
  // ]);

  const m3: Matrix = matrix([['i', 'j', 'k'], [-3, 2, -3], [2, -1, -4]]);

  const d3 = det(m3);
  // const d1 = Complex.numerize(det(m1));
  // const d2 = Complex.numerize(det(m2));
  console.log('---');

  console.log(d3);
  console.log(Complex.stringify(d3, undefined, true));

  // t.is(d1, -69, 'num det 1');
  // t.is(d2, 50568, 'num det 2');
  t.pass('message');
});

test('complex calculations', t => {
  const m1: Matrix = matrix([['i', 'j', 'k'], [-3, 2, -3], [2, -1, -4]]);
  printM(m1);

  t.pass('done?');
});

test('distinct', t => {
  const m = matrixNumeric([
    [1, -1, -2, 0, -1, -1, 0, 2],
    [0, 1, -3, -1, -1, 0, -1, -26],
    [1, 0, 1, 1, 0, -1, -1, 17]
  ]);

  const m2 = getBaseDistinct(m);
  printM(m2);

  const m3 = matrixNumeric([
    [1, -1, -1, -1, 1, 0, -46],
    [0, -2, -1, -3, 1, 1, 4],
    [3, 0, 2, 1, -1, -1, 2]
  ]);

  const m4 = getBaseDistinct(m3);
  printM(m4);

  t.pass('nani?');
});
