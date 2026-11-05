import { describe, expect, it } from 'vite-plus/test';

import { ExecuteOnTempState, temp } from '../../src/execute-temporary-state';
import { PlainObj } from '../../src/types';

describe('Test Suite ExecuteOnTempState', () => {
    const o = { a: 1, b: 2, c: 3 };
    const copyoRef = o;
    const copyoValue = { ...o };

    const tmpState = { b: 22, c: 33 };

    async function testExecTmp(execType: 'sync' | 'promise') {
        const retValue = 'test';

        const ret = new ExecuteOnTempState({ obj: o, tmpState }).execute(function (this: PlainObj, tmp) {
            // check tmp values have been copied;
            expect(o).toEqual(tmp);
            expect(o.b).toEqual(tmpState.b);
            expect(o.c).toEqual(tmpState.c);

            // we pass tmp object as this
            expect(this).toBe(tmp);

            switch (execType) {
                case 'sync':
                    return retValue;
                case 'promise':
                    return Promise.resolve(retValue);
            }
        });

        switch (execType) {
            case 'sync':
                expect(ret).toEqual('test');
                break;
            case 'promise':
                expect(await ret).toEqual('test');
                break;
        }

        // check o did not change. Reference and Values.
        expect(o).toBe(copyoRef);
        expect(o).toEqual(copyoValue);
    }

    it('Test state.execute Sync', () => {
        return testExecTmp('sync');
    });

    it('Test state.execute Promise', () => {
        return testExecTmp('promise');
    });

    it('Test constructor/state/from-to', () => {
        const e1 = new ExecuteOnTempState({ obj: o, tmpState }) as any as { obj: PlainObj; tmpState: PlainObj };
        const e2 = new ExecuteOnTempState().state({ obj: o, tmpState });
        const e3 = new ExecuteOnTempState().from(o).to(tmpState);
        const e4 = temp(o).to(tmpState);

        for (const { obj, tmpState } of [e2, e3, e4] as any[]) {
            expect(obj).toEqual(e1.obj);
            expect(tmpState).toEqual(e1.tmpState);
        }
    });
});
