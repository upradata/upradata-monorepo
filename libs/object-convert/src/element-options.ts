import { Key, LevelDetails, RecursiveValue } from './types';
import { Options, BaseOptions, BaseOpts, DetailsOpts, Node, Parent } from './options';
import { Concatenator } from './concatenator';

// type VisitorProps = ExtractKeysType<ConvertOptionsBase, Transformer | RecursiveTransformer>;


export abstract class ElementOptions<T = unknown /* , U = T */> {
    readonly base: BaseOptions; // <T, U>;
    readonly details: DetailsOpts; // <T, U>;
    readonly concatenator: Concatenator;

    constructor(options: Options/* <T, U> */) {
        this.base = new BaseOptions(options);
        this.details = options;

        const { parent } = options;
        const Concatenator = this.base.concatenatorCtor.value(parent.key, parent.value, parent.levelDetails);

        this.concatenator = new Concatenator();
    }


    public getOptions(key: Key, value: T, details: LevelDetails): BaseOptions/* <T, U> */ {
        const { options: opts } = this.base;

        const options = {
            ...this.base,
            ...this.getDetailedOptions(key, value),
            ...opts?.value(key, value, details)
        };

        return new BaseOptions/* <T, U> */(options);
    }


    public getNextOptions/* <U> */(parentNode: Node/* <U> */, overrideOptions?: RecursiveValue<BaseOpts>): BaseOpts & Parent {
        const opts = {} as BaseOpts;

        for (const [ key, value ] of Object.entries({ ...this.base, next: overrideOptions })) {

            if (value?.recursive) {
                opts[ key ] = value;
            }
        }

        return { ...opts, ...overrideOptions.value, ...this.base.next.value, parent: parentNode };
    }


    protected abstract getDetailedOptions(_key: Key, _json: unknown): BaseOpts/* <T, U> */;
}
