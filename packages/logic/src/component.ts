export type TypeNameToTypeMap = {
  Int8: number;
  Int16: number;
  Int32: number;
  UInt8: number;
  UInt16: number;
  UInt32: number;
  Float32: number;
  String: string;
  Number: number;
};

export type TypeNameToArrayType = {
  Int8: Int8Array;
  UInt8: Uint8Array;
  Int16: Int16Array;
  UInt16: Uint16Array;
  Int32: Int32Array;
  UInt32: Uint32Array;
  Float32: Float32Array;
  String: string[];
  Number: number[];
};


type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

export type SupportedArrays =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | string[]
    | number[];


type ElementType<T> = T extends (infer U)[] ? U :
                      T extends TypedArray ? number :
                      never;

export interface Component<T extends SupportedArrays> {
    indexOf(value: ElementType<T>): number;
    name: string;
    value: T;
    length: number;
    push(value: ElementType<T>): void;
    toArray(): ElementType<T>[];
}

export class ComponentString implements Component<string[]> {
    public name: string;
    public value: string[];

    get length(): number {
        return this.value.length;
    }

    constructor(name: string) {
        this.name = name;
        this.value = [];
    }

    public push(value: string) {
        this.value.push(value);
    }

    public toArray(): string[] {
        return this.value;
    }

    public indexOf(value: string): number {
        return this.value.indexOf(value);
    }
}


export class ComponentNumber implements Component<number[]> {
    public name: string;
    public value: number[];

    get length(): number {
        return this.value.length;
    }

    constructor(name: string) {
        this.name = name;
        this.value = [];
    }

    public push(value: number) {
        this.value.push(value);
    }

    public toArray(): number[] {
        return this.value;
    }

    public indexOf(value: number): number {
        return this.value.indexOf(value);
    }
}


type TypedArrayConstructor<T extends TypedArray> = {
    new (length: number): T;
};

export class ComponentTypedArray<T extends TypedArray> implements Component<T> {
    public name: string;
    public internalValue: T;
    public length: number;
    private ArrayConstructor: TypedArrayConstructor<T>;

    public get value(): T {
        return this.internalValue.subarray(0, this.length) as T;
    }

    constructor(name: string, arrayConstructor: TypedArrayConstructor<T>) {
        this.name = name;
        this.ArrayConstructor = arrayConstructor;
        this.internalValue = new this.ArrayConstructor(16);
        this.length = 0;
    }

    public push(value: number) {
        let valuePos = this.length;
        this.length++;
    
        if (this.internalValue.length < this.length) {
            // need to grow the array
            let newValues = new this.ArrayConstructor(this.length * 2);
            newValues.set(this.internalValue);
            this.internalValue = newValues;
        }

        // add value
        this.internalValue[valuePos] = value;
    }

    public toArray(): ElementType<T>[] {
        return Array.from(this.value) as ElementType<T>[];
    }

    public indexOf(value: number): number {
        return this.internalValue.indexOf(value);
    }
}

export function getArrayForValue(
  name: string,
  valueTypeName: keyof TypeNameToTypeMap
): Component<SupportedArrays> {
  switch (valueTypeName.toLowerCase()) {
    case 'uint8':
      return new ComponentTypedArray(name, Uint8Array);
    case 'uint16':
      return new ComponentTypedArray(name, Uint16Array);
    case 'uint32':
      return new ComponentTypedArray(name, Uint32Array);
    case 'int8':
      return new ComponentTypedArray(name, Int8Array);
    case 'int16':
      return new ComponentTypedArray(name, Int16Array);
    case 'int32':
      return new ComponentTypedArray(name, Int32Array);
    case 'float32':
      return new ComponentTypedArray(name, Float32Array);
    case 'string':
      return new ComponentString(name);
    case 'number':
      return new ComponentNumber(name);
    default:
      throw new Error(`Unsupported component type: ${valueTypeName}`);
  }
}