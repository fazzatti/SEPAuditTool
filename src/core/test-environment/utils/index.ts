#!/usr/bin/node --experimental-vm-modules
//
// Reference implementation: Hyperledger Cacti project
// Container class at: https://github.com/hyperledger/cacti/blob/main/packages/cactus-test-tooling/src/main/typescript/common/containers.ts
//
//

import Dockerode, { Container, ContainerInfo } from "dockerode";
import { Duplex } from "stream";

export const getPublicPort = async (
  privatePort: number,
  aContainerInfo: ContainerInfo
): Promise<number> => {
  const { Ports: ports } = aContainerInfo;

  if (ports.length < 1) {
    throw new Error(`No ports exposed or mapped at all`);
  }
  const mapping = ports.find((x) => x.PrivatePort === privatePort);
  if (mapping) {
    if (!mapping.PublicPort) {
      throw new Error(`Port ${privatePort} mapped but not public`);
    } else if (mapping.IP !== "0.0.0.0") {
      throw new Error(`Port ${privatePort} mapped to 127.0.0.1`);
    } else {
      return mapping.PublicPort;
    }
  } else {
    throw new Error(`No mapping found for ${privatePort}`);
  }
};

export const getByPredicate = async (
  pred: (ci: ContainerInfo) => boolean
): Promise<ContainerInfo> => {
  const docker = new Dockerode();
  const containerList = await docker.listContainers();
  const containerInfo = containerList.find(pred);

  if (!containerInfo) {
    throw new Error(`No container that matches given predicate!`);
  }

  return containerInfo;
};

export const getById = async (containerId: string): Promise<ContainerInfo> => {
  try {
    return getByPredicate((ci: ContainerInfo) => ci.Id === containerId);
  } catch {
    throw new Error(`No container by ID"${containerId}"`);
  }
};

export const pullImage = async (
  imageFqn: string,
  options: Record<string, unknown> = {}
): Promise<unknown[]> => {
  const task = (): Promise<unknown[]> => tryPullImage(imageFqn, options);

  return retryOperation(task, { retries: 5, delay: 1000 });
};

const tryPullImage = (
  imageFqn: string,
  options: Record<string, unknown> = {}
): Promise<unknown[]> => {
  return new Promise((resolve, reject) => {
    const docker = new Dockerode();

    const pullStreamStartedHandler = (
      pullError: unknown,
      stream: NodeJS.ReadableStream
    ): void => {
      if (pullError) {
        console.log(`Could not even start ${imageFqn} pull:`, pullError);
        reject(pullError);
      } else {
        console.log(`Started ${imageFqn} pull progress stream OK`);
        docker.modem.followProgress(
          stream,
          (progressError: unknown, output: unknown[]) => {
            if (progressError) {
              console.log(`Failed to finish ${imageFqn} pull:`, progressError);
              reject(progressError);
            } else {
              console.log(`Finished ${imageFqn} pull completely OK`);
              resolve(output);
            }
          }
        );
      }
    };

    docker.pull(imageFqn, options, pullStreamStartedHandler);
  });
};

export const stop = async (container: Container): Promise<unknown> => {
  const fnTag = "Containers#stop()";
  return new Promise((resolve, reject) => {
    if (container) {
      container.stop({}, (err: unknown, result: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    } else {
      return reject(new Error(`${fnTag} Container was not running.`));
    }
  });
};

export const exec = async (
  container: Container,
  cmd: string[],
  timeoutMs = 300000, // 5 minutes default timeout
  workingDir?: string
): Promise<string> => {
  const fnTag = "Containers#exec()";

  const execOptions: Record<string, unknown> = {
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  };
  if (workingDir) {
    execOptions.WorkingDir = workingDir;
  }
  const exec = await container.exec(execOptions);

  return new Promise((resolve, reject) => {
    console.log(`Calling Exec Start on Docker Engine API...`);

    exec.start({ Tty: true }, (err: Error, stream: Duplex | undefined) => {
      const timeoutIntervalId = setInterval(() => {
        reject(new Error(`Docker Exec timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      if (err) {
        clearInterval(timeoutIntervalId);
        const errorMessage = `Docker Engine API Exec Start Failed:`;
        console.log(errorMessage, err);
        throw err;
      }
      if (!stream) {
        const msg = `${fnTag} container engine returned falsy stream object, cannot continue.`;
        throw new Error(msg);
      }
      console.log(`Obtained output stream of Exec Start OK`);
      let output = "";
      stream.on("data", (data: Buffer) => {
        output += data.toString("utf-8");
      });
      stream.on("end", () => {
        clearInterval(timeoutIntervalId);
        console.log(`Finished Docker Exec OK. Output: ${output.length} bytes`);
        resolve(output);
      });
    });
  });
};

export const streamLogs = async (req: {
  container: Container;
}): Promise<void> => {
  const logOptions: Dockerode.ContainerLogsOptions = {
    stderr: true,
    stdout: true,
    timestamps: true,
  };
  const logStream = await req.container.logs({ ...logOptions, follow: true });
  const newLineOnlyLogMessages = [`\r\n`, `+\r\n`, `.\r\n`];

  logStream.on("data", (data: Buffer) => {
    const msg = data.toString("utf-8");
    if (!newLineOnlyLogMessages.includes(msg)) {
      console.log("Container Stream:", msg);
    }
  });
};

export const waitForHealthCheck = async (
  containerId: string,
  timeoutMs = 180000
): Promise<void> => {
  const startedAt = Date.now();
  let reachable = false;
  do {
    try {
      const { Status } = await getById(containerId);
      reachable = Status.endsWith(" (healthy)");
    } catch (ex) {
      if (Date.now() >= startedAt + timeoutMs) {
        throw new Error(
          `Timed out (${timeoutMs}ms) waiting for container health check -> ${
            (ex as Error).stack
          }`
        );
      }
      reachable = false;
    }
    await new Promise((resolve2) => setTimeout(resolve2, 1000));
  } while (!reachable);
};

interface RetryOptions {
  retries: number;
  delay: number;
}

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const { retries, delay } = options;
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
