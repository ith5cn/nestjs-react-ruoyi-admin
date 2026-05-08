import { SetMetadata } from '@nestjs/common';

export const BYPASS_ENCRYPTION_KEY = 'bypass_encryption';
export const BypassEncryption = () => SetMetadata(BYPASS_ENCRYPTION_KEY, true);
