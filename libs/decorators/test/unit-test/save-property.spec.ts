import { describe, expect, it } from 'vite-plus/test';

import { SaveProp } from '../../src/save-property/save-properties';

describe('SaveProp decorator', () => {
    it('records decorated property names and optionality for a class', () => {
        class Model {
            name = 'model';
            description?: string;
        }
        SaveProp()(Model.prototype, 'name');
        SaveProp({ optional: true })(Model.prototype, 'description');

        expect(SaveProp.get(Model)).toEqual([
            { name: 'name', optional: false },
            { name: 'description', optional: true },
        ]);
    });
});
