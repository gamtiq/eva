// Created on the basis of http://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html

export as namespace eva;

export type AnyFunc = (...args: any[]) => any;

export type MapParamListFunc = (target: AnyFunc, targetIndex: number, funcList: AnyFunc[]) => any[];

export type MapContextFunc = (target: AnyFunc, targetIndex: number, funcList: AnyFunc[]) => object;

export interface CreateFunctionSettings {
    debug?: boolean;
    debugFunc?: string;
    debugMessage?: string;
    expression?: string;
    paramNames?: string;
    scope?: boolean;
}

export interface CreateDelegateMethodSettings {
    destination?: object;
    destinationMethod?: string;
}

export interface ClosureSettings {
    ignoreArgs?: boolean;
    prependArgs?: boolean;
}

export interface MapSettings {
    funcContext?: boolean;
}

export function createFunction(
    code: string,
    settings?: CreateFunctionSettings
): AnyFunc;

export function evalWith(
    expression: string,
    context?: object,
    scope?: object
): any;

export function createDelegateMethod(
    delegate: object,
    method: string,
    settings?: CreateDelegateMethodSettings
): AnyFunc;

export function closure(
    action: AnyFunc,
    paramList?: any[],
    context?: object,
    settings?: ClosureSettings
): AnyFunc;

export function map(
    funcList: AnyFunc[],
    paramList?: any[] | MapParamListFunc,
    context?: object | null | MapContextFunc,
    settings?: MapSettings
): any[];
