import { baseVector, getColumns, height, Matrix, sameV, Vector, width } from './matrix';
import { last, shell } from './utility';

// const matrix: Matrix = [
//   [2, 1, 1, 0, 0, 2],
//   [1, -2, 0, 1, 0, 32],
//   [1, 1, 0, 0, 1, 15]
// ];

// const matrix = [[-2, 1, 1, 0, 0, 2], [3, 5, 0, 1, 0, 36], [1, 1, 0, 0, 1, 5]];
const matrix = [
  [1, 0, 0, 0, -1, 1, 7],
  [0, 1, 0, 0, -1, 4, 21],
  [0, 0, 1, 0, 4, -1, 23],
  [0, 0, 0, 1, 1, -1, 3]
];

function processMatrix(
  m: Matrix,
  deepness = 1,
  doneConfigs: Array<{ x: number; y: number }> = []
): Vector[] {
  console.log(deepness);
  // console.log(`process matrix\n${m2str(m)}`);

  const configs = shell(height(m))
    .map((_, y) => shell(width(m) - 1).map((_, x) => ({ x, y })))
    .reduce((acc, val) => [...acc, ...val])
    .filter(
      ({ x, y }) =>
        !doneConfigs.find(({ x: x2, y: y2 }) => x === x2 && y === y2)
    );

  const missingConfigs = configs.filter(({ x, y }) => !m[y][x]);
  // console.log(missingConfigs);

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
    const m2 = baseVector(m, y, x);
    const b = extractXes(m2);
    return { m: m2, b: shell(width(m2) - 1).map((_, i) => b[i] || 0) };
  });

  const baseVectors: Vector[] = results
    // .filter(({ b }) => b.some(e => e))
    // .filter(({ b }) => results.filter(({ b: b2 }) => sameV(b, b2)).length === 1)
    .reduce(
      (
        acc: {
          m: number[][];
          b: number[];
        }[],
        val
      ) => (acc.find(({ b }) => sameV(val.b, b)) ? acc : [...acc, val]),
      []
    )
    .map(({ b }) => b);

  const additionalResults: Vector[] =
    deepness > 0
      ? missingConfigs
          .map(({ x, y }) => {
            return results.find(({ m }) => {
              const val = m[y][x];
              return val !== 0 && !isNaN(val) && isFinite(val);
            });
          })
          .filter(r => r)
          .map(r =>
            r ? processMatrix(r.m, deepness - 1, missingConfigs) : null
          )
          .reduce((acc: Vector[], val) => [...acc, ...(val ? val : [])], [])
      : [];

  return [...baseVectors, ...additionalResults];
}

const res = processMatrix(matrix, 3)
  .reduce(
    (acc: Vector[], val: Vector) =>
      acc.find(v => sameV(val, v, 10e-5)) ? acc : [...acc, val],
    []
  )
  .map(v => v.map(v => Math.round(v * 10e7) / 10e7));

console.log(res);
console.log('done');
