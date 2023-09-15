/* eslint-disable prefer-named-capture-group */

import { Buffer } from "node:buffer";
import Geometry from "./geometry.js";
import LineString from "./line-string.js";
import Point from "./point.js";

class Polygon extends Geometry {
  public rings: readonly Point[][];

  public constructor(ringPoints: Point[][]) {
    super();

    this.rings = Object.freeze(ringPoints);
  }

  public fromBuffer(buffer: Buffer) {
    if (!buffer || buffer.length < 9) {
      throw new TypeError('A Polygon buffer should contain at least 9 bytes');
    }

    const endianness = this.getEndianness(buffer.readInt8(0));

    let offset = 1;

    if (this.readInt32(buffer, endianness, offset) !== this.types.Polygon) {
      throw new TypeError('Binary representation was not a Polygon');
    }

    offset += 4;

    const ringsLength = this.readInt32(buffer, endianness, offset);

    offset += 4;

    const ringsArray: Point[][] = Array.from({ length: ringsLength });

    for (let ringIndex = 0; ringIndex < ringsLength; ringIndex++) {
      const pointsLength = this.readInt32(buffer, endianness, offset);

      offset += 4;

      if (buffer.length < offset + pointsLength * 16) {
        throw new TypeError(`Length of the buffer does not match`);
      }

      const ring: Point[] = Array.from({ length: pointsLength });

      for (let pnt = 0; pnt < pointsLength; pnt++) {
        ring[pnt] = new Point(this.readDouble(buffer, endianness, offset), this.readDouble(buffer, endianness, offset + 8));

        offset += 16;
      }

      ringsArray[ringIndex] = ring;
    }

    return new Polygon(ringsArray);
  }

  public fromString(textValue: string) {
    const wktRegex = /^POLYGON ?\((\(.*\))\)$/g;
    const matches = wktRegex.exec(textValue);

    if (!matches || matches.length !== 2) {
      throw new TypeError('Invalid WKT: ' + textValue);
    }

    const ringsText = matches[1];

    if (!ringsText) {
      throw new TypeError('Invalid WKT: ' + textValue);
    }

    const ringsArray = [];
    let ringStart = null;

    for (let int = 0; int < ringsText.length; int++) {
      const code = ringsText[int];
      if (code === '(') {
        if (ringStart !== null) {
          throw new TypeError('Invalid WKT: ' + textValue);
        }

        ringStart = int + 1;
        continue;
      }

      if (code === ')') {
        if (ringStart === null) {
          throw new TypeError('Invalid WKT: ' + textValue);
        }

        ringsArray.push(ringsText.slice(ringStart, int));

        ringStart = null;

        continue;
      }

      if (ringStart === null && code !== ' ' && code !== ',') {
        throw new TypeError('Invalid WKT: ' + textValue);
      }
    }

    return new Polygon(ringsArray.map(LineString.parseSegments));
  };

  public toBuffer() {
    let totalRingsLength = 0;

    for (const ring of this.rings) {
      totalRingsLength += 4 + ring.length * 16;
    }

    const buffer = Buffer.alloc(9 + totalRingsLength);

    this.writeEndianness(buffer, 0);

    let offset = 1;

    this.writeInt32(this.types.Polygon, buffer, offset);

    offset += 4;

    this.writeInt32(this.rings.length, buffer, offset);

    offset += 4;

    for (const ring of this.rings) {
      this.writeInt32(ring.length, buffer, offset);
      offset += 4;

      for (const poly of ring) {
        this.writeDouble(poly.x, buffer, offset);
        this.writeDouble(poly.y, buffer, offset + 8);
        offset += 16;
      }
    }

    return buffer;
  }

  public override toString() {
    if (this.rings.length === 0) {
      return 'POLYGON EMPTY';
    }

    let ringStrings = '';

    for (const [int, ring] of this.rings.entries()) {
      if (int > 0) {
        ringStrings += ', ';
      }

      ringStrings += `(${ring.map((poly) => `${poly.x} ${poly.y}`).join(', ')})`;
    }

    return `POLYGON (${ringStrings})`;
  }

  public toJSON() {
    return {
      type: 'Polygon',
      coordinates: this.rings.map((ring) => ring.map((poly) => [poly.x, poly.y]))
    };
  }

}

export default Polygon;

export { Polygon };
