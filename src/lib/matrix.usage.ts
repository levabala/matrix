import { baseVector, getColumns, height, Matrix, sameV, width } from './matrix';
import { last, shell } from './utility';

// const matrix: Matrix = [
//   [2, 1, 1, 0, 0, 2],
//   [1, -2, 0, 1, 0, 32],
//   [1, 1, 0, 0, 1, 15]
// ];

const matrix = [[-2, 1, 1, 0, 0, 2], [3, 5, 0, 1, 0, 36], [1, 1, 0, 0, 1, 5]];

const configs = shell(height(matrix))
  .map((_, y) => shell(width(matrix) - 1).map((_, x) => ({ x, y })))
  .reduce((acc, val) => [...acc, ...val]);

function extractXes(m: Matrix): Record<number, number> {
  return getColumns(m).reduce(
    (acc: Record<number, number>, column, i, columns) => {
      return i === columns.length - 1
        ? acc
        : column.reduce(
            (acc2: boolean, val: number) => acc2 && (val === 0 || val === 1),
            true
          ) && column.filter(el => el === 1).length === 1
        ? { ...acc, [i]: last(columns)[column.indexOf(1)] }
        : acc;
    },
    []
  );
}

const results = configs.map(({ x, y }) => {
  const m = baseVector(matrix, y, x);
  const b = extractXes(m);
  return { m, b: shell(width(matrix) - 1).map((_, i) => b[i] || 0) };
});

results
  .filter(({ b }) => b.some(e => e))
  .filter(({ b }) => results.filter(({ b: b2 }) => sameV(b, b2)).length === 1)
  .forEach(({ b }, i) => {
    console.log(i);
    // printM(m);
    console.log(b);
  });
