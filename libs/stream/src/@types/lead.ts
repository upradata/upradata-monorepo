declare module 'lead' {
    export default function sink<S extends NodeJS.ReadableStream>(readableStream: S): S;
}
