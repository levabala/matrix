import { last, shell } from './utility';

export type Matrix = Vector[];

export type Vector = number[];

export function sameV(v1: Vector, v2: Vector): boolean {
  return v1.reduce((acc: boolean, val) => acc && v2.indexOf(val) !== -1, true);
}

export function substractV(v1: Vector, v2: Vector): Vector {
  return v1.map((el, i) => el - v2[i]);
}

export function multiplyV(v: Vector, coeff: number): Vector {
  return v.map(el => el * coeff);
}

export function width(m: Matrix): number {
  return m[0].length;
}

export function height(m: Matrix): number {
  return m.length;
}

export function getColumns(m: Matrix): Vector[] {
  return m.reduce(
    (acc: Vector[], val) => acc.map((column, i) => [...column, val[i]]),
    m[0].map(_ => [])
  );
}

export function getRows(m: Matrix): Vector[] {
  return m;
}

export function slice(
  m: Matrix,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): Matrix {
  return m
    .slice(y1, y2 <= 0 ? height(m) + y2 : y2)
    .map(row => row.slice(x1, x2 <= 0 ? width(m) + x2 : x2));
}

export function multipleR(m: Matrix, rowIndex: number, coeff: number): Matrix {
  return m.map((row, i) => (i === rowIndex ? row.map(el => el * coeff) : row));
}

export function divideR(m: Matrix, rowIndex: number, coeff: number): Matrix {
  return m.map((row, i) => (i === rowIndex ? row.map(el => el / coeff) : row));
}

export function substractR(
  m: Matrix,
  row1Index: number,
  row2Index: number
): Matrix {
  return m.map((row, i1) =>
    i1 === row1Index ? row.map((el, i2) => el - m[row2Index][i2]) : row
  );
}

export function normalizeR(
  m: Matrix,
  rowIndex: number,
  elementIndex: number
): Matrix {
  const anchor = m[rowIndex][elementIndex];
  return divideR(m, rowIndex, anchor);
}

export function baseVector(
  m: Matrix,
  rowIndex: number,
  columnIndex: number
): Matrix {
  const normalizedMatrix = normalizeR(m, rowIndex, columnIndex);
  const normalizedV = normalizedMatrix[rowIndex];
  return normalizedMatrix.map((row, i) =>
    i === rowIndex
      ? row
      : substractV(row, multiplyV(normalizedV, row[columnIndex]))
  );
}

export function m2str(m: Matrix): string {
  const maxLength = m.reduce(
    (acc: number, v) =>
      v.reduce((_, v2) => Math.max(v2.toString().length, acc), 0),
    0
  );
  return `[\n${m
    .map(
      row =>
        `  ${row.map(s => s.toString().padStart(maxLength + 1)).join(', ')}`
    )
    .join('\n')}\n]`;
}

export function printM(m: Matrix): void {
  console.log(m2str(m));
}

export function gaussian(m: Matrix): Matrix {
  return shell(Math.min(width(m), height(m))).reduce(
    (acc: Matrix, _, i) => baseVector(acc, i, i),
    m
  );
}

export function transposeM(m: Matrix): Matrix {
  return getColumns(m);
}

export function differenceM(m1: Matrix, m2: Matrix): Matrix {
  return m1.map((row, y) => row.map((el, x) => el - m2[y][x]));
}

export function sumM(m: Matrix): number {
  return m.reduce(
    (acc, row) => acc + row.reduce((acc2, value) => acc2 + value ** 2),
    0
  );
}

export function calcError(actual: Matrix, expected: Matrix): number {
  return sumM(differenceM(actual, expected));
}

export function multiplyM(m1: Matrix, m2: Matrix): Matrix {
  const rows = getRows(m1);
  const columns = getColumns(m2);

  return rows.map(row =>
    columns.map(column =>
      row.reduce((acc, _, i) => acc + row[i] * column[i], 0)
    )
  );
}

export function extractBase(m: Matrix): Vector {
  return last(getColumns(m));
}
