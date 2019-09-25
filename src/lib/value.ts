export interface Value {
  numeric: number;
  unit: symbol;
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
  return num(v1.numeric * v2.numeric);
}

function divide(v1: Value, v2: Value): Value {
  return num(v1.numeric / v2.numeric);
}

function stringify(v: Value, fixed: number = 10): string {
  return `${v.numeric.toFixed(fixed)}${
    v.unit === Symbol.for('number') ? '' : v.unit.toString().slice(7, -1)
  }`;
}

function abs(v: Value): Value {
  return {
    numeric: Math.abs(v.numeric),
    unit: v.unit
  };
}

export const Value = {
  abs,
  divide,
  fromArray,
  multiply,
  negation,
  num,
  stringify,
  substract,
  sum
};
