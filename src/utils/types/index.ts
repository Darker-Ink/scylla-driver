/* eslint-disable prefer-named-capture-group */
import { Buffer } from 'node:buffer';
import Long from 'long';
// import errors from '../errors';
// import utils from '../utils';
import protocolVersion from './protocolVersion.js';
// import TimeUuid from './time-uuid';
// import Uuid from './uuid';


interface CassandraConsistencyLevels {
    all: number;
    any: number;
    eachQuorum: number;
    localOne: number;
    localQuorum: number;
    localSerial: number;
    one: number;
    quorum: number;
    serial: number;
    three: number;
    two: number;
}


const consistencies: CassandraConsistencyLevels = {
    any: 0x00,
    one: 0x01,
    two: 0x02,
    three: 0x03,
    quorum: 0x04,
    all: 0x05,
    localQuorum: 0x06,
    eachQuorum: 0x07,
    serial: 0x08,
    localSerial: 0x09,
    localOne: 0x0a
};

/**
 * Mapping of consistency level codes to their string representation.
 *
 * @type {object}
 */
const consistencyToString = {
    [consistencies.any]: 'ANY',
    [consistencies.one]: 'ONE',
    [consistencies.two]: 'TWO',
    [consistencies.three]: 'THREE',
    [consistencies.quorum]: 'QUORUM',
    [consistencies.all]: 'ALL',
    [consistencies.localQuorum]: 'LOCAL_QUORUM',
    [consistencies.eachQuorum]: 'EACH_QUORUM',
    [consistencies.serial]: 'SERIAL',
    [consistencies.localSerial]: 'LOCAL_SERIAL',
    [consistencies.localOne]: 'LOCAL_ONE'
};

interface DataTypes {
    ascii: number;
    bigint: number;
    blob: number;
    boolean: number;
    counter: number;
    custom: number;
    date: number;
    decimal: number;
    double: number;
    duration: number;
    float: number;
    inet: number;
    int: number;
    list: number;
    map: number;
    set: number;
    smallint: number;
    text: number;
    time: number;
    timestamp: number;
    timeuuid: number;
    tinyint: number;
    tuple: number;
    udt: number;
    uuid: number;
    varchar: number;
    varint: number;
}

const dataTypes: DataTypes = {
    custom: 0x0000,
    ascii: 0x0001,
    bigint: 0x0002,
    blob: 0x0003,
    boolean: 0x0004,
    counter: 0x0005,
    decimal: 0x0006,
    double: 0x0007,
    float: 0x0008,
    int: 0x0009,
    text: 0x000a,
    timestamp: 0x000b,
    uuid: 0x000c,
    varchar: 0x000d,
    varint: 0x000e,
    timeuuid: 0x000f,
    inet: 0x0010,
    date: 0x0011,
    time: 0x0012,
    smallint: 0x0013,
    tinyint: 0x0014,
    duration: 0x0015,
    list: 0x0020,
    map: 0x0021,
    set: 0x0022,
    udt: 0x0030,
    tuple: 0x0031
};

const getByName = (name: string): { code: number, info: any; } => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.indexOf('<') > 0) {
        const listMatches = /^(list|set)<(.+)>$/.exec(lowercaseName);
        const mapMatches = /^(map)< *(.+) *, *(.+)>$/.exec(lowercaseName);
        const udtMatches = /^(udt)<(.+)>$/.exec(lowercaseName);
        const tupleMatches = /^(tuple)<(.+)>$/.exec(lowercaseName);

        if (listMatches?.[2] !== undefined) {
            return {
                code: dataTypes[listMatches[1] as keyof DataTypes],
                info: getByName(listMatches[2])
            };
        }

        if (mapMatches?.[2] !== undefined && mapMatches?.[3] !== undefined) {
            return {
                code: dataTypes[mapMatches[1] as keyof DataTypes],
                info: [getByName(mapMatches[2]), getByName(mapMatches[3])]
            };
        }

        if (udtMatches?.[2] !== undefined) {
            return {
                code: dataTypes[udtMatches[1] as keyof DataTypes],
                info: udtMatches[2]
            };
        }

        if (tupleMatches?.[2] !== undefined) {
            return {
                code: dataTypes[tupleMatches[1] as keyof DataTypes],
                info: tupleMatches[2].split(',').map((x) => {
                    return getByName(x.trim());
                })
            };
        }
    }

    return {
        code: dataTypes[lowercaseName as keyof DataTypes],
        info: null
    };
};

interface CassandraNodeDistance {
    ignored: number;
    local: number;
    remote: number;
}

/**
 * Represents the distance of Cassandra node as assigned by a LoadBalancingPolicy relatively to the driver instance.
 */
const distance: CassandraNodeDistance = {
    local: 0,
    remote: 1,
    ignored: 2
};

/**
 * An integer byte that distinguish the actual message from and to Cassandra
 *
 * @internal
 * @ignore
 */
const opcodes = {
    error: 0x00,
    startup: 0x01,
    ready: 0x02,
    authenticate: 0x03,
    credentials: 0x04,
    options: 0x05,
    supported: 0x06,
    query: 0x07,
    result: 0x08,
    prepare: 0x09,
    execute: 0x0a,
    register: 0x0b,
    event: 0x0c,
    batch: 0x0d,
    authChallenge: 0x0e,
    authResponse: 0x0f,
    authSuccess: 0x10,
    cancel: 0xff
};

/**
 * Event types from Cassandra
 *
 * @type {{topologyChange: string, statusChange: string, schemaChange: string}}
 * @internal
 * @ignore
 */
const protocolEvents = {
    topologyChange: 'TOPOLOGY_CHANGE',
    statusChange: 'STATUS_CHANGE',
    schemaChange: 'SCHEMA_CHANGE'
};

interface CassandraServerErrorCodes {
    alreadyExists: number;
    badCredentials: number;
    clientWriteFailure: number;
    configError: number;
    functionFailure: number;
    invalid: number;
    isBootstrapping: number;
    overloaded: number;
    protocolError: number;
    readFailure: number;
    readTimeout: number;
    serverError: number;
    syntaxError: number;
    truncateError: number;
    unauthorized: number;
    unavailableException: number;
    unprepared: number;
    writeFailure: number;
    writeTimeout: number;
}


/**
 * Server error codes returned by Cassandra
 */
const responseErrorCodes: CassandraServerErrorCodes = {
    serverError: 0x0000,
    protocolError: 0x000A,
    badCredentials: 0x0100,
    unavailableException: 0x1000,
    overloaded: 0x1001,
    isBootstrapping: 0x1002,
    truncateError: 0x1003,
    writeTimeout: 0x1100,
    readTimeout: 0x1200,
    readFailure: 0x1300,
    functionFailure: 0x1400,
    writeFailure: 0x1500,
    syntaxError: 0x2000,
    unauthorized: 0x2100,
    invalid: 0x2200,
    configError: 0x2300,
    alreadyExists: 0x2400,
    unprepared: 0x2500,
    clientWriteFailure: 0x8000,

};

/**
 * Type of result included in a response
 */
const resultKind = {
    voidResult: 0x0001,
    rows: 0x0002,
    setKeyspace: 0x0003,
    prepared: 0x0004,
    schemaChange: 0x0005
};

/**
 * Message frame flags
 */
const frameFlags = {
    compression: 0x01,
    tracing: 0x02,
    customPayload: 0x04,
    warning: 0x08
};

/**
 * Unset representation.
 * 
 * Use this field if you want to set a parameter to <code>unset</code>. Valid for Cassandra 2.2 and above.
 */
const unset = Object.freeze({ unset: true });

/**
 * A long representing the value 1000
 */
const _longOneThousand = Long.fromInt(1_000);

/**
 * Counter used to generate up to 1000 different timestamp values with the same Date
 */
let _timestampTicks = 0;

interface DataTypesByCode {
    [key: number]: string;
}

const dataTypesByCode: DataTypesByCode = Object.keys(dataTypes).reduce((acc, key) => {
    const val = dataTypes[key as keyof DataTypes];
    
    if (typeof val !== 'number') {
        return acc;
    }
    
    return {
        ...acc,
        [val]: key
    };
}, {});



/**
 * Gets the data type name for a given type definition
 */
const getDataTypeNameByCode = (item: { code: number, info: any }): string => {
    if (!item || typeof item.code !== 'number') {
        throw new TypeError('Invalid signature type definition');
    }

    const typeName = dataTypesByCode[item.code];
    
    if (!typeName) {
        throw new TypeError(`Type with code ${item.code} not found`);
    }

    if (!item.info) {
        return typeName;
    }

    if (Array.isArray(item.info)) {
        return (typeName +
            '<' +
            item.info.map((tinfo) => {
                return getDataTypeNameByCode(tinfo);
            }).join(', ') +
            '>');
    }

    if (typeof item.info.code === 'number') {
        return typeName + '<' + getDataTypeNameByCode(item.info) + '>';
    }

    return typeName;
};

// classes

/**
 * Represents a frame header that could be used to read from a Buffer or to write to a Buffer
 */
class FrameHeader {
    public version: number;
    
    public flags: number;
    
    public streamId: number;
    
    public opcode: number;
    
    public bodyLength: number;

    public constructor(version: number, flags: number, streamId: number, opcode: number, bodyLength: number) {
        this.version = version;
        this.flags = flags;
        this.streamId = streamId;
        this.opcode = opcode;
        this.bodyLength = bodyLength;
    }

    /**
     * The length of the header of the frame based on the protocol version
     *
     * @returns {number}
     */
    public static size(version: number): number {
        if (protocolVersion.uses2BytesStreamIds(version)) {
            return 9;
        }

        return 8;
    };

    /**
     * Gets the protocol version based on the first byte of the header
     */
    public getProtocolVersion(buffer: Buffer): number {
        if (!buffer[0]) {
            throw new Error('Buffer must contain at least 1 byte');
        }
        
        return buffer[0] & 0x7F;
    }
    
    public fromBuffer(buf: Buffer, offset: number) {
        let streamId = 0;
        let newOffset = offset;
        
        if (!newOffset) {
            newOffset = 0;
        }
    
        const bufOffset = buf[newOffset++]
        
        if (!bufOffset) {
            throw new Error('Buffer must contain at least 1 byte');
        }
        
        const version = bufOffset & 0x7F;
        const flags = buf.readUInt8(newOffset++);
        
        if (protocolVersion.uses2BytesStreamIds(version)) {
            streamId = buf.readInt16BE(newOffset);
            newOffset += 2;
        } else {
            streamId = buf.readInt8(newOffset++);
        }
    
        return new FrameHeader(version, flags, streamId, buf.readUInt8(newOffset++), buf.readUInt32BE(offset));
    };
    
    public toBuffer(): Buffer {
        const buf = Buffer.alloc(FrameHeader.size(this.version));
        buf.writeUInt8(this.version, 0);
        buf.writeUInt8(this.flags, 1);
        let offset = 3;
        if (protocolVersion.uses2BytesStreamIds(this.version)) {
            buf.writeInt16BE(this.streamId, 2);
            offset = 4;
        } else {
            buf.writeInt8(this.streamId, 2);
        }
    
        buf.writeUInt8(this.opcode, offset++);
        buf.writeUInt32BE(this.bodyLength, offset);
        return buf;
    };
}

/**
 * Generates a value representing the timestamp for the query in microseconds based on the date and the microseconds provided
 */
const generateTimestamp = (date: Date, microseconds: number): Long => {
    let newDate = date;

    if (!newDate) {
        newDate = new Date();
    }

    let longMicro = Long.ZERO;

    if (typeof microseconds === 'number' && microseconds >= 0 && microseconds < 1_000) {
        longMicro = Long.fromInt(microseconds);
    } else {
        if (_timestampTicks > 999) {
            _timestampTicks = 0;
        }

        longMicro = Long.fromInt(_timestampTicks);
        _timestampTicks++;
    }

    return Long
        .fromNumber(date.getTime())
        .multiply(_longOneThousand)
        .add(longMicro);
};


// exports.opcodes = opcodes;
// exports.consistencies = consistencies;
// exports.consistencyToString = consistencyToString;
// exports.dataTypes = dataTypes;
// exports.getDataTypeNameByCode = getDataTypeNameByCode;
// exports.distance = distance;
// exports.frameFlags = frameFlags;
// exports.protocolEvents = protocolEvents;
// exports.responseErrorCodes = responseErrorCodes;
// exports.resultKind = resultKind;
// exports.FrameHeader = FrameHeader;
// exports.Long = Long;
// exports.unset = unset;
// exports.generateTimestamp = generateTimestamp;

export {
    opcodes,
    consistencies,
    consistencyToString,
    dataTypes,
    getDataTypeNameByCode,
    distance,
    frameFlags,
    protocolEvents,
    responseErrorCodes,
    resultKind,
    FrameHeader,
    unset,
    generateTimestamp
}
