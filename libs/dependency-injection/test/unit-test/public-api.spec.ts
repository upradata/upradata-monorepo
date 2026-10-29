import { describe, expect, it } from 'vite-plus/test';

import * as di from '../../src';
import { isClassProvider, isFactoryProvider, isValueProvider } from '../../src/provider';
import { isClassToken } from '../../src/token';

describe('dependency-injection public API', () => {
    it('exports its injector, provider, token, and decorator modules', () => {
        expect(di).toHaveProperty('Injector');
        expect(di).toHaveProperty('DiInjector');
        expect(di).toHaveProperty('AppInjector');
        expect(di).toHaveProperty('Inject');
        expect(di).toHaveProperty('isValueProvider', isValueProvider);
        expect(di).toHaveProperty('isFactoryProvider', isFactoryProvider);
        expect(di).toHaveProperty('isClassProvider', isClassProvider);
        expect(di).toHaveProperty('isClassToken', isClassToken);
    });

    it('identifies provider kinds and class tokens', () => {
        class ValueToken {}
        class FactoryToken {}
        class ServiceToken {}
        class Service {}

        expect(isValueProvider({ provide: ValueToken, useValue: 1 })).toBe(true);
        expect(isFactoryProvider({ provide: FactoryToken, useFactory: () => 1 })).toBe(true);
        expect(isClassProvider({ provide: ServiceToken, useClass: Service })).toBe(true);
        expect(isClassToken(class Service {})).toBe(true);
    });
});
