import { describe, expect, it } from "vite-plus/test";

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Proxy, type ProxyType } from "../src";
import { makeTarget, type Target } from "./data";

const fail = (arg: string) => {
    throw new Error(arg);
};

describe("set trap", () => {
    it("set trap should be invoked for each prop", () => {
        const target = makeTarget();

        Proxy.create<Target>(target, {
            handler: {
                set: function (prop, value) {
                    switch (prop) {
                        case "root" as string:
                            expect(value).toEqual(target);
                            break;
                        case "a":
                            expect(value).toBe(1);
                            break;
                        case "b":
                            expect(value).toEqual({ b1: 2 });
                            break;
                        case "b1":
                            expect(value).toBe(2);
                            break;
                        case "c":
                            expect(value).toEqual({ c1: 3 });
                            break;
                        case "c1":
                            expect(value).toBe(3);
                            break;
                        // eslint-disable-next-line no-undef
                        default:
                            fail("property not valid");
                    }

                    (this as unknown as Record<PropertyKey, unknown>)[prop!] = value;
                },
            },
        });
    });

    it("set trap should be able to change the value set", () => {
        const target = makeTarget();
        let isCreation = true;

        const proxy = Proxy.create<Target>(target, {
            handler: {
                set: function (prop, value) {
                    const self = this as unknown as Record<PropertyKey, unknown>;

                    if (prop === "b" && isCreation) self[prop] = { b1: 10, b2: "10" };
                    // biome-ignore lint/style/noNonNullAssertion: <explanation>
                    else self[prop!] = value;

                    return true;
                },
            },
        });

        isCreation = false;

        expect(proxy.b.$$).toEqual({ b1: 10, b2: "10" });

        proxy.b = { b1: 1, b2: "1" };
        expect(proxy.b.$$).toEqual({ b1: 1, b2: "1" });

        proxy.b.b1 = 2;
        expect(proxy.b.$$).toEqual({ b1: 2, b2: "1" });
    });

    it("propChanged should be triggered", () => {
        const target = makeTarget();

        Proxy.create<Target>(target, {
            propChanged: function (prop, value) {
                const proxy = this as ProxyType<Target>;
                const root = Proxy.node(proxy);

                expect(root.prop).toBe("root");
                expect(root.target).toBe(target);

                switch (prop) {
                    case "a":
                        expect(value).toBe(1);
                        break;
                    case "b":
                        expect(value).toEqual({ b1: 2 });
                        break;
                    case "c":
                        expect(value).toEqual({ c1: 3 });
                        break;
                    // eslint-disable-next-line no-undef
                    default:
                        fail("property not valid");
                }
            },
        });
    });

    it("extra properties should be added", () => {
        const target = makeTarget({ c: { c1: { c2: 2 } } });
        const extra = {
            extra1: 11,
            extra2: { e1: 22, e3: { e4: 44 } },
        };

        const proxy = Proxy.create(target, { extra });

        expect(proxy.$$).toEqual(expect.objectContaining(target));
        expect(proxy.$$).toEqual(expect.objectContaining(extra));
        expect(proxy.a.$$).toEqual(expect.not.objectContaining(extra));
        expect(proxy.b.$$).toEqual(expect.objectContaining(extra));
        expect(proxy.c.$$).toEqual(expect.objectContaining(extra));
        expect(proxy.c.c1.$$).toEqual(expect.objectContaining(extra));
        expect(proxy.c.c1.c2.$$).toEqual(expect.not.objectContaining(extra));
        expect(proxy.extra1.$$).toEqual(expect.not.objectContaining(extra));
        expect(proxy.extra2.$$).toEqual(expect.not.objectContaining(extra));
        expect(proxy.extra1.$$).toBe(11);
        expect(proxy.extra2.e1.$$).toBe(22);
        expect(proxy.extra2.e3.e4.$$).toBe(44);
    });

    it("extra function should be called every time a new proxy object is created", () => {
        const target = makeTarget();

        let counter = 0;

        const extra = {
            counter: () => ++counter,
        };

        const proxy = Proxy.create(target, { extra });

        expect(proxy.counter.$$).toBe(3);
        expect(proxy.b.counter.$$).toBe(1);
        expect(proxy.c.counter.$$).toBe(2);
    });
});
