export interface Value {
  numeric: number;
  unit: symbol;
}

function isNum(v: Value): boolean {
  return v.unit === Symbol.for('number');
}

function num(numeric: number): Value {
  return {
    numeric,
    unit: Symbol.for('number')
  };
}

function fromArray(nums: number[]): Value[] {
  return nums.map(n => num(n));
}

function sum(v1: Value, v2: Value): Value {
  return {
    numeric: v1.numeric + v2.numeric,
    unit: v1.unit
  };
}

function negation({ unit, numeric }: Value): Value {
  return {
    numeric: numeric * -1,
    unit
  };
}

function substract(v1: Value, v2: Value): Value {
  return {
    numeric: v1.numeric - v2.numeric,
    unit: v1.unit
  };
}

function multiply(v1: Value, v2: Value): Value {
  return {
    numeric: v1.numeric * v2.numeric,
    unit:
      v1.unit === v2.unit
        ? v1.unit
        : isNum(v1) && !isNum(v2)
        ? v2.unit
        : !isNum(v1) && isNum(v2)
        ? v1.unit
        : Symbol.for(unitName(v1) + unitName(v2))
  };
}

function divide(v1: Value, v2: Value): Value {
  return num(v1.numeric / v2.numeric);
}

function stringify(
  v: Value,
  fixed: number = 10,
  stepBetweenSignAndValue = false
): string {
  const numStr = (Math.round(v.numeric) === v.numeric
    ? v.numeric
    : v.numeric.toFixed(fixed)
  ).toString();
  const itIsNum = v.unit === Symbol.for('number');
  const numSign = Math.sign(v.numeric);
  return `${
    v.numeric === 1 && !itIsNum
      ? ''
      : `${numSign === -1 ? '-' : stepBetweenSignAndValue ? '+' : ''}${
          stepBetweenSignAndValue ? ' ' : ''
        }${numSign === -1 ? numStr.slice(1) : numStr}`
  }${itIsNum ? '' : unitName(v)}`;
}

function unitName(v: Value): string {
  return v.unit.toString().slice(7, -1);
}

function abs(v: Value): Value {
  return {
    numeric: Math.abs(v.numeric),
    unit: v.unit
  };
}

function numerize(v: Value): number {
  return v.numeric;
}

export const Value = {
  abs,
  divide,
  fromArray,
  multiply,
  negation,
  num,
  numerize,
  stringify,
  substract,
  sum
};
