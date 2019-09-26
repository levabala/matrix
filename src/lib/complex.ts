import { Value } from './value';

export type Complex = Map<symbol, Value>;

function num(numeric: number): Complex {
  return complex({
    numeric,
    unit: Symbol.for('number')
  });
}

export function complex(...values: Value[]): Complex {
  return new Map((values || [Value.num(0)]).map(val => [val.unit, val]));
}

export function extractKeys(
  c1: Complex,
  c2: Complex
): { exclude1: symbol[]; exclude2: symbol[]; intersect: symbol[] } {
  const keys1 = Array.from(c1.keys());
  const keys2 = Array.from(c2.keys());
  const intersect = keys1.filter(k => keys2.includes(k));
  const exclude1 = keys1.filter(k => !intersect.includes(k));
  const exclude2 = keys2.filter(k => !intersect.includes(k));

  return {
    exclude1,
    exclude2,
    intersect
  };
}

export function extractValues(c: Complex, keys: symbol[]): Value[] {
  return keys.map(k => c.get(k)) as Value[];
}

function applyOperation(
  e1: Complex,
  e2: Complex,
  operand: (v1: Value, v2: Value) => Value
): Complex {
  const { exclude1, exclude2, intersect } = extractKeys(e1, e2);

  const newExcluded = extractValues(e1, exclude1).concat(
    extractValues(e2, exclude2)
  );
  const newIntersected = intersect.map(k => {
    const v1 = e1.get(k) as Value;
    const v2 = e2.get(k) as Value;

    const res = operand(v1, v2);

    return res;
  });

  return complex(...newExcluded.concat(newIntersected));
}

function sum(e1: Complex, e2: Complex): Complex {
  return applyOperation(e1, e2, (v1, v2) => Value.sum(v1, v2));
}

function map(e: Complex, processor: (val: Value) => Value): Complex {
  return complex(...Array.from(e.values()).map(val => processor(val)));
}

function negation(e: Complex): Complex {
  return map(e, ({ numeric, unit }) => ({ numeric: numeric * -1, unit }));
}

function substract(e1: Complex, e2: Complex): Complex {
  return sum(e1, negation(e2));
}

function abs(e: Complex): Complex {
  return map(e, ({ numeric, unit }) => ({ numeric: Math.abs(numeric), unit }));
}

function arr(e: Complex): Value[] {
  return Array.from(e.values());
}

function sumNumeric(e: Complex): number {
  return arr(e).reduce((acc, val) => acc + val.numeric, 0);
}

function multiply(c1: Complex, c2: Complex): Complex {
  const arr2 = arr(c2);
  // console.log(c1, c2);
  return arr(c1)
    .map(v1 => {
      const r = complex(...arr2.map(v2 => Value.multiply(v1, v2)));
      return r;
    })
    .reduce((acc, val) => Complex.sum(acc, val));
  // return applyOperation(c1, c2, Value.multiply);
}

function divide(c1: Complex, c2: Complex): Complex {
  return applyOperation(c1, c2, Value.divide);
}

function stringify(c: Complex, fixed = 10, smartSignJoin = false): string {
  return arr(c)
    .map((v, i) => Value.stringify(v, fixed, smartSignJoin && i !== 0))
    .join(' ');
}

function fromArray(nums: number[]): Complex[] {
  return nums.map(n => num(n));
}

function numerize(v: Complex): number {
  return (v.get(Symbol.for('number')) || { numeric: 0 }).numeric;
}

export const Complex = {
  abs,
  divide,
  fromArray,
  multiply,
  negation,
  num,
  numerize,
  stringify,
  substract,
  sum,
  sumNumeric
};
