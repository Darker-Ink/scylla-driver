export interface DataTypes {
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
};

export interface CassandraConsistencyLevels {
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
};

export interface CassandraNodeDistance {
    ignored: number;
    local: number;
    remote: number;
};

export interface CassandraServerErrorCodes {
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
};
