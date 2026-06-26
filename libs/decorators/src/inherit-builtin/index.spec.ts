import { InheritBuiltin } from './index';

@InheritBuiltin()
class MyArray extends Array<number>
{
    put(val: number) {
        this.push(val);
    }
}
