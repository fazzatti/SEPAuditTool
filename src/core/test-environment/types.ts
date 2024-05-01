import { Container } from "dockerode";

export interface IStellarTestLedger {
  start(): Promise<Container>;
  stop(): Promise<unknown>;
  destroy(): Promise<unknown>;
  getNetworkConfiguration(): Promise<INetworkConfigData>;
  getContainer(): Container;
  getContainerIpAddress(): Promise<string>;
}

// For now, only the latest version of the image is supported.
// This enum can be expanded to support more versions in the future.
export enum SupportedImageVersions {
  latest = "latest",
}

// This interface defines the network configuration data for the test stellar ledger.
// This is used to manage the connections to different services necesary to interact with the ledger.
export interface INetworkConfigData {
  networkPassphrase: string;
  rpcUrl?: string;
  horizonUrl?: string;
  friendbotUrl?: string;
  allowHttp?: boolean;
}

export enum NetworkOptions {
  Local = "local", // (Default) pull up a new pristine network image locally.
  Futurenet = "futurenet", // pull up an image to connect to futurenet. Can take several minutes to sync the ledger state.
  Testnet = "testnet", // pull up an image to connect to testnet  Can take several minutes to sync the ledger state.
}

export enum ResourceLimitOptions {
  Default = "default", // leaves resource limits set extremely low as per Stellar's core default configuration
  Testnet = "testnet", // (Default) sets the limits to match those used on testnet.
  Unlimited = "unlimited", // set limits to maximum resources that can be configfured
}

export interface IStellarTestLedgerOptions {
  // Defines which type of network will the image will be configured to run.
  network?: NetworkOptions;

  // Defines the resource limits for soroban transactions. A valid transaction and only be included in a ledger
  // block if enough resources are available for that operation.
  limits?: ResourceLimitOptions;

  // For test development, attach to ledger that is already running, don't spin up new one
  useRunningLedger?: boolean;

  readonly containerImageName?: string;
  readonly containerImageVersion?: SupportedImageVersions;
  readonly emitContainerLogs?: boolean;
}
