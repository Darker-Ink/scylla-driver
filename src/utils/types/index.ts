/* eslint-disable prefer-named-capture-group */
import { Buffer } from 'node:buffer';
import Long from 'long';
import type { DataTypes } from '../../types/constantTypes.js';
import { dataTypes } from '../constants.js';
import protocolVersion from './protocolVersion.js';

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
        .multiply(Long.fromInt(1_000))
        .add(longMicro);
};

export {
    getDataTypeNameByCode,
    FrameHeader,
    generateTimestamp
}
