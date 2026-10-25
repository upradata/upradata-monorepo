
export type AddEventListenerOpts = { id?: string | symbol; once?: boolean; passive?: boolean; event?: boolean | AddEventListenerOptions; };
export type RemoveListener = () => void;

type AddEventListener<R = void> = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => R;
type RemoveEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;

export type HtmlLikeListenable = { addEventListener: AddEventListener; removeEventListener: RemoveEventListener; };
export type OnListenable = { on: AddEventListener<EventListenerOrEventListenerObject>; off: RemoveEventListener; };

export type Listenable =
    | HtmlLikeListenable
    | OnListenable;


/* const isHtmlLikeListenable = (value: any): value is HtmlLikeListenable => {
    const v = value as HtmlLikeListenable;
    return !!v?.addEventListener && !!v?.removeEventListener;
}; */

const isOnListenable = (value: any): value is OnListenable => {
    const v = value as OnListenable;
    return !!v?.on && !!v?.off;
};

export const removableEventListeners = (debug: boolean = false) => {
    let _removeListeners: Map<string | symbol, RemoveListener[]> = new Map();

    const removeAllListeners = () => {
        [ ..._removeListeners.values() ].flat().forEach(remove => remove());
        _removeListeners = new Map();
    };

    const removeListenerById = (id: string | symbol) => {
        const removes = _removeListeners.get(id);

        if (removes) {
            removes.forEach(remove => remove());
            _removeListeners.delete(id);

            if (debug)
                console.log('remove listener ', id);
        }
    };

    function on<K extends keyof HTMLElementEventMap>(
        el: Listenable, type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[ K ]) => any, options?: AddEventListenerOpts
    ): RemoveListener;

    function on(el: Listenable, type: string, listener: (event: any) => void, options?: AddEventListenerOpts): RemoveListener;

    function on(el: Listenable, type: string, listener: (event: any) => void, options: AddEventListenerOpts = {}): RemoveListener {
        const id = options?.id || Symbol();

        let eventOptions = typeof options.event === 'boolean' ? { capture: options.event } : options.event;

        if (options.passive)
            eventOptions = { ...eventOptions, passive: options.passive };


        const handler = !options.once ? listener : event => {
            listener(event);
            removeListenerById(id);
        };

        const addListener = () => {
            if (isOnListenable(el))
                return el.on(type, handler, eventOptions); // createjs returns the wrapper listener created in "on"

            el.addEventListener(type, handler, eventOptions);
            return handler;
        };

        const realListener: EventListenerOrEventListenerObject = addListener();
        const removeListener = () => isOnListenable(el) ? el.off(type, realListener, eventOptions) : el.removeEventListener(type, realListener, eventOptions);

        const removes = _removeListeners.get(id) || [];
        removes.push(removeListener);

        _removeListeners.set(id, removes);

        if (debug)
            console.log('add listener ', type);

        return removeListener;
    }


    function once<K extends keyof HTMLElementEventMap>(
        el: Listenable, type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[ K ]) => any, options?: AddEventListenerOpts
    ): RemoveListener;

    function once(el: Listenable, type: string, listener: (event: any) => void, options?: AddEventListenerOpts): RemoveListener;

    function once(el: Listenable, type: string, listener: (event: any) => void, options: AddEventListenerOpts = {}): RemoveListener {
        return on(el, type, listener, { ...options, once: true });
    }

    return { removeAllListeners, removeListenerById, on, once };
};
