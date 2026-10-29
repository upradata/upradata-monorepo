import { describe, expect, it } from 'vite-plus/test';

import * as decorators from '../../src';
import { InheritBuiltin } from '../../src/inherit-builtin';
import { Mixin } from '../../src/mixin';
import { Required, Validate } from '../../src/require';

describe('decorators public API', () => {
    it('loads all public decorator modules', () => {
        expect(decorators).toHaveProperty('InheritBuiltin', InheritBuiltin);
        expect(decorators).toHaveProperty('Mixin', Mixin);
        expect(decorators).toHaveProperty('Required', Required);
        expect(decorators).toHaveProperty('Validate', Validate);
        expect(decorators).toHaveProperty('SaveProp');
        expect(decorators).toHaveProperty('MultiQuery');
    });

    it('mixes methods into a decorated class', () => {
        class Feature {
            greet() {
                return 'hello';
            }
        }

        class Host {}
        Mixin({ mix: [Feature] })(Host);

        expect((new Host() as Host & Feature).greet()).toBe('hello');
    });

    it('preserves built-in Array behavior after decorating a subclass', () => {
        class NumberList extends Array<number> {}
        const DecoratedNumberList = InheritBuiltin()(NumberList) as typeof NumberList;
        const values = new DecoratedNumberList();
        values.push(1, 2);
        expect(values).toBeInstanceOf(NumberList);
        expect([...values].slice(1)).toEqual([1, 2]);
    });

    it('exposes required and validation decorators', () => {
        expect(Required).toBeTypeOf('function');
        expect(Validate).toBeTypeOf('function');
    });
});
