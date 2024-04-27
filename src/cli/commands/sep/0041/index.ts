import { Command } from "commander";
import { startSep41Tests } from "../../../../seps/SEP0041";
import configManager from "../../../../core/config";

const sep0041Command = new Command("41")
  .description("SEP 0041 - Standard Token Interface")
  .option("-p, --param <type>", "An example parameter for SEP 001")
  .action(async (options) => {
    console.log("Running SEP 0041 with parameter:", options.param);
    await startSep41Tests({
      network: configManager.getConfig().network,
      limits: configManager.getConfig().resourceLimit,
    });
  });

export default sep0041Command;
