export type BooleanAttribute = boolean | 'true' | 'false' | '';

export const toBoolean = (v: BooleanAttribute) => {
    return v === '' ? true :
        typeof v === 'boolean' ? v :
            v === 'true' ? true :
                v === 'false' ? false :
                    false;
};

export const toString = (v: any) => {
    return `${v}`;
};

export const toNumber = (v: number | string) => {
    return typeof v === 'number' ? v : parseFloat(v);
};

export const toObject = <T = unknown>(o: string | T): T => {
    return o ? typeof o === 'string' ? JSON.parse(o) : o : o;
};



export const zoomFromMouseWheel = (event: WheelEvent) => {
    return event.deltaY > 0 ? 1 / 1.1 : 1.1;
};


export const toggleClassFactory = (classes: { true: string; false: string; }) => (el: HTMLElement, isTrue: boolean) => {
    if (isTrue) {
        el.classList.remove(classes[ 'false' ]);
        el.classList.add(classes[ 'true' ]);
    } else {
        el.classList.remove(classes[ 'true' ]);
        el.classList.add(classes[ 'false' ]);
    }
};
