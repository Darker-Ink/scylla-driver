import { dataTypes } from "../constants";

class Encoder {
    public protocolVersion: number;
    
    public constructor(protocolVersion: number) {
        this.protocolVersion = protocolVersion;
        
        this.encoders = {
            [dataTypes.custom]: (),
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
        
        }
    }
}

export {
    Encoder
}
