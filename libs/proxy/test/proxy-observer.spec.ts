import { describe, expect, it } from "vite-plus/test";

import { ProxyObserver } from "../src";

describe("ProxyObserver features", () => {
    it("proxy.changed$ should emit the value passed in constructor after first subscribe", async () => {
        const proxy = ProxyObserver.create({ a: 1, b: 2 });

        await new Promise<void>((resolve) => {
            proxy.changed$?.subscribe(({ prop, value }) => {
                expect(prop).toBe("root");
                expect(value).toEqual({ a: 1, b: 2 });
                resolve();
            });
        });
    });

    it("proxy.changed$ should emit the values set before and after subscription", async () => {
        const proxy = ProxyObserver.create<{ a?: number; b?: number; c: number }>({ c: 3 });

        proxy.a = 1;

        let count = 0;

        await new Promise<void>((resolve) => {
            proxy.changed$?.subscribe(({ prop, value }) => {
                ++count;

                if (count === 1) {
                    expect(prop).toBe("root");
                    expect(value).toEqual({ a: 1, c: 3 });
                } else if (count === 2) {
                    expect(prop).toBe("root");
                    expect(value).toEqual({ a: 1, b: 2, c: 3 });
                    resolve();
                }
            });

            proxy.b = 2;
        });
    });

    it("proxy should not emit skipped values", async () => {
        const proxy = ProxyObserver.create<{ a: number | string; b: number; c?: number }>(
            { a: 1, b: 2 },
            { trap: { set: { extendable: false, mutableType: false } } },
        );

        let count = 0;

        await new Promise<void>((resolve, reject) => {
            proxy.changed$?.subscribe(({ prop, value }) => {
                ++count;

                if (count === 1) {
                    expect(prop).toBe("root");
                    expect(value).toEqual({ a: 1, b: 2 });
                } else if (count === 2) {
                    expect(prop).toBe("root");
                    expect(value).toEqual({ a: 1, b: 22 });
                } else {
                    reject(new Error("should skip different value type"));
                }
            });

            proxy.a = "pas bon";
            proxy.c = 1;
            proxy.$?.({ b: 22 });

            setTimeout(() => {
                if (count === 2) return resolve();

                reject(new Error("should be 2 emits"));
            }, 100);
        });
    });

    it("two-way $map should work", async () => {
        const proxyFrom = ProxyObserver.create({ a: 1 });

        const proxyTo = proxyFrom.a.$map?.({
            fromTo: (v: number) => `map => ${v}`,
            toFrom: (v: string) => parseInt(v.replace("map => ", ""), 10),
        });

        const count = { from: 1, to: 1 };

        await new Promise<void>((resolve, reject) => {
            proxyFrom.a.changed$?.subscribe(({ prop, value }) => {
                expect(prop).toBe("a");

                if (count.from === 1) expect(value).toBe(1);
                else if (count.from === 2) expect(value).toBe(2);
                else if (count.from === 3) expect(value).toBe(3);
                else reject(new Error("should not happen"));

                ++count.from;
            });

            proxyTo?.changed$?.subscribe(({ prop, value }) => {
                expect(prop).toBe("root");

                if (count.to === 1) expect(value).toBe("map => 1");
                else if (count.to === 2) expect(value).toBe("map => 2");
                else if (count.to === 3) expect(value).toBe("map => 3");
                else reject(new Error("should not happen"));

                ++count.to;
            });

            proxyFrom.a = 2;
            proxyTo?.$?.("map => 3");

            setTimeout(() => {
                if (count.from === 4 && count.to === 4) return resolve();

                reject(new Error("should be 3 from / 3 to emits"));
            }, 100);
        });
    });

    it("one-way $map should work", async () => {
        const proxyFrom = ProxyObserver.create({ a: 1 });

        const proxyTo = proxyFrom.a.$map?.({
            fromTo: (v: number) => `map => ${v}`,
        });

        const count = { from: 1, to: 1 };

        await new Promise<void>((resolve, reject) => {
            proxyFrom.a.changed$?.subscribe(({ prop, value }) => {
                expect(prop).toBe("a");

                if (count.from === 1) expect(value).toBe(1);
                else if (count.from === 2) expect(value).toBe(2);
                else reject(new Error("should not happen"));

                ++count.from;
            });

            proxyTo?.changed$?.subscribe(({ prop, value }) => {
                expect(prop).toBe("root");

                if (count.to === 1) expect(value).toBe("map => 1");
                else if (count.to === 2) expect(value).toBe("map => 2");
                else if (count.to === 3) expect(value).toBe("map => 3");
                else reject(new Error("should not happen"));

                ++count.to;
            });

            proxyFrom.a = 2;
            proxyTo?.$?.("map => 3");

            setTimeout(() => {
                if (count.from === 3 && count.to === 4) return resolve();

                reject(new Error("should be 2 from / 3 to emits"));
            }, 100);
        });
    });
});
