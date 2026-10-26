import { SetMetadata } from '@nestjs/common';

export const THROTTLE_RULE_METADATA = 'custom-throttle-rule';

export interface ThrottleRule {
  limit: number;
  ttl: number;
}

export function Throttle(options: { default: ThrottleRule }) {
  return SetMetadata(THROTTLE_RULE_METADATA, options.default);
}