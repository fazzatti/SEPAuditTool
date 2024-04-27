import { Command } from "commander";
import sep0041Command from "./0041";

const handleSepCommand = (number: string) => {
  console.log(`Audit tests for SEP ${number}`);
  // Here you would insert logic specific to handling SEP audits
};

const sepCommand = new Command("sep")
  .description("run audit tests for the given SEP")
  .argument("<number>", "SEP number to run tests against")
  .action(handleSepCommand);

sepCommand.addCommand(sep0041Command);

export default sepCommand;
