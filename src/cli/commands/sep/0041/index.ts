import { Command } from "commander";
import { startSep41Tests } from "../../../../seps/SEP0041";

const sep0041Command = new Command("41")
  .description("SEP 0041 - Standard Token Interface")
  .option(
    "-w, --wasm <wasm>",
    "Path to the WebAssembly file or a WASM hash for SEP 0041"
  )
  .action(async (options) => {
    if (!options.wasm) {
      console.error(
        "Error: A WASM file path or hash is required to run this command."
      );
      process.exit(1); // Exit the process with an error code
    }

    let wasmInput = options.wasm;

    let testArguments = {};
    // Further input determination logic here
    if (wasmInput.includes("/") || wasmInput.includes("\\")) {
      console.log("Assuming WASM input is a file path:", wasmInput);
      testArguments = { wasmFilePath: wasmInput };
    } else {
      console.log("Assuming WASM input is a hash:", wasmInput);
      testArguments = { wasmHash: wasmInput };
    }

    // Assuming startSep41Tests is designed to accept an object with specific properties
    await startSep41Tests(testArguments);
  });

export default sep0041Command;
