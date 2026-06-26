import { Required, RequiredIf, Validate, ValidateProperties } from '../required';


@ValidateProperties
@Validate
class Greeter {
    greeting: string;
    @RequiredIf(function () { return this.p2 === undefined; }) p1: string;
    @RequiredIf(function () { return this.p1 === undefined; }) p2: boolean;
    @RequiredIf(function () { return this.p1 === 'caca' && this.p2 === true; }) p3: number;


    constructor(dummy: number, @Required message?: string, p2?: boolean) {
        this.greeting = message;
        this.p2 = p2;
        /* this.p2 = true;
        this.p1 = 'caca';
        this.p3 = 2; */
        // this.p1 = 'cc';
    }

    @Validate
    greet(dummy: number, @Required name?: string) {
        return 'Hello ' + name + ', ' + this.greeting;
    }
}

let g: Greeter;
try {
    g = new Greeter(1, 'caca');
} catch (e) {
    console.log(e.message);
}


g = new Greeter(1, 'caca', true);
console.log(g.greet(1, 'thomas'));

try {
    console.log(g.greet(1));
} catch (e) {
    console.log(e.message);
}

try {
    const g2 = new Greeter(1);
} catch (e) {
    console.log(e.message);
}
