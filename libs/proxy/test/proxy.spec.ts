// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { describe, expect, it } from "vite-plus/test";

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { NodeLiteral, Proxy, ProxyObserver } from "../src";
import { makeTarget, type Target } from "./data";

describe.each([
    // excessive stack during TS compilation (don't know why)
    { Proxy: Proxy as any, name: "Proxy" },
    { Proxy: ProxyObserver, name: "ProxyObserver" },
])('Tests set/get for "$name"', () => {
    it("Proxy.target should have the same reference as the target", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target);

        expect(proxy.$$).toBe(target);
        expect(proxy.$$).toBe(Proxy.target(proxy));
        expect(Proxy.target(proxy)).toBe(target);
    });

    it("target and proxy should be synced up after mutation", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target);

        const { b } = proxy;

        proxy.c.c1 = 11;
        b.$?.({ b1: 20 });
        proxy.d = { d1: "d1" };

        const expected = makeTarget({ b: { b1: 20 }, c: { c1: 11 }, d: { d1: "d1" } });
        expect(proxy.$$).toEqual(expected);
    });

    it("Array should be considered as a literal", () => {
        const array = [1, 2, 3];
        const proxy = Proxy.create({ array });

        expect(proxy.array.$$).toEqual(array);
        expect(Proxy.node(proxy.array) instanceof NodeLiteral).toBe(true);
    });

    it("none extendable proxy should skip the creation of new property", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target, { trap: { set: { extendable: false } } });

        proxy.$?.({ d: "d" });
        proxy.e = "e";

        expect(proxy.$$).toEqual(target);
    });

    it("not mutable properties should be skipped if different type is set", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target);

        const { a } = target;
        proxy.a = "a" as any;

        expect(proxy.a.$$).toBe(a);
        expect(proxy.$$).toEqual(makeTarget());
    });

    it("not mutable properties should throw Error if different type is set", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target, { trap: { set: { emitError: true } } });

        expect(() => {
            proxy.a = "a" as any;
        }).toThrow();
        expect(() => {
            proxy.a = { a1: 1 } as any;
        }).toThrow();
        expect(() => {
            proxy.b = "b" as any;
        }).toThrow();
    });

    it("mutable type properties should work", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target, { trap: { set: { mutableType: true } } });

        proxy.a = "a" as any;
        expect(proxy.a.$$).toBe("a");

        proxy.a = { a1: 1 } as any;
        expect(proxy.a.$$).toEqual({ a1: 1 });

        proxy.b = "b" as any;
        expect(proxy.b.$$).toBe("b");
    });

    it("none extendable proxy should emit an error during the creation of new property", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target, {
            trap: { set: { extendable: false, emitError: true } },
        });

        expect(() => {
            proxy.$?.({ d: "d" });
        }).toThrow();
        expect(() => {
            proxy.e = "e";
        }).toThrow();
    });

    it("none extendable proxy should emit an error during the creation of new property", () => {
        const target = makeTarget();
        const proxy = Proxy.create(target, {
            trap: { set: { extendable: false, emitError: true } },
        });

        expect(() => {
            proxy.d = { d1: "new" };
        }).toThrow();
    });

    it("lazy initialization should work", () => {
        const proxy = Proxy.create<Target>();

        proxy.$?.({
            a: undefined,
            b: undefined,
        });

        proxy.a = 1;
        proxy.b.$?.({ b1: 1, b2: "b2" });
        proxy.d = { d1: "d1" };

        expect(proxy.$$).toEqual({ a: 1, b: { b1: 1, b2: "b2" }, d: { d1: "d1" } });
    });

    it("primitive should work", () => {
        const proxy = Proxy.create().$?.(2);
        expect(proxy?.$$).toEqual(2);
    });

    it('forcedType "literal" should work', () => {
        const proxy = Proxy.create();

        proxy.$?.({ d: "d" }, { trap: { set: { forcedType: "literal" } } });
        expect(Proxy.node(proxy) instanceof NodeLiteral).toBe(true);

        proxy.$?.({ b: { b1: "b1", b2: "b2" } }, { trap: { set: { forcedType: "literal" } } });
        expect(Proxy.node(proxy) instanceof NodeLiteral).toBe(true);
    });

    it("target with cycle references should work", () => {
        type Cycle = { a: number; b: { c: number; d: Cycle | undefined } };

        const cycleTarget: Cycle = { a: 1, b: { c: 2, d: undefined } };
        cycleTarget.b.d = cycleTarget;

        const proxy = Proxy.create(cycleTarget);

        expect(proxy.$$).toEqual(cycleTarget);
        expect(proxy.b.d).toBe(proxy);

        proxy.b.d.a = 7;
        expect(proxy.b.d.a.$$).toBe(7);
        expect(proxy.b.d.a.$$).toBe(proxy.a.$$);
    });
});
