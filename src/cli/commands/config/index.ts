import { Command } from "commander";
import configManager from "../../../core/config/index";
import {
  NetworkOptions,
  ResourceLimitOptions,
} from "../../../core/test-environment/types";

const handleSetNetwork = (network: string) => {
  if (!Object.values(NetworkOptions).includes(network as NetworkOptions)) {
    console.error(
      `Invalid network type. Valid options are: ${Object.values(
        NetworkOptions
      ).join(", ")}`
    );
    process.exit(1);
  }
  configManager.setConfig({ network: network as NetworkOptions });
  console.log(`Network set to ${network}`);
};

const handleSetResourceLimit = (limit: string) => {
  if (
    !Object.values(ResourceLimitOptions).includes(limit as ResourceLimitOptions)
  ) {
    console.error(
      `Invalid resource limit. Valid options are: ${Object.values(
        ResourceLimitOptions
      ).join(", ")}`
    );
    process.exit(1);
  }
  configManager.setConfig({ resourceLimit: limit as ResourceLimitOptions });
  console.log(`Resource limit set to ${limit}`);
};

const handleListConfig = () => {
  const currentConfig = configManager.getConfig();
  const formattedConfig = JSON.stringify(currentConfig, null, 2); // Indent with 2 spaces
  console.log(formattedConfig);
};

const handleResetConfig = () => {
  configManager.resetConfig();
};

const configCommand = new Command("config").description(
  "Configure the SEP audit tool settings"
);

configCommand
  .command("set-network <network>")
  .description("Set the network configuration for SEP tests")
  .action((network) => handleSetNetwork(network));

configCommand
  .command("set-resource-limit <limit>")
  .description("Set the resource limit configuration for SEP tests")
  .action((limit) => handleSetResourceLimit(limit));

configCommand
  .command("list")
  .description("List the current SEP audit tool configuration")
  .action(() => handleListConfig());

configCommand
  .command("reset")
  .description("Reset the SEP audit tool configuration to default settings")
  .action(() => handleResetConfig());

export default configCommand;
