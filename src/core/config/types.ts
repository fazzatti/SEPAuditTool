import {
  NetworkOptions,
  ResourceLimitOptions,
} from "../test-environment/types";

export type CliConfiguration = {
  network: NetworkOptions;
  resourceLimit?: ResourceLimitOptions;
};
