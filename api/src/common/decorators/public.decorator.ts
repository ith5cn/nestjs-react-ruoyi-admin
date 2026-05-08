import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = '__public_key__';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

