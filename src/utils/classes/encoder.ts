import { Buffer } from "node:buffer";
import Long from "long";
import type { ClientOptions } from "../../types/clientOptions";
import { customDecoders } from "../misc.js";


// /**
//  * Serializes and deserializes to and from a CQL type and a Javascript Type.
//  *
//  * @param {number} protocolVersion
//  * @param {ClientOptions} options
//  * @constructor
//  */
// function Encoder(protocolVersion, options) {
//     this.encodingOptions = options.encoding || utils.emptyObject;
//     defineInstanceMembers.call(this);
//     this.setProtocolVersion(protocolVersion);
//     setEncoders.call(this);
//     if (this.encodingOptions.copyBuffer) {
//         this.handleBuffer = handleBufferCopy;
//     }
//     else {
//         this.handleBuffer = handleBufferRef;
//     }
// }

class Encoder {
    private readonly encodingOptions: ClientOptions;

    private readonly protocolVersion: number;

    public constructor(protocolVersion: number, options: ClientOptions) {
        this.encodingOptions = options;

        this.protocolVersion = protocolVersion;
    }

    public longFromBuffer(buffer: Buffer) {
        if (!(buffer instanceof Buffer)) {
            throw new TypeError(`Expected Buffer obtained ${typeof buffer}`);
        }

        return new Long(buffer.readInt32BE(4), buffer.readInt32BE(0));
    }
    
    public handleBuffer(buffer: Buffer) {
        if (this.encodingOptions.encoding?.copyBuffer) {
            return this.handleBufferCopy(buffer);
        } else {
            return buffer;
        }
    }
    
    public handleBufferCopy(buffer: Buffer) {
        if (buffer === null) {
            return null;
          }
          
          return Buffer.from(buffer);
    }
    
    public decodeBlob(bytes: Buffer) {
        return this.handleBuffer(bytes);
    };

    public decodeCustom(bytes: Buffer, typeName: keyof typeof customDecoders) {
        const handler = customDecoders[typeName];

        if (handler) {
            return handler.call(this, bytes);
        }

        return this.handleBuffer(bytes);
    };

    public decodeUtf8String(bytes: Buffer) {
        return bytes.toString('utf8');
    };

    public decodeAsciiString(bytes: Buffer) {
        return bytes.toString('ascii');
    };

    public decodeBoolean(bytes: Buffer) {
        return Boolean(bytes.readUInt8(0));
    };

    public decodeDouble(bytes: Buffer) {
        return bytes.readDoubleBE(0);
    };

    public decodeFloat(bytes: Buffer) {
        return bytes.readFloatBE(0);
    };

    public decodeInt(bytes: Buffer) {
        return bytes.readInt32BE(0);
    };

    public decodeSmallint(bytes: Buffer) {
        return bytes.readInt16BE(0);
    };

    public decodeTinyint(bytes: Buffer) {
        return bytes.readInt8(0);
    };

    public _decodeCqlLongAsLong(bytes: Buffer) {
        return Long.fromBuffer(bytes);
    };

    public _decodeCqlLongAsBigInt(bytes: Buffer) {
        return BigInt.asIntN(64, (BigInt(bytes.readUInt32BE(0)) << bigInt32) | BigInt(bytes.readUInt32BE(4)));
    };


}


/**
 * Sets the encoder and decoder methods for this instance
 *
 * @private
 */
function setEncoders() {
    this.decoders = {
        [dataTypes.custom]: this.decodeCustom,
        [dataTypes.ascii]: this.decodeAsciiString,
        [dataTypes.bigint]: this.decodeLong,
        [dataTypes.blob]: this.decodeBlob,
        [dataTypes.boolean]: this.decodeBoolean,
        [dataTypes.counter]: this.decodeLong,
        [dataTypes.decimal]: this.decodeDecimal,
        [dataTypes.double]: this.decodeDouble,
        [dataTypes.float]: this.decodeFloat,
        [dataTypes.int]: this.decodeInt,
        [dataTypes.text]: this.decodeUtf8String,
        [dataTypes.timestamp]: this.decodeTimestamp,
        [dataTypes.uuid]: this.decodeUuid,
        [dataTypes.varchar]: this.decodeUtf8String,
        [dataTypes.varint]: this.decodeVarint,
        [dataTypes.timeuuid]: this.decodeTimeUuid,
        [dataTypes.inet]: this.decodeInet,
        [dataTypes.date]: this.decodeDate,
        [dataTypes.time]: this.decodeTime,
        [dataTypes.smallint]: this.decodeSmallint,
        [dataTypes.tinyint]: this.decodeTinyint,
        [dataTypes.duration]: decodeDuration,
        [dataTypes.list]: this.decodeList,
        [dataTypes.map]: this.decodeMap,
        [dataTypes.set]: this.decodeSet,
        [dataTypes.udt]: this.decodeUdt,
        [dataTypes.tuple]: this.decodeTuple
    };

    this.encoders = {
        [dataTypes.custom]: this.encodeCustom,
        [dataTypes.ascii]: this.encodeAsciiString,
        [dataTypes.bigint]: this.encodeLong,
        [dataTypes.blob]: this.encodeBlob,
        [dataTypes.boolean]: this.encodeBoolean,
        [dataTypes.counter]: this.encodeLong,
        [dataTypes.decimal]: this.encodeDecimal,
        [dataTypes.double]: this.encodeDouble,
        [dataTypes.float]: this.encodeFloat,
        [dataTypes.int]: this.encodeInt,
        [dataTypes.text]: this.encodeUtf8String,
        [dataTypes.timestamp]: this.encodeTimestamp,
        [dataTypes.uuid]: this.encodeUuid,
        [dataTypes.varchar]: this.encodeUtf8String,
        [dataTypes.varint]: this.encodeVarint,
        [dataTypes.timeuuid]: this.encodeUuid,
        [dataTypes.inet]: this.encodeInet,
        [dataTypes.date]: this.encodeDate,
        [dataTypes.time]: this.encodeTime,
        [dataTypes.smallint]: this.encodeSmallint,
        [dataTypes.tinyint]: this.encodeTinyint,
        [dataTypes.duration]: encodeDuration,
        [dataTypes.list]: this.encodeList,
        [dataTypes.map]: this.encodeMap,
        [dataTypes.set]: this.encodeSet,
        [dataTypes.udt]: this.encodeUdt,
        [dataTypes.tuple]: this.encodeTuple
    };
}

/**
 * Decodes Cassandra bytes into Javascript values.
 * <p>
 * This is part of an <b>experimental</b> API, this can be changed future releases.
 * </p>
 *
 * @param {Buffer} buffer Raw buffer to be decoded.
 * @param {object} type An object containing the data type <code>code</code> and <code>info</code>.
 * @param {number} type.code Type code.
 * @param {object} [type.info] Additional information on the type for complex / nested types.
 */
Encoder.prototype.decode = function (buffer, type) {
    if (buffer === null || (buffer.length === 0 && !zeroLengthTypesSupported.has(type.code))) {
        return null;
    }

    const decoder = this.decoders[type.code];

    if (!decoder) {
        throw new Error('Unknown data type: ' + type.code);
    }

    return decoder.call(this, buffer, type.info);
};

/**
 * Encodes Javascript types into Buffer according to the Cassandra protocol.
 * <p>
 * This is part of an <b>experimental</b> API, this can be changed future releases.
 * </p>
 *
 * @param {*} value The value to be converted.
 * @param {{code: number, info: * | object} | string | number} [typeInfo] The type information.
 * <p>It can be either a:</p>
 * <ul>
 *   <li>A <code>String</code> representing the data type.</li>
 *   <li>A <code>Number</code> with one of the values of {@link module:types~dataTypes dataTypes}.</li>
 *   <li>An <code>Object</code> containing the <code>type.code</code> as one of the values of
 *   {@link module:types~dataTypes dataTypes} and <code>type.info</code>.
 *   </li>
 * </ul>
 * @returns {Buffer}
 * @throws {TypeError} When there is an encoding error
 */
Encoder.prototype.encode = function (value, typeInfo) {
    if (value === undefined) {
        value = this.encodingOptions.useUndefinedAsUnset && this.protocolVersion >= 4 ? types.unset : null;
    }

    if (value === types.unset) {
        if (!types.protocolVersion.supportsUnset(this.protocolVersion)) {
            throw new TypeError('Unset value can not be used for this version of Cassandra, protocol version: ' +
                this.protocolVersion);
        }

        return value;
    }

    if (value === null || value instanceof Buffer) {
        return value;
    }

    /** @type {{code: number, info: object}} */
    let type = {
        code: null,
        info: null
    };

    if (typeInfo) {
        if (typeof typeInfo === 'number') {
            type.code = typeInfo;
        }
        else if (typeof typeInfo === 'string') {
            type = dataTypes.getByName(typeInfo);
        }

        if (typeof typeInfo.code === 'number') {
            type.code = typeInfo.code;
            type.info = typeInfo.info;
        }

        if (typeof type.code !== 'number') {
            throw new TypeError('Type information not valid, only String and Number values are valid hints');
        }
    }
    else {
        // Lets guess
        type = Encoder.guessDataType(value);
        if (!type) {
            throw new TypeError('Target data type could not be guessed, you should use prepared statements for accurate type mapping. Value: ' + util.inspect(value));
        }
    }

    const encoder = this.encoders[type.code];

    if (!encoder) {
        throw new Error('Type not supported ' + type.code);
    }

    return encoder.call(this, value, type.info);
};

/**
 * Try to guess the Cassandra type to be stored, based on the javascript value type
 *
 * @param value
 * @returns {{code: number, info: object}|null}
 * @ignore
 * @internal
 */
Encoder.guessDataType = function (value) {
    let code = null;
    let info = null;
    const esTypeName = (typeof value);
    if (esTypeName === 'number') {
        code = dataTypes.double;
    }
    else if (esTypeName === 'string') {
        code = dataTypes.text;
        if (value.length === 36 && uuidRegex.test(value)) {
            code = dataTypes.uuid;
        }
    }
    else if (esTypeName === 'boolean') {
        code = dataTypes.boolean;
    }
    else if (value instanceof Buffer) {
        code = dataTypes.blob;
    }
    else if (value instanceof Date) {
        code = dataTypes.timestamp;
    }
    else if (value instanceof Long) {
        code = dataTypes.bigint;
    }
    else if (value instanceof Integer) {
        code = dataTypes.varint;
    }
    else if (value instanceof BigDecimal) {
        code = dataTypes.decimal;
    }
    else if (value instanceof types.Uuid) {
        code = dataTypes.uuid;
    }
    else if (value instanceof types.InetAddress) {
        code = dataTypes.inet;
    }
    else if (value instanceof types.Tuple) {
        code = dataTypes.tuple;
    }
    else if (value instanceof types.LocalDate) {
        code = dataTypes.date;
    }
    else if (value instanceof types.LocalTime) {
        code = dataTypes.time;
    }
    else if (value instanceof types.Duration) {
        code = dataTypes.custom;
        info = customTypeNames.duration;
    }
    else if (Array.isArray(value)) {
        code = dataTypes.list;
    }
    else if (value instanceof Geometry) {
        code = dataTypes.custom;
        if (value instanceof LineString) {
            info = customTypeNames.lineString;
        } else if (value instanceof Point) {
            info = customTypeNames.point;
        } else if (value instanceof Polygon) {
            info = customTypeNames.polygon;
        }
    }
    else if (value instanceof DateRange) {
        code = dataTypes.custom;
        info = customTypeNames.dateRange;
    }

    if (code === null) {
        return null;
    }

    return { code, info };
};

/**
 * Gets a buffer containing with the bytes (BE) representing the collection length for protocol v2 and below
 *
 * @param {Buffer | number} value
 * @returns {Buffer}
 * @private
 */
function getLengthBufferV2(value) {
    if (!value) {
        return buffers.int16Zero;
    }

    const lengthBuffer = utils.allocBufferUnsafe(2);
    if (typeof value === 'number') {
        lengthBuffer.writeUInt16BE(value, 0);
    }
    else {
        lengthBuffer.writeUInt16BE(value.length, 0);
    }

    return lengthBuffer;
}

/**
 * Gets a buffer containing with the bytes (BE) representing the collection length for protocol v3 and above
 *
 * @param {Buffer | number} value
 * @returns {Buffer}
 * @private
 */
function getLengthBufferV3(value) {
    if (!value) {
        return buffers.int32Zero;
    }

    const lengthBuffer = utils.allocBufferUnsafe(4);
    if (typeof value === 'number') {
        lengthBuffer.writeInt32BE(value, 0);
    }
    else {
        lengthBuffer.writeInt32BE(value.length, 0);
    }

    return lengthBuffer;
}

/**
 * @param {Buffer} buffer
 * @private
 */
function handleBufferCopy(buffer) {
    if (buffer === null) {
        return null;
    }

    return utils.copyBuffer(buffer);
}

/**
 * @param {Buffer} buffer
 * @private
 */
function handleBufferRef(buffer) {
    return buffer;
}

/**
 * Decodes collection length for protocol v3 and above
 *
 * @param bytes
 * @param offset
 * @returns {number}
 * @private
 */
function decodeCollectionLengthV3(bytes, offset) {
    return bytes.readInt32BE(offset);
}

/**
 * Decodes collection length for protocol v2 and below
 *
 * @param bytes
 * @param offset
 * @returns {number}
 * @private
 */
function decodeCollectionLengthV2(bytes, offset) {
    return bytes.readUInt16BE(offset);
}

function decodeDuration(bytes) {
    return types.Duration.fromBuffer(bytes);
}

function encodeDuration(value) {
    if (!(value instanceof types.Duration)) {
        throw new TypeError('Not a valid duration, expected Duration/Buffer obtained ' + util.inspect(value));
    }

    return value.toBuffer();
}

/**
 * @private
 * @param {Buffer} buffer
 */
function decodeLineString(buffer) {
    return LineString.fromBuffer(buffer);
}

/**
 * @private
 * @param {LineString} value
 */
function encodeLineString(value) {
    return value.toBuffer();
}

/**
 * @private
 * @param {Buffer} buffer
 */
function decodePoint(buffer) {
    return Point.fromBuffer(buffer);
}

/**
 * @private
 * @param {LineString} value
 */
function encodePoint(value) {
    return value.toBuffer();
}

/**
 * @private
 * @param {Buffer} buffer
 */
function decodePolygon(buffer) {
    return Polygon.fromBuffer(buffer);
}

/**
 * @private
 * @param {Polygon} value
 */
function encodePolygon(value) {
    return value.toBuffer();
}

function decodeDateRange(buffer) {
    return DateRange.fromBuffer(buffer);
}

/**
 * @private
 * @param {DateRange} value
 */
function encodeDateRange(value) {
    return value.toBuffer();
}

/**
 * @param {string} value
 * @param {number} startIndex
 * @param {number} length
 * @param {string} [open]
 * @param {string} [close]
 * @returns {Array}
 * @private
 */
function parseParams(value, startIndex, length, open, close) {
    open = open || '(';
    close = close || ')';
    const types = [];
    let paramStart = startIndex;
    let level = 0;
    for (let i = startIndex; i < startIndex + length; i++) {
        const c = value[i];
        if (c === open) {
            level++;
        }

        if (c === close) {
            level--;
        }

        if (level === 0 && c === ',') {
            types.push(value.substr(paramStart, i - paramStart));
            paramStart = i + 1;
        }
    }

    // Add the last one
    types.push(value.substr(paramStart, length - (paramStart - startIndex)));
    return types;
}

/**
 * @param {Array.<Buffer>} parts
 * @param {number} totalLength
 * @returns {Buffer}
 * @private
 */
function concatRoutingKey(parts, totalLength) {
    if (totalLength === 0) {
        return null;
    }

    if (parts.length === 1) {
        return parts[0];
    }

    const routingKey = utils.allocBufferUnsafe(totalLength);
    let offset = 0;
    for (const item of parts) {
        routingKey.writeUInt16BE(item.length, offset);
        offset += 2;
        item.copy(routingKey, offset);
        offset += item.length;
        routingKey[offset] = 0;
        offset++;
    }

    return routingKey;
}

module.exports = Encoder;
