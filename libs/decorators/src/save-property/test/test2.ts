import { SaveProp } from '../save-properties';
import fixedWidthString from 'fixed-width-string';

class Data {
    @SaveProp() data1: string;
    @SaveProp({ optional: true }) data2?: string;
    @SaveProp() data3: string;
}


class Test {
    @SaveProp() name: string;
    @SaveProp() unified: string;
    @SaveProp() image: string;
    @SaveProp() sheet_x: number;
    @SaveProp() sheet_y: number;
    @SaveProp() short_names: Array<string>;
    @SaveProp({ optional: true }) texts?: Array<string>; // I will merge text and texts
    @SaveProp() category: string;

    @SaveProp() skin_variations: Array<Data>;
}

const logProp = prop => {
    console.log(fixedWidthString(`name --> ${prop.name}`, 50), `(optional:${prop.optional})`);
};


console.log('Data');
SaveProp.get(Data).forEach(logProp);


console.log('\n\nTest');
SaveProp.get(Test).forEach(logProp);
