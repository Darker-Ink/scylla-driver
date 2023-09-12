import { Buffer } from 'node:buffer';

enum consistencies {
    any = 0x00,
    one = 0x01,
    two = 0x02,
    three = 0x03,
    quorum = 0x04,
    all = 0x05,
    localQuorum = 0x06,
    eachQuorum = 0x07,
    serial = 0x08,
    localSerial = 0x09,
    localOne = 0x0a
}

enum dataTypes {
    custom = 0x0000,
    ascii = 0x0001,
    bigint = 0x0002,
    blob = 0x0003,
    boolean = 0x0004,
    counter = 0x0005,
    decimal = 0x0006,
    double = 0x0007,
    float = 0x0008,
    int = 0x0009,
    text = 0x000a,
    timestamp = 0x000b,
    uuid = 0x000c,
    varchar = 0x000d,
    varint = 0x000e,
    timeuuid = 0x000f,
    inet = 0x0010,
    date = 0x0011,
    time = 0x0012,
    smallint = 0x0013,
    tinyint = 0x0014,
    duration = 0x0015,
    list = 0x0020,
    map = 0x0021,
    set = 0x0022,
    udt = 0x0030,
    tuple = 0x0031,
}

enum distance {
    local = 0,
    remote = 1,
    ignored = 2
}

enum responseErrorCodes {
    serverError = 0x0000,
    protocolError = 0x000A,
    badCredentials = 0x0100,
    unavailableException = 0x1000,
    overloaded = 0x1001,
    isBootstrapping = 0x1002,
    truncateError = 0x1003,
    writeTimeout = 0x1100,
    readTimeout = 0x1200,
    readFailure = 0x1300,
    functionFailure = 0x1400,
    writeFailure = 0x1500,
    syntaxError = 0x2000,
    unauthorized = 0x2100,
    invalid = 0x2200,
    configError = 0x2300,
    alreadyExists = 0x2400,
    unprepared = 0x2500,
    clientWriteFailure = 0x8000
}

enum opcodes {
    error = 0x00,
    startup = 0x01,
    ready = 0x02,
    authenticate = 0x03,
    credentials = 0x04,
    options = 0x05,
    supported = 0x06,
    query = 0x07,
    result = 0x08,
    prepare = 0x09,
    execute = 0x0a,
    register = 0x0b,
    event = 0x0c,
    batch = 0x0d,
    authChallenge = 0x0e,
    authResponse = 0x0f,
    authSuccess = 0x10,
    cancel = 0xff
};

enum protocolVersion {
    v1 = 0x01,
    v2 = 0x02,
    v3 = 0x03,
    v4 = 0x04,
    v5 = 0x05,
    v6 = 0x06,
    dseV1 = 0x41,
    dseV2 = 0x42,
}

// eslint-disable-next-line unicorn/better-regex -- I do not care if it can be better
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const buffers = {
    int16Zero: Buffer.from([0, 0]),
    int32Zero: Buffer.from([0, 0, 0, 0]),
    int8Zero: Buffer.from([0]),
    int8One: Buffer.from([1]),
    int8MaxValue: Buffer.from([0xff])
};

const bigInt32 = BigInt(32);
const bigInt8 = BigInt(8);
const bigInt0 = BigInt(0);
const bigIntMinus1 = BigInt(-1);
const bigInt32BitsOn = BigInt(0xffffffff);
const bigInt8BitsOn = BigInt(0xff);

const complexTypeNames = Object.freeze({
    list: 'org.apache.cassandra.db.marshal.ListType',
    set: 'org.apache.cassandra.db.marshal.SetType',
    map: 'org.apache.cassandra.db.marshal.MapType',
    udt: 'org.apache.cassandra.db.marshal.UserType',
    tuple: 'org.apache.cassandra.db.marshal.TupleType',
    frozen: 'org.apache.cassandra.db.marshal.FrozenType',
    reversed: 'org.apache.cassandra.db.marshal.ReversedType',
    composite: 'org.apache.cassandra.db.marshal.CompositeType',
    empty: 'org.apache.cassandra.db.marshal.EmptyType',
    collection: 'org.apache.cassandra.db.marshal.ColumnToCollectionType'
});

const cqlNames = Object.freeze({
    frozen: 'frozen',
    list: 'list',
    'set': 'set',
    map: 'map',
    tuple: 'tuple',
    empty: 'empty',
    duration: 'duration'
});

const singleTypeNames = Object.freeze({
    'org.apache.cassandra.db.marshal.UTF8Type': dataTypes.varchar,
    'org.apache.cassandra.db.marshal.AsciiType': dataTypes.ascii,
    'org.apache.cassandra.db.marshal.UUIDType': dataTypes.uuid,
    'org.apache.cassandra.db.marshal.TimeUUIDType': dataTypes.timeuuid,
    'org.apache.cassandra.db.marshal.Int32Type': dataTypes.int,
    'org.apache.cassandra.db.marshal.BytesType': dataTypes.blob,
    'org.apache.cassandra.db.marshal.FloatType': dataTypes.float,
    'org.apache.cassandra.db.marshal.DoubleType': dataTypes.double,
    'org.apache.cassandra.db.marshal.BooleanType': dataTypes.boolean,
    'org.apache.cassandra.db.marshal.InetAddressType': dataTypes.inet,
    'org.apache.cassandra.db.marshal.SimpleDateType': dataTypes.date,
    'org.apache.cassandra.db.marshal.TimeType': dataTypes.time,
    'org.apache.cassandra.db.marshal.ShortType': dataTypes.smallint,
    'org.apache.cassandra.db.marshal.ByteType': dataTypes.tinyint,
    'org.apache.cassandra.db.marshal.DateType': dataTypes.timestamp,
    'org.apache.cassandra.db.marshal.TimestampType': dataTypes.timestamp,
    'org.apache.cassandra.db.marshal.LongType': dataTypes.bigint,
    'org.apache.cassandra.db.marshal.DecimalType': dataTypes.decimal,
    'org.apache.cassandra.db.marshal.IntegerType': dataTypes.varint,
    'org.apache.cassandra.db.marshal.CounterColumnType': dataTypes.counter
});

const singleFqTypeNamesLength = Object.keys(singleTypeNames).reduce((previous, current) => {
    return current.length > previous ? current.length : previous;
}, 0);

const customTypeNames = Object.freeze({
    duration: 'org.apache.cassandra.db.marshal.DurationType',
    lineString: 'org.apache.cassandra.db.marshal.LineStringType',
    point: 'org.apache.cassandra.db.marshal.PointType',
    polygon: 'org.apache.cassandra.db.marshal.PolygonType',
    dateRange: 'org.apache.cassandra.db.marshal.DateRangeType'
});

const nullValueBuffer = Buffer.from([255, 255, 255, 255]);
const unsetValueBuffer = Buffer.from([255, 255, 255, 254]);

/**
 * For backwards compatibility, empty buffers as text/blob/custom values are supported.
 * In the case of other types, they are going to be decoded as a `null` value.
 */
const zeroLengthTypesSupported = new Set([
    dataTypes.text,
    dataTypes.ascii,
    dataTypes.varchar,
    dataTypes.custom,
    dataTypes.blob
]);

enum consistencyToString {
    all = 'ALL',
    any = 'ANY',
    eachQuorum = 'EACH_QUORUM',
    localOne = 'LOCAL_ONE',
    localQuorum = 'LOCAL_QUORUM',
    localSerial = 'LOCAL_SERIAL',
    one = 'ONE',
    quorum = 'QUORUM',
    serial = 'SERIAL',
    three = 'THREE',
    two = 'TWO'
}

enum protocolEvents {
    schemaChange = 'SCHEMA_CHANGE',
    statusChange = 'STATUS_CHANGE',
    topologyChange = 'TOPOLOGY_CHANGE'
}

enum resultKind {
    voidResult = 0x0001,
    rows = 0x0002,
    setKeyspace = 0x0003,
    prepared = 0x0004,
    schemaChange = 0x0005
}

enum frameFlags {
    compression = 0x01,
    tracing = 0x02,
    customPayload = 0x04,
    warning = 0x08
}

const unset = Object.freeze({ unset: true });

export {
    uuidRegex,
    buffers,
    bigInt32,
    bigInt8,
    bigInt0,
    bigIntMinus1,
    bigInt32BitsOn,
    bigInt8BitsOn,
    complexTypeNames,
    nullValueBuffer,
    unsetValueBuffer,
    zeroLengthTypesSupported,
    customTypeNames,
    singleFqTypeNamesLength,
    cqlNames,
    consistencies,
    dataTypes,
    distance,
    responseErrorCodes,
    protocolVersion,
    opcodes,
    consistencyToString,
    protocolEvents,
    singleTypeNames,
    resultKind,
    frameFlags,
    unset
};
