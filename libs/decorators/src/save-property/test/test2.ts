import fixedWidthString from 'fixed-width-string';
import { type Property, SaveProp } from '../save-properties';

class Data {
    @SaveProp() data1: string = 'data1';
    @SaveProp({ optional: true }) data2?: string;
    @SaveProp() data3: string = 'data3';
}

class Test {
    @SaveProp() name: string = 'name';
    @SaveProp() unified: string = 'unified';
    @SaveProp() image: string = 'image';
    @SaveProp() sheet_x: number = 0;
    @SaveProp() sheet_y: number = 0;
    @SaveProp() short_names: Array<string> = [];
    @SaveProp({ optional: true }) texts?: Array<string>; // I will merge text and texts
    @SaveProp() category: string = 'category';

    @SaveProp() skin_variations: Array<Data> = [];
}

const logProp = (prop: Property) => {
    console.log(fixedWidthString(`name --> ${String(prop.name)}`, 50), `(optional:${prop.optional})`);
};

console.log('Data');
SaveProp.get(Data).forEach(logProp);

console.log('\n\nTest');
SaveProp.get(Test).forEach(logProp);
