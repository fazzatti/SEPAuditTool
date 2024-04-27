import fs from "fs";
import path from "path";
import { CliConfiguration } from "./types";
import { NetworkOptions } from "../test-environment/types";

class ConfigManager {
  private static instance: ConfigManager;
  private customConfigPath: string;
  private config: CliConfiguration;

  constructor() {
    this.customConfigPath = path.join(__dirname, "../../.config/custom.json");
    this.config = this.loadConfig();

    const configDir = path.dirname(this.customConfigPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private getDefaultConfiguration(): CliConfiguration {
    return {
      network: NetworkOptions.Testnet,
    };
  }

  private loadConfigFile(filePath: string, defaultValue: object): object {
    try {
      const fileData = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileData);
    } catch (error) {
      return defaultValue; // Return default value if there's an issue
    }
  }

  private loadConfig(): CliConfiguration {
    let defaultConfig = this.getDefaultConfiguration();
    let customConfig = this.loadConfigFile(this.customConfigPath, {});
    return { ...defaultConfig, ...customConfig }; // Merge default and custom configs
  }

  public getConfig(): CliConfiguration {
    return this.config;
  }

  public setConfig(newConfig: Partial<CliConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      const configJson = JSON.stringify(this.config, null, 4); // Beautify the JSON output
      fs.writeFileSync(this.customConfigPath, configJson);
      console.log("Configuration saved successfully.");
    } catch (error) {
      console.error(`Failed to save configuration: ${error}`);
    }
  }

  public resetConfig(): void {
    try {
      fs.unlinkSync(this.customConfigPath);
      console.log("Configuration reset to default settings.");
    } catch (error) {
      console.error(`Failed to reset configuration: ${error}`);
    }
  }
}

export default ConfigManager.getInstance(); // Export a singleton instance
