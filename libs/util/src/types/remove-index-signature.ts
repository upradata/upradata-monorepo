export type RemoveIndexSignature<T> = {
    [ K in keyof T as
    string extends K ? never :
    number extends K ? never :
    symbol extends K ? never :
    K
    ]: T[ K ];
};


/* type A = RemoveIndexSignature<{
    a: string;
    [ k: string ]: string;
}>;
// { a: string }

type B = RemoveIndexSignature<Record<string, string>>;
// {}
 */
