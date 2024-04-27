import {
  NetworkOptions,
  ResourceLimitOptions,
} from "../test-environment/types";

export interface IGlobalAuditParams {
  network: NetworkOptions;
  limits?: ResourceLimitOptions;
}
