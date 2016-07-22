export interface Spy<T extends Function> {
    (...args: any[]): any;
    originalFunc?: T;
    called?: boolean;
    callCount?: number;
    lastArgs?: any[];
    lastException?: any;
    lastResult?: any;
}

export function spy<T extends Function>(f?: T): Spy<T> {
    if (!f) f = (function() {} as any) as T;

    let ret: Spy<T>;
    ret = (function(...args: any[]) {
        ret.called = true;
        ret.callCount++;
        ret.lastArgs = args;
        ret.lastException = undefined;
        let result: any;

        try {
            result = f(...args);
        } catch (e) {
            ret.lastException = e;
        }
        ret.lastResult = result;
        return result;
    } as any) as Spy<T>;

    ret.originalFunc = f;
    ret.callCount = 0;
    ret.called = false;

    return ret;
}
