/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { styles as s } from '../init';

const byName = (name: keyof typeof s) => ((...args: any[]) => (s[ name ] as any).$(...args));

export const html = byName('html');
export const codeBlock = byName('codeBlock');
export const source = byName('source');
export const safeHtml = byName('safeHtml');
export const oneLine = byName('oneLine');
export const oneLineTrim = byName('oneLineTrim');
export const stripIndent = byName('stripIndent');
export const stripIndents = byName('stripIndents');
export const inlineLists = byName('inlineLists');
export const oneLineInlineLists = byName('oneLineInlineLists');
export const commaLists = byName('commaLists');
export const commaListsOr = byName('commaListsOr');
export const commaListsAnd = byName('commaListsAnd');
export const oneLineCommaLists = byName('oneLineCommaLists');
export const oneLineCommaListsOr = byName('oneLineCommaListsOr');
export const oneLineCommaListsAnd = byName('oneLineCommaListsAnd');
