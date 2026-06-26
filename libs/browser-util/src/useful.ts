import { guidGenerator } from '@upradata/util';

export const guid = guidGenerator(crypto.getRandomValues.bind(crypto));
