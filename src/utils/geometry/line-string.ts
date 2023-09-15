/* eslint-disable prefer-named-capture-group */
import { Buffer } from "node:buffer";
import Geometry from "./geometry.js";
import Point from "./point.js";

class LineString extends Geometry {
  public points: readonly Point[];

  public constructor(points: Point[]) {
    super();
    
    if (points.length === 1) {
      throw new TypeError('LineString can be either empty or contain 2 or more points');
    }
    
    this.points = Object.freeze(points);
  }
  
  public fromBuffer(buffer: Buffer) {
    if (!buffer || buffer.length < 9) {
      throw new TypeError('A linestring buffer should contain at least 9 bytes');
    }
    
    const endianness = this.getEndianness(buffer.readInt8(0));
    
    let offset = 1;
    
    if (this.readInt32(buffer, endianness, offset) !== this.types.LineString) {
      throw new TypeError('Binary representation was not a LineString');
    }
    
    offset += 4;
    
    const length = this.readInt32(buffer, endianness, offset);
    
    offset += 4;
    
    if (buffer.length !== offset + length * 16) {
      throw new TypeError(`Length of the buffer does not match`);
    }
    
    const points: Point[] = [];
    
    for (let int = 0; int < length; int++) {
      points[int] = new Point(this.readDouble(buffer, endianness, offset), this.readDouble(buffer, endianness, offset + 8));
      
      offset += 16;
    }
    
    return new LineString(points);
  }
  
  public fromString(textValue: string) {
    const wktRegex = /^LINESTRING ?\(([\d ,.-]+)\)+$/g;
    const matches = wktRegex.exec(textValue);
    
    if (!matches?.[1] || matches.length !== 2) {
      throw new TypeError('Invalid WKT: ' + textValue);
    }
    
    const points = LineString.parseSegments(matches[1]);
    
    return new LineString(points);
  }
  
  public static parseSegments(textValue: string) {
    const points: Point[] = [];
    const pointParts = textValue.split(',');
    
    for (const pointPart of pointParts) {
      const point = pointPart.trim();
      
      if (point.length === 0) {
        throw new TypeError('Invalid WKT segment: ' + textValue);
      }
      
      const xyText = point.split(' ').filter((element) => {
        return (element.trim().length > 0);
      });
      
      if (xyText.length !== 2) {
        throw new TypeError('Invalid WKT segment: ' + textValue);
      }
      
      if (!xyText[0] || !xyText[1]) {
        throw new TypeError('Invalid WKT segment: ' + textValue);
      }
      
      points.push(new Point(Number.parseFloat(xyText[0]), Number.parseFloat(xyText[1])));
    }
    
    return points;
  }
  
  public toBuffer() {
    const buffer = Buffer.alloc(9 + this.points.length * 16);
    
    this.writeEndianness(buffer, 0);
    
    let offset = 1;
    
    this.writeInt32(this.types.LineString, buffer, offset);
    
    offset += 4;
    
    this.writeInt32(this.points.length, buffer, offset);
    
    offset += 4;
    
    for (const point of this.points) {
      this.writeDouble(point.x, buffer, offset);
      this.writeDouble(point.y, buffer, offset + 8);
      offset += 16;
    }
    
    return buffer;
  }
  
  public equals(other: LineString) {
    if (!(other instanceof LineString)) {
      return false;
    }
    
    if (this.points.length !== other.points.length) {
      return false;
    }
    
    for (let int = 0; int < this.points.length; int++) {
      if (!Point.equals(this.points[int], other.points[int])) {
        return false;
      }
    }
    
    return true;
  }
  
  public override toString() {
    if (this.points.length === 0) {
      return 'LINESTRING EMPTY';
    }
    
    return `LINESTRING (${this.points.map((point) => `${point.x} ${point.y}`).join(', ')})`
  }
  
  public override useBESerialization() {
    return false;
  }
}

export default LineString;

export {
  LineString
}
