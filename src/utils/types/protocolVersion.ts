// finish the rewrite of the last function when its needed
// const utils = require('../utils');
// const VersionNumber = require('./version-number');

// const v200 = VersionNumber.parse('2.0.0');
// const v210 = VersionNumber.parse('2.1.0');
// const v220 = VersionNumber.parse('2.2.0');
// const v300 = VersionNumber.parse('3.0.0');
// const v510 = VersionNumber.parse('5.1.0');
// const v600 = VersionNumber.parse('6.0.0');

class protocolVersion {
    public static v1: number = 0x01;
    
    public static v2: number = 0x02;
    
    public static v3: number = 0x03;
    
    public static v4: number = 0x04;
    
    public static v5: number = 0x05;
    
    public static v6: number = 0x06;
    
    public static dseV1: number = 0x41;
    
    public static dseV2: number = 0x42;
    
    public static maxSupported: number = 0x42;
    
    public static minSupported: number = 0x01;
    

    public static isDse(version: number): boolean {
        return (version >= protocolVersion.dseV1 && version <= protocolVersion.dseV2);
    }

    public static isSupportedCassandra(version: number): boolean {
        return (version <= protocolVersion.v4 && version >= protocolVersion.v1);
    }

    public static isSupported(version: number): boolean {
        return (protocolVersion.isDse(version) || protocolVersion.isSupportedCassandra(version));
    }

    public static supportsPrepareFlags(version: number): boolean {
        return (version === protocolVersion.dseV2);
    }

    public static supportsKeyspaceInRequest(version: number): boolean {
        return (version === protocolVersion.dseV2);
    }

    public static supportsResultMetadataId(version: number): boolean {
        return (version === protocolVersion.dseV2);
    }

    public static supportsPreparedPartitionKey(version: number): boolean {
        return (version >= protocolVersion.v4);
    }

    public static supportsSchemaChangeFullMetadata(version: number): boolean {
        return (version >= protocolVersion.v3);
    }

    public static supportsContinuousPaging(version: number): boolean {
        return (protocolVersion.isDse(version));
    }

    public static supportsPaging(version: number): boolean {
        return (version >= protocolVersion.v2);
    }

    public static supportsTimestamp(version: number): boolean {
        return (version >= protocolVersion.v3);
    }

    public static supportsNamedParameters(version: number): boolean {
        return (version >= protocolVersion.v3);
    }

    public static supportsUnset(version: number): boolean {
        return (version >= protocolVersion.v4);
    }

    public static supportsFailureReasonMap(version: number): boolean {
        return (version >= protocolVersion.v5);
    }

    public static uses2BytesStreamIds(version: number): boolean {
        return (version >= protocolVersion.v3);
    }

    public static uses4BytesCollectionLength(version: number): boolean {
        return (version >= protocolVersion.v3);
    }

    public static uses4BytesQueryFlags(version: number): boolean {
        return (protocolVersion.isDse(version));
    }

    public static canStartupResponseErrorBeWrapped(version: number): boolean {
        return (version >= protocolVersion.v4);
    }

    public static getLowerSupported(version: number): number {
        if (version >= protocolVersion.v5) {
            return protocolVersion.v4;
        }

        if (version <= protocolVersion.v1) {
            return 0;
        }

        return version - 1;
    }

    // public static getHighestCommon(connection: Connection, hosts: Host[]): number {
    //     const log = connection.log ? connection.log.bind(connection) : utils.noop;
    //     let maxVersion = connection.protocolVersion;
    //     let v3Requirement = false;
    //     let maxVersionWith3OrMore = maxVersion;
    //     for (const h of hosts) {
    //         let dseVersion = null;
    //         if (h.dseVersion) {
    //             dseVersion = VersionNumber.parse(h.dseVersion);
    //             log('verbose', `Encountered host ${h.address} with dse version ${dseVersion}`);
    //             if (dseVersion.compare(v510) >= 0) {
    //                 v3Requirement = true;
    //                 if (dseVersion.compare(v600) >= 0) {
    //                     maxVersion = Math.min(protocolVersion.dseV2, maxVersion);
    //                 } else {
    //                     maxVersion = Math.min(protocolVersion.dseV1, maxVersion);
    //                 }
    //                 maxVersionWith3OrMore = maxVersion;
    //                 continue;
    //             }
    //         }

    //         if (!h.cassandraVersion || h.cassandraVersion.length === 0) {
    //             log('warning', 'Encountered host ' + h.address + ' with no cassandra version,' +
    //                 ' skipping as part of protocol version evaluation');
    //             continue;
    //         }

    //         try {
    //             const cassandraVersion = VersionNumber.parse(h.cassandraVersion);
    //             if (!dseVersion) {
    //                 log('verbose', 'Encountered host ' + h.address + ' with cassandra version ' + cassandraVersion);
    //             }

    //             if (cassandraVersion.compare(v300) >= 0) {
    //                 v3Requirement = true;
    //                 maxVersion = Math.min(protocolVersion.v4, maxVersion);
    //                 maxVersionWith3OrMore = maxVersion;
    //             } else if (cassandraVersion.compare(v220) >= 0) {
    //                 maxVersion = Math.min(protocolVersion.v4, maxVersion);
    //                 maxVersionWith3OrMore = maxVersion;
    //             } else if (cassandraVersion.compare(v210) >= 0) {
    //                 maxVersion = Math.min(protocolVersion.v3, maxVersion);
    //                 maxVersionWith3OrMore = maxVersion;
    //             } else if (cassandraVersion.compare(v200) >= 0) {
    //                 maxVersion = Math.min(protocolVersion.v2, maxVersion);
    //             } else {
    //                 maxVersion = protocolVersion.v1;
    //             }
    //         } catch {
    //             log('warning', 'Encountered host ' + h.address + ' with unparseable cassandra version ' + h.cassandraVersion
    //                 + ' skipping as part of protocol version evaluation');
    //         }
    //     }

    //     if (v3Requirement && maxVersion < protocolVersion.v3) {
    //         const addendum = '. This should not be possible as nodes within a cluster can\'t be separated by more than one major version';
    //         if (maxVersionWith3OrMore < protocolVersion.v3) {
    //             log('error', 'Detected hosts that require at least protocol version 0x3, but currently connected to '
    //                 + connection.address + ':' + connection.port + ' using protocol version 0x' + maxVersionWith3OrMore
    //                 + '. Will not be able to connect to these hosts' + addendum);
    //         } else {
    //             log('error', 'Detected hosts with maximum protocol version of 0x' + maxVersion.toString(16)
    //                 + ' but there are some hosts that require at least version 0x3. Will not be able to connect to these older hosts'
    //                 + addendum);
    //         }

    //         maxVersion = maxVersionWith3OrMore;
    //     }

    //     log('verbose', 'Resolved protocol version 0x' + maxVersion.toString(16) + ' as the highest common protocol version among hosts');
    //     return maxVersion;
    // }

    public static isBeta(version: number): boolean {
        return version === protocolVersion.v5;
    }
}


export default protocolVersion;

export { protocolVersion };
