//
// Based on the test ledger I've implemented for
// the hyperledger Cacti project. It can currently be found at:
// https://github.com/fazzatti/cacti/blob/stellar-connector/packages/cactus-test-tooling/src/main/typescript/stellar/stellar-test-ledger.ts
//
//

import Docker, {
  Container,
  ContainerCreateOptions,
  ContainerInfo,
} from "dockerode";

import EventEmitter from "events";
import {
  INetworkConfigData,
  IStellarTestLedger,
  IStellarTestLedgerOptions,
  NetworkOptions,
  ResourceLimitOptions,
  SupportedImageVersions,
} from "./types";
import { getByPredicate, getPublicPort } from "./utils";
import {
  pullImage,
  stop,
  streamLogs,
  waitForHealthCheck,
} from "./utils/index.js";

const DEFAULTS = Object.freeze({
  imageName: "stellar/quickstart",
  imageVersion: SupportedImageVersions.latest,
  network: NetworkOptions.Local,
  limits: ResourceLimitOptions.Testnet,
  useRunningLedger: false,
  emitContainerLogs: false,
});

export class StellarTestLedger implements IStellarTestLedger {
  public readonly containerImageName: string;
  public readonly containerImageVersion: SupportedImageVersions;

  private readonly network: string;
  private readonly limits: string;
  private readonly useRunningLedger: boolean;
  private readonly emitContainerLogs: boolean;

  public container: Container | undefined;
  public containerId: string | undefined;

  constructor(options?: IStellarTestLedgerOptions) {
    this.network = options?.network || DEFAULTS.network;
    this.limits = options?.limits || DEFAULTS.limits;

    if (this.network != NetworkOptions.Local) {
      throw new Error(
        `StellarTestLedger#constructor() network ${this.network} not supported yet.`
      );
    }
    if (this.limits != NetworkOptions.Testnet) {
      throw new Error(
        `StellarTestLedger#constructor() limits ${this.limits} not supported yet.`
      );
    }

    this.containerImageVersion =
      options?.containerImageVersion || DEFAULTS.imageVersion;

    // if image name is not a supported version
    if (
      !Object.values(SupportedImageVersions).includes(
        this.containerImageVersion
      )
    ) {
      throw new Error(
        `StellarTestLedger#constructor() containerImageVersion ${options?.containerImageVersion} not supported.`
      );
    }

    this.containerImageName = options?.containerImageName || DEFAULTS.imageName;

    this.useRunningLedger =
      options?.useRunningLedger === true
        ? (options?.useRunningLedger as boolean)
        : DEFAULTS.useRunningLedger;

    this.emitContainerLogs = options?.emitContainerLogs === true;
  }

  /**
   * Get the full container image name.
   *
   * @returns {string} Full container image name
   */
  public get fullContainerImageName(): string {
    return [this.containerImageName, this.containerImageVersion].join(":");
  }

  public getContainer(): Container {
    if (!this.container) {
      throw new Error(
        `StellarTestLedger#getContainer() Container not started yet by this instance.`
      );
    } else {
      return this.container;
    }
  }

  /**
   *
   * Get the container information for the test stellar ledger.
   *
   * @returns {ContainerInfo} Container information
   */
  protected async getContainerInfo(): Promise<ContainerInfo> {
    const fnTag = "StellarTestLedger#getContainerInfo()";
    const docker = new Docker();
    const image = this.containerImageName;
    const containerInfos = await docker.listContainers({});

    let aContainerInfo;
    if (this.containerId !== undefined) {
      aContainerInfo = containerInfos.find((ci) => ci.Id === this.containerId);
    }

    if (aContainerInfo) {
      return aContainerInfo;
    } else {
      throw new Error(`${fnTag} no image "${image}"`);
    }
  }

  /**
   *
   * Get the IP address of the container.
   *
   * @returns {string} IP address of the container
   */
  public async getContainerIpAddress(): Promise<string> {
    const fnTag = "StellarTestLedger#getContainerIpAddress()";
    const aContainerInfo = await this.getContainerInfo();

    if (aContainerInfo) {
      const { NetworkSettings } = aContainerInfo;
      const networkNames: string[] = Object.keys(NetworkSettings.Networks);
      if (
        networkNames.length < 1 ||
        !networkNames ||
        !networkNames[0] ||
        !NetworkSettings.Networks[networkNames[0]] ||
        !NetworkSettings.Networks[networkNames[0]]?.IPAddress
      ) {
        throw new Error(`${fnTag} container not connected to any networks`);
      } else {
        // return IP address of container on the first network that we found
        return NetworkSettings.Networks[networkNames[0]]?.IPAddress ?? "";
      }
    } else {
      throw new Error(`${fnTag} cannot find image: ${this.containerImageName}`);
    }
  }

  /**
   *
   * Get the commands to pass to the docker container.
   *
   * @returns {string[]} Array of commands to pass to the docker container
   */
  private getImageCommands(): string[] {
    const cmds = [];

    switch (this.network) {
      case NetworkOptions.Futurenet:
        cmds.push("--futurenet");
        break;
      case NetworkOptions.Testnet:
        cmds.push("--testnet");
        break;
      case NetworkOptions.Local:
      default:
        cmds.push("--local");
        break;
    }

    switch (this.limits) {
      case ResourceLimitOptions.Default:
        cmds.push("--limits", "default");
        break;
      case ResourceLimitOptions.Unlimited:
        cmds.push("--limits", "unlimited");
        break;
      case ResourceLimitOptions.Testnet:
      default:
        cmds.push("--limits", "testnet");
        break;
    }

    return cmds;
  }

  /**
   *
   * Get the network configuration data for the test stellar ledger.
   * This includes the network passphrase, rpcUrl, horizonUrl,
   * friendbotUrl, and the allowHttp flag.
   *
   * @returns {INetworkConfigData} Network configuration data
   */
  public async getNetworkConfiguration(): Promise<INetworkConfigData> {
    if (this.network != NetworkOptions.Local) {
      throw new Error(
        `StellarTestLedger#getNetworkConfiguration() network ${this.network} not supported yet.`
      );
    }
    const cInfo = await this.getContainerInfo();
    const publicPort = await getPublicPort(8000, cInfo);

    // Default docker internal domain. Redirects to the local host where docker is running.
    // can be used when involving multiple containers
    // const domain = "host.docker.internal";

    const domain = "localhost";

    return Promise.resolve({
      networkPassphrase: "Standalone Network ; February 2017",
      rpcUrl: `http://${domain}:${publicPort}/rpc`,
      horizonUrl: `http://${domain}:${publicPort}`,
      friendbotUrl: `http://${domain}:${publicPort}/friendbot`,
      allowHttp: true,
    });
  }

  /**
   *  Start a test stellar ledger.
   *
   * @param {boolean} omitPull - If true, the image will not be pulled from the registry.
   * @returns {Container} The container object.
   */
  public async start(omitPull = false): Promise<Container> {
    if (this.useRunningLedger) {
      console.log(
        "Search for already running Stellar Test Ledger because 'useRunningLedger' flag is enabled."
      );
      console.log(
        "Search criteria - image name: ",
        this.fullContainerImageName,
        ", state: running"
      );
      const containerInfo = await getByPredicate(
        (ci: ContainerInfo) =>
          ci.Image === this.fullContainerImageName && ci.State === "running"
      );
      const docker = new Docker();
      this.containerId = containerInfo.Id;
      this.container = docker.getContainer(this.containerId as string);
      return this.container;
    }

    if (this.container) {
      await this.container.stop();
      await this.container.remove();
      this.container = undefined;
      this.containerId = undefined;
    }

    if (!omitPull) {
      await pullImage(this.fullContainerImageName, {});
    }

    const createOptions: ContainerCreateOptions = {
      ExposedPorts: {
        "8000/tcp": {}, // Stellar services (Horizon, RPC and Friendbot)
      },
      HostConfig: {
        PublishAllPorts: true,
        Privileged: true,
      },
    };

    const Healthcheck = {
      Test: [
        "CMD-SHELL",
        "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000 | grep -q '200' && curl -s -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\": \"2.0\", \"id\": 8675309, \"method\": \"getHealth\"}' http://localhost:8000/rpc | grep -q 'healthy' && curl -s http://localhost:8000/friendbot | grep -q '\"status\": 400' || exit 1",
      ],
      Interval: 1000000000, // 1 second
      Timeout: 3000000000, // 3 seconds
      Retries: 60,
      StartPeriod: 1000000000, // 1 second
    };

    return new Promise<Container>((resolve, reject) => {
      const docker = new Docker();
      const eventEmitter: EventEmitter = docker.run(
        this.fullContainerImageName,
        [...this.getImageCommands()],
        [],
        { ...createOptions, Healthcheck: Healthcheck },
        {},
        (err: unknown) => {
          if (err) {
            reject(err);
          }
        }
      );

      eventEmitter.once("start", async (container: Container) => {
        this.container = container;
        this.containerId = container.id;

        if (this.emitContainerLogs) {
          const fnTag = `[${this.fullContainerImageName}]`;
          await streamLogs({
            container: this.container,
          });
        }

        try {
          console.log("Waiting for services to fully start.");
          await waitForHealthCheck(this.containerId);
          console.log("Stellar Test Ledger is ready.");
          resolve(container);
        } catch (ex) {
          console.log(ex);
          reject(ex);
        }
      });
    });
  }

  /**
   * Stop the test stellar ledger.
   *
   * @returns {Promise<unknown>} A promise that resolves when the ledger is stopped.
   */
  public async stop(): Promise<unknown> {
    if (this.useRunningLedger) {
      console.log("Ignore stop request because useRunningLedger is enabled.");
      return Promise.resolve();
    } else {
      return stop(this.getContainer());
    }
  }

  /**
   * Destroy the test stellar ledger.
   *
   * @returns {Promise<unknown>} A promise that resolves when the ledger is destroyed.
   */
  public async destroy(): Promise<unknown> {
    if (this.useRunningLedger) {
      console.log(
        "Ignore destroy request because useRunningLedger is enabled."
      );
      return Promise.resolve();
    } else if (this.container) {
      const docker = new Docker();
      const containerInfo = await this.container.inspect();
      const volumes = containerInfo.Mounts;
      await this.container.remove();
      volumes.forEach(async (volume) => {
        console.log(`Removing volume ${volume}`);
        if (volume.Name) {
          const volumeToDelete = docker.getVolume(volume.Name);
          await volumeToDelete.remove();
        } else {
          console.log(`Volume ${volume} could not be removed!`);
        }
      });
      return Promise.resolve();
    } else {
      return Promise.reject(
        new Error(
          `StellarTestLedger#destroy() Container was never created, nothing to destroy.`
        )
      );
    }
  }
}
