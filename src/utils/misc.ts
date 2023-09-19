import type { Buffer } from 'node:buffer';
import { customTypeNames } from "./constants.js";
import DateRange from './datastax/search/Date/DateRange.js';
import LineString from "./geometry/line-string.js";
import Point from './geometry/point.js';
import Polygon from './geometry/polygon.js';
import { Duration } from './types/Duration.js';


const customDecoders = {
    [customTypeNames.duration]: (value: Buffer) => Duration.fromBuffer(value),
    [customTypeNames.lineString]: (buffer: Buffer) => new LineString([]).fromBuffer(buffer),
    [customTypeNames.point]: (buffer: Buffer) => new Point(0, 0).fromBuffer(buffer),
    [customTypeNames.polygon]: (buffer: Buffer) => new Polygon([]).fromBuffer(buffer),
    [customTypeNames.dateRange]: (buffer: Buffer) => DateRange.fromBuffer(buffer)
};

const customEncoders = {
    [customTypeNames.duration]: (value: Duration) => value.toBuffer(),
    [customTypeNames.lineString]: (LineString: LineString) => LineString.toBuffer(),
    [customTypeNames.point]: (Point: Point) => Point.toBuffer(),
    [customTypeNames.polygon]: (Polygon: Polygon) => Polygon.toBuffer(),
    [customTypeNames.dateRange]: (Date: DateRange) => Date.toBuffer()
};


export {
    customDecoders,
    customEncoders
};
