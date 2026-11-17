import { Observable, OperatorFunction } from 'rxjs';

// Inspiried by node_modules/rxjs/src/internal/operators/buffer.ts

export abstract class Cumulator<T> {
    abstract clear(): void;
    abstract add(value: T): void;
    toArray?(): T[];
}

export type CumulatorCtor<T> = new () => Cumulator<T>;

export class CumulateOptions<T> {
    filter: (value: T) => boolean = _value => true;
    toArray: boolean = true;
}

export type CumulateOpts<T> = Partial<CumulateOptions<T>>;

/**
 * Cumulates the source Observable values until `closingNotifier` emits.
 *
 * <span class="informal">Collects values from the past in a Cumulator, and emits this cumulator or copies it as an
 * "array" only when another Observable emits.</span>
 *
 * ![](cumulate.png)
 *
 * Cumulates the incoming Observable values until the given `closingNotifier` Observable emits a value, at which point
 * it emits the cumulator/array on the output Observable and restart the cumulator internally (calling
 * cumulator.clean()), awaiting the next time `closingNotifier` emits.
 *
 * ## Example
 *
 * On every click, emit array of most recent interval events
 *
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { buffer } from 'rxjs/operators';
 *
 * export const cumulateUnique = <T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, options?: O) => {
 *   return cumulate(closingNotifier, Set, options);
 * };
 *
 * const clicks = fromEvent(document, 'click');
 * const intervalEvents = interval(1000);
 * const cumulateSet = intervalEvents.pipe(tap(t => t % 4), cumulateUnique(clicks, { toArray: true }));
 * cumulateSet.subscribe(x => console.log(x)); => [0, 1, 2, 3] (if we wait at least 4s, otherwise [0, 1] for 2s for instance)
 * ```
 *
 * // @see {@link cumulateUnique} // @see {@link lastValue} // @see {@link bufferToggle}
 *
 * @param {Observable<any>} closingNotifier An Observable that signals the buffer to be emitted on the output
 *   Observable.
 * @param {CumulatorCtor<T> | Cumulator<T>} cumulator A cumulator instance or Constructor
 * @param {CumulateOpts<T>} options Cumulate options
 * @returns A function that returns an Observable of buffers, which are arrays
 * of values.
 */

type CumulatorType<T> = CumulatorCtor<T> | Cumulator<T>;
type CumulatorInstance<C extends CumulatorType<any>> = C extends CumulatorCtor<any> ? InstanceType<C> : C;

export type Return<T, C extends CumulatorType<T>, O extends CumulateOpts<T>> = [O] extends [never]
    ? CumulatorInstance<C>
    : O['toArray'] extends true
      ? T[]
      : CumulatorInstance<C>;

export type CumulateReturn<T, C extends CumulatorType<T>, O extends CumulateOpts<any>> = OperatorFunction<
    T,
    Return<T, C, O>
>;

/*
source.pipe(
    cumulate(sourceFromAMouseClickForInstance),
    filter(v => v.length > 0),
).subscribe(res => console.log(res);
*/

// T is the the type from the source Observable we pipe
// T = source type, for instance { a: number }
// OperatorFunction<T, R> ==> is the return of the pipe
// if the cumulator C is Set<{ a:number; someValue: string; }>
// so R = Set<{ a:number; someValue: string; }> as cumulate returns OperatorFunction<{ a: number }, Set<{ a:number; someValue: string; }>>
export const cumulate = <T, C extends CumulatorType<T>, O extends CumulateOpts<T>>(
    closingNotifier: Observable<any>,
    cumulator: C,
    options?: O,
): CumulateReturn<T, C, O> => {
    const newCumulator = () => {
        if (cumulator instanceof Cumulator) {
            cumulator.clear();
            return cumulator;
        }

        return new (cumulator as CumulatorCtor<T>)();
    };

    const getResult = (buffer: Cumulator<T>) => {
        if (options?.toArray) {
            if (buffer[Symbol.iterator]) return [...buffer[Symbol.iterator]()];

            return buffer.toArray();
        }

        return buffer;
    };

    let kumulator = newCumulator();

    return ((source: Observable<T>) =>
        new Observable(subscriber => {
            const sourceSubscription = source.subscribe({
                next: value => kumulator.add(value),
                error: error => subscriber.error(error),
                complete: () => {
                    subscriber.next(getResult(kumulator) as any);
                    subscriber.complete();
                },
            });

            const notifierSubscription = closingNotifier.subscribe({
                next: () => {
                    subscriber.next(getResult(kumulator) as any);
                    kumulator.clear();
                },
                error: error => subscriber.error(error),
            });

            return () => {
                sourceSubscription.unsubscribe();
                notifierSubscription.unsubscribe();
                kumulator = null;
            };
        })) as CumulateReturn<T, C, O>;
};
