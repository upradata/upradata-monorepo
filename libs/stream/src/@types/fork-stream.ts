declare module 'fork-stream' {
    export type ForkStreamOptions = any & {
        classifier: (data: any, done: (err: Error, isTrue: boolean) => any) => void;
    };

    export default class ForkStream {
        public a: NodeJS.ReadableStream;
        public b: NodeJS.ReadableStream;

        constructor(options: ForkStreamOptions);
    }
}
