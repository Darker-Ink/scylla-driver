import { customTypeNames } from "./constants.js";

const decodeDuration = (bytes: unknown) => {
    // return types.Duration.fromBuffer(bytes);
};

const encodeDuration = (value: unknown) => {
    // if (!(value instanceof types.Duration)) {
    //     throw new TypeError('Not a valid duration, expected Duration/Buffer obtained ' + util.inspect(value));
    // };

    // return value.toBuffer();
}

/**
 * @private
 * @param {Buffer} buffer
 */
const decodeLineString = (buffer: Buffer) => {
    return LineString.fromBuffer(buffer);
};

/**
 * @private
 * @param {LineString} value
 */
const encodeLineString = (value) => {
    return value.toBuffer();
};

/**
 * @private
 * @param {Buffer} buffer
 */
const decodePoint = (buffer) => {
    return Point.fromBuffer(buffer);
};

/**
 * @private
 * @param {LineString} value
 */
const encodePoint = (value) => {
    return value.toBuffer();
};

/**
 * @private
 * @param {Buffer} buffer
 */
const decodePolygon = (buffer) => {
    return Polygon.fromBuffer(buffer);
};

/**
 * @private
 * @param {Polygon} value
 */
const encodePolygon = (value) => {
    return value.toBuffer();
};

const decodeDateRange = (buffer) => {
    return DateRange.fromBuffer(buffer);
};

/**
 * @private
 * @param {DateRange} value
 */
const encodeDateRange = (value) => {
    return value.toBuffer();
};

const customDecoders = {
    [customTypeNames.duration]: decodeDuration,
    [customTypeNames.lineString]: decodeLineString,
    [customTypeNames.point]: decodePoint,
    [customTypeNames.polygon]: decodePolygon,
    [customTypeNames.dateRange]: decodeDateRange
};

const customEncoders = {
    [customTypeNames.duration]: encodeDuration,
    [customTypeNames.lineString]: encodeLineString,
    [customTypeNames.point]: encodePoint,
    [customTypeNames.polygon]: encodePolygon,
    [customTypeNames.dateRange]: encodeDateRange
};


export {
    customDecoders,
    customEncoders
};
