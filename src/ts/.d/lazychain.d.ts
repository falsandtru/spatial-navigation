/**
 *
 * lazychain.d.ts
 *
 * @author falsandtru https://github.com/falsandtru/lazychain
 */

declare module 'lazychain' {
    export = LazyChain
}

declare var LazyChain: {
    (extend: boolean): void
    <T>(): LazyChain<T>
    <T>(extend: Function): LazyChain<T>
    <T>(data: T[], extend?: any, offset?: number): LazyChain<T>
    <T>(stream: LazyChain<T>, extend?: any, offset?: number): LazyChain<T>
    <T>(...streams: LazyChain.Thenable<T>[]): LazyChain<T>
    id: LazyChain.Id
    uuid(): string
    args2array(args: IArguments): any[]
    args2array<T>(args: IArguments): T[]
    type(target: any): string
    type<T>(target: IArguments|T[], pattern: Array<T|Function>, cut?: number, depth?: number): boolean
    memoize<T>(func: () => T): () => T
    cache<F extends Function>(func: F, size?: number): F
    store<T, U>(size?: number): { (key: T, value?: U): U }
    resolve<T>(...values: T[]): LazyChain.Thenable<T>
    reject<T>(...values: T[]): LazyChain.Thenable<T>
    when<T>(promises: LazyChain.Thenable<T>[]): LazyChain.WhenThen<T>
    deferred<T>(callback?: (resolve: (...values: T[]) => any, reject?: (...values: T[]) => any, notify?: (...values: T[]) => any) => any): LazyChain.Deferred<T>
}

interface LazyChain<T> extends LazyChain.Stream<T> {
}

interface LazyMonad<T, M> extends LazyChain.MonadStream<T, M> {
}

interface Window {
    LazyChain: typeof LazyChain
}

interface Array<T> extends LazyChain.StreamMethod<T> {
}

declare module LazyChain {

    interface Id {
        rest(): {}
    }
    
    interface Env {
        constructor?: (...args: any[]) => void
        prototype?: void|boolean
    }
    
    interface Callback<T, U, V> {
        (value?: T, index?: number, array?: T[], env?: V): U
    }
    
    interface CallbackAsync<T, U, V> {
        (value?: T, index?: number, array?: T[], env?: V, deferred?: Deferred<U>): any
    }
    
    interface StreamMethod<T> {
        // lazy
        //  - basic
        lazy(onmessage: CallbackAsync<T, T, {}>, sequential?: boolean): LazyChain<T>
        lazy<V>(onmessage: CallbackAsync<T, T, V>, env: V, sequential?: boolean): LazyChain<T>
        lazy<U>(onmessage: CallbackAsync<T, U, {}>, sequential?: boolean): LazyChain<U>
        lazy<U, V>(onmessage: CallbackAsync<T, U, V>, env: V, sequential?: boolean): LazyChain<U>
        //  - immediate
        lazy(): LazyChain<T>
        //  - buffer
        lazy(buffer: number): LazyChain<T>
        // stream
        //  - basic
        stream(onmessage: Callback<T, any, {}>): LazyChain<T>
        stream<V>(onmessage: Callback<T, any, V>, env?: V): LazyChain<T>
        //  - branch: boolean
        stream(through: boolean, streams: Deferred<T>[]): LazyChain<T>
        //  - split: pattern
        stream(pattern: any[], err: Deferred<T>): LazyChain<T>
        //  - split: () => boolean
        stream<V>(splitter: Callback<T, boolean, V>, err: Deferred<T>, env: V): LazyChain<T>
        //  - split: () => number
        stream<V>(splitter: Callback<T, number, V>, streams: Deferred<T>[], env: V): LazyChain<T>
        //  - split: () => string
        stream<V>(splitter: Callback<T, string, V>, streams: {}[], env: V): LazyChain<T>
        //  - merge: deferred[]
        stream(streams: Promise<T>[]): LazyChain<T>
        //  - compose
        stream(...streams: LazyChain<T>[]): LazyChain<T>
        stream<U>(stream: LazyChain<T>): LazyChain<U>
        //  - cascade
        stream(): LazyChain<T>
    }

    interface ArrayLikeStream<T> {
        // copy
        reverse(): LazyChain<T>
        sort(compareFn?: (a: T, b: T) => number): LazyChain<T>
        map<U>(callbackfn: (value?: T, index?: number, array?: T[]) => U, thisArg?: any): LazyChain<U>
        filter(callbackfn: (value?: T, index?: number, array?: T[]) => boolean, thisArg?: any): LazyChain<T>
        // override
        every(callbackfn: (value?: T, index?: number, array?: T[]) => boolean, thisArg?: any): LazyChain<T>
        some(callbackfn: (value?: T, index?: number, array?: T[]) => boolean, thisArg?: any): LazyChain<T>
        forEach(callbackfn: (value?: T, index?: number, array?: T[]) => void, thisArg?: any): LazyChain<T>
        reduce(callbackfn: (previousValue?: T, currentValue?: T, currentIndex?: number, array?: T[]) => T, initialValue?: T): LazyChain<T>
        reduce<U>(callbackfn: (previousValue?: U, currentValue?: T, currentIndex?: number, array?: T[]) => U, initialValue?: U): LazyChain<U>
        reduceRight(callbackfn: (previousValue?: T, currentValue?: T, currentIndex?: number, array?: T[]) => T, initialValue?: T): LazyChain<T>
        reduceRight<U>(callbackfn: (previousValue?: U, currentValue?: T, currentIndex?: number, array?: T[]) => U, initialValue?: U): LazyChain<U>
    }
    
    interface ArrayLikeMonad<T, M> {
        // copy
        reverse(): LazyMonad<T, M>
        sort(compareFn?: (a: M, b: M) => number): LazyMonad<T, M>
        map(callbackfn: (value?: M, index?: number, array?: M[]) => T, thisArg?: any): LazyChain<T>
        map(callbackfn: (value?: M, index?: number, array?: M[]) => M, thisArg?: any): LazyMonad<T, M>
        filter(callbackfn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: any): LazyMonad<T, M>
        // override
        every(callbackfn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: any): LazyMonad<T, M>
        some(callbackfn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: any): LazyMonad<T, M>
        forEach(callbackfn: (value?: M, index?: number, array?: M[]) => void, thisArg?: any): LazyMonad<T, M>
        reduce(callbackfn: (previousValue?: M, currentValue?: M, currentIndex?: number, array?: M[]) => T, initialValue?: M): LazyChain<T>
        reduce(callbackfn: (previousValue?: M, currentValue?: M, currentIndex?: number, array?: M[]) => M, initialValue?: M): LazyMonad<T, M>
        reduceRight(callbackfn: (previousValue?: M, currentValue?: M, currentIndex?: number, array?: M[]) => T, initialValue?: M): LazyChain<T>
        reduceRight(callbackfn: (previousValue?: M, currentValue?: M, currentIndex?: number, array?: M[]) => M, initialValue?: M): LazyMonad<T, M>
    }
    
    interface Stream<T> extends StreamMethod<T>, Deferred<T>, ArrayLikeStream<T> {
        // pattern
        pattern(...patterns: Array<[T|Function]|[T|Function, (...args: T[]) => T]|[T|Function, (...args: T[]) => boolean, (...args: T[]) => T]>): LazyChain<T>
        // monad
        monad<M>(monad: Monad<T, M>, convert?: boolean): LazyMonad<T, M>
        monad<M>(monad: Monad<T, M>, type: T|((...args: any[]) => T)): LazyMonad<T, M>
        // array
        array(): T[]
    }
  
    interface MonadStream<T, M> extends ArrayLikeMonad<T, M> {
        // pattern
        pattern(...patterns: Array<[M]|[M, (...args: M[]) => M]|[M, (...args: M[]) => boolean, (...args: M[]) => M]>): LazyMonad<T, M>
        // monadic
        monadic(...patterns: Array<[M]|[M, (...args: T[]) => M]|[M, (...args: T[]) => boolean, (...args: T[]) => M]>): LazyMonad<T, M>
        // lazy
        //  - basic
        lazy(onmessage: CallbackAsync<M, M, {}>, sequential?: boolean): LazyMonad<T, M>
        lazy<V>(onmessage: CallbackAsync<M, M, V>, env: V, sequential?: boolean): LazyMonad<T, M>
        lazy<U>(onmessage: CallbackAsync<M, U, {}>, sequential?: boolean): LazyChain<U>
        lazy<U, V>(onmessage: CallbackAsync<M, U, V>, env: V, sequential?: boolean): LazyChain<U>
        //  - buffer
        lazy(buffer: number): LazyMonad<T, M>
        // stream
        //  - basic
        stream(onmessage: Callback<M, any, {}>): LazyMonad<T, M>
        stream<V>(onmessage: Callback<M, any, V>, env?: V): LazyMonad<T, M>
        //  - compose
        stream(...streams: Array<LazyMonad<T, M>>): LazyMonad<T, M>
        // array
        array(): T[]
    }

    interface Monad<T, M> extends Monoid<M> {
        return(arg: T): M
        bind(m: M, f: (arg: T) => M): M
        fail?(arg: any): M
    }
    
    interface Monoid<M> {
        mempty?(): M
        mappend?(m1: M, m2: M): M
        mconcat?(ms: M[]): M
    }

    interface Thenable<T> extends Then<T> { }
    
    interface WhenThen<T> {
        then(doneFilter?: (...values: T[][]) => T|Thenable<T>, failFilter?: (...reasons: T[]) => T|Thenable<T>, progressFilter?: (...progressions: T[]) => T|Thenable<T>|Deferred<T>): Thenable<T>;
        then(doneFilter?: (...values: T[][]) => T|Thenable<T>|void, failFilter?: (...reasons: T[]) => T|Thenable<T>|void, progressFilter?: (...progressions: T[]) => T|Thenable<T>|Deferred<T>|void): Thenable<T|void>;
        then<U>(doneFilter?: (...values: T[][]) => U|Thenable<U>, failFilter?: (...reasons: T[]) => U|Thenable<U>, progressFilter?: (...progressions: T[]) => U|Thenable<U>|Deferred<U>): Thenable<U>;
        then<U>(doneFilter?: (...values: T[][]) => U|Thenable<U>|void, failFilter?: (...reasons: T[]) => U|Thenable<U>|void, progressFilter?: (...progressions: T[]) => U|Thenable<U>|Deferred<U>|void): Thenable<U|void>;
    }

    interface Then<T> {
        then(doneFilter?: (...values: T[]) => T|Thenable<T>, failFilter?: (...reasons: T[]) => T|Thenable<T>, progressFilter?: (...progressions: T[]) => T|Thenable<T>|Deferred<T>): Thenable<T>;
        then(doneFilter?: (...values: T[]) => T|Thenable<T>|void, failFilter?: (...reasons: T[]) => T|Thenable<T>|void, progressFilter?: (...progressions: T[]) => T|Thenable<T>|Deferred<T>|void): Thenable<T|void>;
        then<U>(doneFilter?: (...values: T[]) => U|Thenable<U>, failFilter?: (...reasons: T[]) => U|Thenable<U>, progressFilter?: (...progressions: T[]) => U|Thenable<U>|Deferred<U>): Thenable<U>;
        then<U>(doneFilter?: (...values: T[]) => U|Thenable<U>|void, failFilter?: (...reasons: T[]) => U|Thenable<U>|void, progressFilter?: (...progressions: T[]) => U|Thenable<U>|Deferred<U>|void): Thenable<U|void>;
    }

    interface PromiseCallback<T> {
        (value?: T, ...args: any[]): void;
    }

    interface Promise<T> extends Then<T> {
        state(): string;
        always(...alwaysCallbacks: Array<PromiseCallback<T>|PromiseCallback<T>[]>): Promise<T>;
        done(...doneCallback: Array<PromiseCallback<T>|PromiseCallback<T>[]>): Promise<T>;
        fail(...failCallbacks: Array<PromiseCallback<T>|PromiseCallback<T>[]>): Promise<T>;
        progress(...progressCallback: Array<PromiseCallback<T>|PromiseCallback<T>[]>): Promise<T>;
    }

    interface Deferrable<T> extends Defer<T> { }

    interface Defer<T> {
        resolve(...values: T[]): Then<T>;
        reject(...values: T[]): Then<T>;
    }

    interface Deferred<T> extends Defer<T>, Promise<T> {
        notify(...values: T[]): Deferred<T>;
        resolve(...values: T[]): Promise<T>;
        reject(...values: T[]): Promise<T>;
        promise(): Promise<T>;
    }

}
