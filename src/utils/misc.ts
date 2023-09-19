import type { Buffer } from 'node:buffer';
import { customTypeNames } from "./constants.js";
import DateRange from './datastax/search/Date/DateRange.js';
import LineString from "./geometry/line-string.js";
import Point from './geometry/point.js';
import Polygon from './geometry/polygon.js';


const decodeDuration = (bytes: unknown) => {
    // return types.Duration.fromBuffer(bytes);
};

const encodeDuration = (value: unknown) => {
    // if (!(value instanceof types.Duration)) {
    //     throw new TypeError('Not a valid duration, expected Duration/Buffer obtained ' + util.inspect(value));
    // };

    // return value.toBuffer();
}

const encodeLineString = (value) => {
    return value.toBuffer();
};

const encodePoint = (value) => {
    return value.toBuffer();
};

const encodePolygon = (value) => {
    return value.toBuffer();
};

const encodeDateRange = (value) => {
    return value.toBuffer();
};

const customDecoders = {
    [customTypeNames.duration]: decodeDuration,
    [customTypeNames.lineString]: (buffer: Buffer) => new LineString([]).fromBuffer(buffer),
    [customTypeNames.point]: (buffer: Buffer) => new Point(0, 0).fromBuffer(buffer),
    [customTypeNames.polygon]: (buffer: Buffer) => new Polygon([]).fromBuffer(buffer),
    [customTypeNames.dateRange]: (buffer: Buffer) => DateRange.fromBuffer(buffer)
};

const customEncoders = {
    [customTypeNames.duration]: (Dar),
    [customTypeNames.lineString]: (LineString: LineString) => LineString.toBuffer(),
    [customTypeNames.point]: (Point: Point) => Point.toBuffer(),
    [customTypeNames.polygon]: (Polygon: Polygon) => Polygon.toBuffer(),
    [customTypeNames.dateRange]: (Date: DateRange) => Date.toBuffer()
};


export {
    customDecoders,
    customEncoders
};
