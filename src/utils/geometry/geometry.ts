import type { Buffer } from 'node:buffer';

class Geometry {
  public types = {
    Point2D: 1,
    LineString: 2,
    Polygon: 3
  };

  public getEndianness(code: number) {
    const endianness = {
      '0': 'BE',
      '1': 'LE'
    };
    const value = endianness[code.toString() as keyof typeof endianness];
    
    if (typeof value === 'undefined') {
      throw new TypeError(`Invalid endianness with code ${code}`);
    }

    return value;
  }

  public readInt32(buffer: Buffer, endianness: string, offset: number) {
    if (endianness === 'BE') {
      return buffer.readInt32BE(offset);
    }

    return buffer.readInt32LE(offset);
  }

  public readDouble(buffer: Buffer, endianness: string, offset: number) {
    if (endianness === 'BE') {
      return buffer.readDoubleBE(offset);
    }

    return buffer.readDoubleLE(offset);
  }

  public writeInt32(val: number, buffer: Buffer, offset: number) {
    if (this.useBESerialization()) {
      return buffer.writeInt32BE(val, offset);
    }

    return buffer.writeInt32LE(val, offset);
  }

  public writeDouble(val: number, buffer: Buffer, offset: number) {
    if (this.useBESerialization()) {
      return buffer.writeDoubleBE(val, offset);
    }

    return buffer.writeDoubleLE(val, offset);
  }

  public writeEndianness(buffer: Buffer, offset: number) {
    if (this.useBESerialization()) {
      return buffer.writeInt8(0, offset);
    }

    return buffer.writeInt8(1, offset);
  }

  public useBESerialization() {
    return false;
  }
}

export default Geometry;

export {
  Geometry
}
