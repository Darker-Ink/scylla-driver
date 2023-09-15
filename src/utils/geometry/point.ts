/* eslint-disable prefer-named-capture-group */
import { Buffer } from 'node:buffer';
import Geometry from './geometry.js';

class Point extends Geometry {
  public x: number;

  public y: number;
  
  public constructor(x: number, y: number) {
    super();

    this.x = x;

    this.y = y;    
  }
  
  public fromBuffer(buffer: Buffer) {
    if (!buffer || buffer.length !== 21) {
      throw new TypeError('2D Point buffer should contain 21 bytes');
    }

    const endianness = this.getEndianness(buffer.readInt8(0));
    if (this.readInt32(buffer, endianness, 1) !== this.types.Point2D) {
      throw new TypeError('Binary representation was not a point');
    }

    return new Point(this.readDouble(buffer, endianness, 5), this.readDouble(buffer, endianness, 13));
  }
  
  public fromString(textValue: string) {
    const wktRegex = /^POINT\s?\(([\d.-]+) ([\d.-]+)\)$/g;
    const matches = wktRegex.exec(textValue);
    
    if (!matches || matches.length !== 3) {
      throw new TypeError('2D Point WTK should contain 2 coordinates');
    }

    return new Point(Number.parseFloat(matches?.[1] ?? '0'), Number.parseFloat(matches?.[2] ?? '0'));
  }
  
  public toBuffer() {
    const buffer = Buffer.alloc(21);
    this.writeEndianness(buffer, 0);
    this.writeInt32(this.types.Point2D, buffer, 1);
    this.writeDouble(this.x, buffer, 5);
    this.writeDouble(this.y, buffer, 13);
    return buffer;
  }
  
  public equals(other: Point) {
    if (!(other instanceof Point)) {
      return false;
    }

    return (this.x === other.x && this.y === other.y);
  }
  
  public static equals(a?: Point, b?: Point) {
    if (!a || !b) {
      return false;
    }

    return a.equals(b);
  }
  
  public override toString() {
    return `POINT (${this.x} ${this.y})`
  }
  
  public override useBESerialization() {
    return false;
  }
  
  public toJSON() {
    return { type: 'Point', coordinates: [this.x, this.y] };
  }
}


export default Point;

export { Point };
