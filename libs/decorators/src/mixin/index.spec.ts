import { Mixin, Mixin1, Mixin2, type Mix } from './mixin';


@Mixin({ mix: [ { b: 2 }, class C { get c() { return 'c'; } } ] })
export class A {
    a: string = 'a';
}


@Mixin1({ mix: [ class C { get c() { return 'c'; } } ] })
export class A21 {
    a: string = 'a21';
    a21: string = 'A21';
}


@Mixin2({
    mix: [ { b: 2 }, class C {
        get e() { return 'e'; }
        d() { console.log('heho'); return 'd'; }
    } ]
})
export class A22 {
    a: string = 'a22';
}



@Mixin2({ mix: [ A21, A22 ] })
export class A23 {
    a: string = 'a23';
}


@Mixin2({ mix: [ A21, A22 ], override: 'merge' })
export class A24 {
    a: string = 'a2';
    b: number = 22;
    get c() { return 'c2'; }
    d() { return 'd2'; }
}

@Mixin2({ mix: [ A21, A22 ], override: 'none' })
export class A25 {
    a: string = 'a2';
    b: number = 22;
    get c() { return 'c2'; }
    d() { return 'd2'; }
}

const a = new A23() as Mix<A23, { b: number; e: string; }, { c: string; d(): string; }>;
console.log(a.a);
console.log(a.b);
console.log(a.c);
console.log(a.e);
console.log(a.d());

console.log('\n', 'A24', '\n');

const a2 = new A24() as typeof a;
console.log(a2.a);
console.log(a2.b);
console.log(a2.c);
console.log(a2.e);
console.log(a2.d());

console.log('\n', 'A25', '\n');

const a3 = new A25() as typeof a;
console.log(a3.a);
console.log(a3.b);
console.log(a3.c);
console.log(a3.e);
console.log(a3.d());


export class A26 {
    @Mixin2({ mix: [ A21, A22 ], override: 'merge' }) __;

    constructor() {
        1 === 1;
    }

    a: string = 'a26';
    b: number = 26;
    get c() { return 'c2'; }
    d() { return 'd2'; }
}

console.log('\n', 'A26', '\n');

const a4 = new A26() as any as typeof a;
console.log(a4.a);
console.log(a4.b);
console.log(a4.c);
console.log(a4.e);
console.log(a4.d());
console.log('a4', a4);

1 === 1;
