/// <reference path="../../typings/globals/mocha/index.d.ts" />

import { expect } from "chai";
import { spy, Spy } from "../../src/spy/spy";

class Testclass {
    private str: string;

    constructor(s: string) {
        this.str = s;
    }

    num(): number {
        return this.raw(this.str);
    }

    raw(str: string): number {
        let ret = parseInt(str);
        if (isNaN(ret)) {
            throw "Number format error";
        }

        return ret;
    }
}

function test_success(q: any, correctResult?: any, ...args: any[]) {
    describe("successfully", () => {
        let oldCount = q.callCount;
        let result = q(...args);

        it("returns correct result", () => {
            expect(result).to.deep.equal(correctResult);
        });
        it("sets .called after being called", () => {
            expect(q.called).to.be.true;
        });
        it("increase .callCount after being called", () => {
            expect(q.callCount).to.equal(oldCount + 1);
        });
        it("records correct arguments", () => {
            expect(q.lastArgs).to.deep.equal(args);
        });
        it("records correct result", () => {
            expect(q.lastResult).to.equal(result);
        });
        it("records no exception", () => {
            expect(q.lastException).to.be.undefined;
        });
    });
}

function test_err(q: any, ...args: any[]) {
    describe("erroneously", () => {
        let oldCount = q.callCount;
        let result = q(...args);

        it("records an exception", () => {
            expect(q.lastException).not.to.be.undefined;
        });
        it("sets .called after being called", () => {
            expect(q.called).to.be.true;
        });
        it("increase .callCount after being called", () => {
            expect(q.callCount).to.equal(oldCount + 1);
        });
        it("records correct arguments", () => {
            expect(q.lastArgs).to.deep.equal(args);
        });
        it("records correct result", () => {
            expect(q.lastResult).to.equal(result);
        });
    });
}

function test_initial(q: any) {
    describe("initially", () => {
        it("has 0 call count", () => {
            expect(q.callCount).to.equal(0);
        });
        it("has not been called", () => {
            expect(q.called).to.be.false;
        });
        it("records no argument", () => {
            expect(q.lastArgs).to.be.undefined;
        });
        it("records no result", () => {
            expect(q.lastResult).to.be.undefined;
        });
        it("records no exception", () => {
            expect(q.lastException).to.be.undefined;
        });
    });
}

interface Suit {
    okFunc: Function;
    okResult: any;
    okArgs: any[];
    failFunc: Function;
    failArgs: any[];
}

function test_suit(opts: Suit) {
    test_initial(spy(opts.okFunc));

    describe("first called", () => {
        test_success(spy(opts.okFunc), opts.okResult, ...opts.okArgs);
        test_err(spy(opts.failFunc), ...opts.failArgs);
    });

    describe("called twice", () => {
        let ok = spy(opts.okFunc);
        ok(...opts.okArgs);
        test_success(spy(opts.okFunc), opts.okResult, ...opts.okArgs);

        let fail = spy(opts.failFunc);
        fail(...opts.failArgs);
        test_err(fail, ...opts.failArgs);
    });
}

describe("spy", () => {
    describe("on nothing", () => {
        test_initial(spy());

        describe("first called", () => {
            test_success(spy());
        });

        describe("called twice", () => {
            let t = spy();
            t();
            test_success(t);
        });
    });

    describe("on function", () => {
        let f = function(str: string): number {
            let ret = parseInt(str);
            if (isNaN(ret)) {
                throw "Number format error";
            }

            return ret;
        };

        test_suit({
            okFunc: f,
            okResult: 1,
            okArgs: ["1"],
            failFunc: f,
            failArgs: ["fail"]
        });
    });

    describe("on spy", () => {
        let f = function(str: string): number {
            let ret = parseInt(str);
            if (isNaN(ret)) {
                throw "Number format error";
            }

            return ret;
        };

        test_suit({
            okFunc: f,
            okResult: 1,
            okArgs: ["1"],
            failFunc: f,
            failArgs: ["fail"]
        });
    });

    describe("on unbound method", () => {
        let ok = new Testclass("1");
        let fail = new Testclass("fail");

        test_suit({
            okFunc: fail.raw,
            okResult: 1,
            okArgs: ["1"],
            failFunc: ok.raw,
            failArgs: ["fail"]
        });
    });

    describe("on bound method", () => {
        let ok = new Testclass("1");
        let fail = new Testclass("fail");

        test_suit({
            okFunc: ok.num.bind(ok),
            okResult: 1,
            okArgs: [],
            failFunc: fail.num.bind(fail),
            failArgs: []
        });
    });
});
