/** biome-ignore-all assist/source/organizeImports: <explanation> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import * as commonTags from 'common-tags';
import { keys, makeObject } from '../object';
import { CommonTagStyle } from './helpers/common-tags.type';
import { recreateString } from './recreate-string';
import { Style, type StyleOptions, type StyleTransform } from './style';

import type { Prop, ToString } from '../types';


export const buildStyle = (names: Array<string | number>, options: Record<Prop, StyleOptions>) => {

    for (const k of names) {

        Object.defineProperty(Style.prototype, k, {
            // tslint:disable-next-line:object-literal-shorthand
            get: function (this: Style) {
                // this will allow syntax red.bgYellow.underline.$ 
                const o = { ...options[ k ] };
                o.transforms = [ this, ...(o.transforms || []) ];

                return new Style(o);
            }
        });
    }
};



export type CommonTagsStringTranform = CommonTagStyle<StyleTransform>;
export type DefinedStringTransforms = CommonTagsStringTranform /* & OtherClasses if we went to add other transform builders */;


export type Styles<AllTransforms> = Style & {
    [ K in keyof AllTransforms ]: Styles<AllTransforms> & Style;
};


export const transformToStyleTemplate = (transform: (arg: any) => string) => {
    return (strings: TemplateStringsArray, ...keys: ToString[]) => transform(recreateString(strings, ...keys));
};


const commonTagsKeys = keys(new CommonTagStyle());
buildStyle(commonTagsKeys, makeObject(commonTagsKeys, k => ({ transforms: [ commonTags[ k ] ] })));
