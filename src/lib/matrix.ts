import { pipeWith } from 'pipe-ts';

import { Complex, complex } from './complex';
import { last, shell } from './utility';
import { Value } from './value';

export type Vector = Complex[];
export type Matrix = Vector[];

export function vector(values: Array<number | string>): Vector {
  return values.map(val =>
    typeof val === 'number'
      ? Complex.num(val)
      : complex(
          ...val
            .replace(/ /g, '')
            .split('+')
            .map(s => {
              const num = parseFloat(s.replace(/[^0-9]/g, ''));
              const unit = Symbol.for(s.replace(/[0-9]/g, ''));
              return {
                numeric: isNaN(num) ? 1 : num,
                unit
              };
            })
        )
  );
}

export function matrix(values: Array<Array<number | string>>): Matrix {
  return values.map(row => vector(row));
}

export function matrixNumeric(values: number[][]): Matrix {
  return values.map(row => row.map(val => Complex.num(val)));
}

export function numerize(m: Matrix): number[][] {
  return m.map(row =>
    row.map(val => (val.get(Symbol.for('number')) as Value).numeric)
  );
}

export function numerizeV(v: Vector): number[] {
  return v.map(val => (val.get(Symbol.for('number')) as Value).numeric);
}

export function sameV(v1: Vector, v2: Vector, innac: number = 0): boolean {
  return v1.reduce(
    (acc: boolean, val, i) =>
      acc &&
      pipeWith(
        Complex.substract(v2[i], val),
        Complex.abs,
        Complex.sumNumeric
      ) <= innac,
    true
  );
}

export function substractV(v1: Vector, v2: Vector): Vector {
  return v1.map((el, i) => Complex.substract(el, v2[i]));
}

export function multiplyV(v: Vector, coeff: Complex): Vector {
  return v.map(el => Complex.multiply(el, coeff));
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

export function multipleR(m: Matrix, rowIndex: number, coeff: Complex): Matrix {
  return m.map((row, i) =>
    i === rowIndex ? row.map(el => Complex.multiply(el, coeff)) : row
  );
}

export function divideR(m: Matrix, rowIndex: number, coeff: Complex): Matrix {
  return m.map((row, i) =>
    i === rowIndex ? row.map(el => Complex.divide(el, coeff)) : row
  );
}

export function substractR(
  m: Matrix,
  row1Index: number,
  row2Index: number
): Matrix {
  return m.map((row, i1) =>
    i1 === row1Index
      ? row.map((el, i2) => Complex.substract(el, m[row2Index][i2]))
      : row
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

export function m2str(m: Matrix, fixed = 5): string {
  const maxLength = m.reduce(
    (acc: number, v) =>
      v.reduce(
        (_, v2) => Math.max(Complex.stringify(v2, fixed).length, acc),
        0
      ),
    0
  );

  return `[\n${m
    .map(
      row =>
        `  ${row
          .map(s => Complex.stringify(s, fixed).padStart(maxLength + 1))
          .join(', ')}`
    )
    .join('\n')}\n]`;
}

export function v2str(v: Vector, fixed = 5): string {
  return `[${v.map(el => Complex.stringify(el, fixed)).join(', ')}]`;
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
  return m1.map((row, y) =>
    row.map((el, x) => Complex.substract(el, m2[y][x]))
  );
}

export function sumM(m: Matrix): Complex {
  return m.reduce(
    (acc, row) =>
      Complex.sum(
        acc,
        row.reduce(
          (acc2, value) => Complex.sum(acc2, Complex.multiply(value, value)),
          Complex.num(0)
        )
      ),
    Complex.num(0)
  );
}

export function calcError(actual: Matrix, expected: Matrix): number {
  return Complex.sumNumeric(sumM(differenceM(actual, expected)));
}

export function multiplyM(m1: Matrix, m2: Matrix): Matrix {
  const rows = getRows(m1);
  const columns = getColumns(m2);

  return rows.map(row =>
    columns.map(column =>
      row.reduce(
        (acc, _, i) => Complex.sum(acc, Complex.multiply(row[i], column[i])),
        Complex.num(0)
      )
    )
  );
}

export function extractBase(m: Matrix): Vector {
  return last(getColumns(m));
}

export function det(m: Matrix): Complex {
  const size = width(m);

  switch (size) {
    case 0:
      throw new Error('zero matrix');
    case 1:
      return m[0][0];
    case 2:
      return Complex.substract(
        Complex.multiply(m[0][0], m[1][1]),
        Complex.multiply(m[1][0], m[0][1])
      );
    default:
      const withoutTopRow = m.slice(1);
      const columns = getColumns(withoutTopRow);

      return m[0].reduce((acc: Complex, val, i) => {
        const accFunc = i % 2 === 0 ? Complex.sum : Complex.substract;
        const minor = columns.filter((_, i2) => i2 !== i);

        const minorDet = det(minor);
        const res = Complex.multiply(val, minorDet);
        console.log();
        console.log('val', val);
        console.log('minorDet', minorDet);
        console.log('res', res);

        return accFunc(acc, res);
      }, complex());
  }
}

// export function getBaseDistinct(matrix: Matrix) : Matrix {
//   function deeper(m: Matrix) : Matrix {
//     const bVector = last(getColumns(m));
//     const solved = bVector.every(b => b);

//     if (solved)
//       return m;

//     const highlightRowElement = bVector.filter(b => b < 0).reduce((acc, val) => Math.max(Math.abs(acc), Math.abs(val)));
//     const highlightRowIndex = bVector.indexOf(highlightRowElement);
//     const highlightRow = m[highlightRowIndex];

//     const m2 = m.map(row => substractV(row, highlightRow));
//     const m3 = multipleR(m2, highlightRowIndex, -1);

//   }

//   const m1 = gaussian(matrix);

// }
