import { customTypeNames } from "./constants";

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
