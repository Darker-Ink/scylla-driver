import type { ConnectionOptions } from 'node:tls';
import type { URL } from 'node:url';

export interface QueryOptions {
    autoPage?: boolean;
    captureStackTrace?: boolean;
    consistency?: number;
    counter?: boolean;
    customPayload?: any;
    // executionProfile?: ExecutionProfile | string;
    fetchSize?: number;
    hints?: string[] | string[][];
    // host?: Host;
    isIdempotent?: boolean;
    keyspace?: string;
    logged?: boolean;
    // pageState?: Buffer | string;
    prepare?: boolean;
    readTimeout?: number;
    // retry?: policies.retry.RetryPolicy;
    routingIndexes?: number[];
    // routingKey?: Buffer | Buffer[];
    routingNames?: string[];
    serialConsistency?: number;
    timestamp?: Long | number;
    traceQuery?: boolean;
  }

export interface ClientOptions {
    // authProvider?: auth.AuthProvider;
    cloud?: {
      secureConnectBundle: URL | string;
    };
    contactPoints?: string[];
    credentials?: {
      password: string;
      username: string;
    },
    encoding?: {
      copyBuffer?: boolean;
      map?: Function;
      set?: Function;
      useBigIntAsLong?: boolean;
      useBigIntAsVarint?: boolean;
      useUndefinedAsUnset?: boolean;
    };
  
    isMetadataSyncEnabled?: boolean;
    keyspace?: string;
    localDataCenter?: string;
    maxPrepared?: number;
    // metrics?: metrics.ClientMetrics;
    // policies?: {
    //   addressResolution?: policies.addressResolution.AddressTranslator;
    //   loadBalancing?: policies.loadBalancing.LoadBalancingPolicy;
    //   reconnection?: policies.reconnection.ReconnectionPolicy;
    //   retry?: policies.retry.RetryPolicy;
    //   speculativeExecution?: policies.speculativeExecution.SpeculativeExecutionPolicy;
    //   timestampGeneration?: policies.timestampGeneration.TimestampGenerator;
    // };
    pooling?: {
      coreConnectionsPerHost?: { [key: number]: number; };
      heartBeatInterval?: number;
      maxRequestsPerConnection?: number;
      warmup?: boolean;
    };
    prepareOnAllHosts?: boolean;
    protocolOptions?: {
      maxSchemaAgreementWaitSeconds?: number;
      maxVersion?: number;
      noCompact?: boolean;
      port?: number;
    };
    queryOptions?: QueryOptions;
    rePrepareOnUp?: boolean;
    refreshSchemaDelay?: number;
    socketOptions?: {
      coalescingThreshold?: number;
      connectTimeout?: number;
      defunctReadTimeoutThreshold?: number;
      keepAlive?: boolean;
      keepAliveDelay?: number;
      readTimeout?: number;
      tcpNoDelay?: boolean;
    };
    sslOptions?: ConnectionOptions;
  }
