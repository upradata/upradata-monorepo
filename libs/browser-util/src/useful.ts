import { guidGenerator } from '@upradata/util';

export const guid = () => guidGenerator({ crypto, useCryptoRandomUUIDIfAvailable: true });
