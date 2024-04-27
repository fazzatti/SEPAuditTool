import { Command } from "commander";
import sepCommand from "./commands/sep";
import configCommand from "./commands/configure";

const cli = new Command();

cli
  .name("SEP Audit Tool")
  .description(
    "A command-line utility designed to ensure that smart contracts on the Stellar network comply with Stellar Ecosystem Proposals (SEPs)"
  )
  .version("0.0.1");

cli.addCommand(configCommand);
cli.addCommand(sepCommand);

export const runCli = () => {
  cli.parse(process.argv);
};
