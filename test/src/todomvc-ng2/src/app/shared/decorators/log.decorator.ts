export function LogMethod(target: any, key: string) {
    console.log('LogMethod: ' + key);
};

export function LogProperty(target: any, key: string) {
    console.log('LogProperty: ', key);
}

export function LogPropertyWithArgs(alias: string): any {
    console.log('LogPropertyWithArgs: ', alias);
}

export function LogClass(target: any) {
    console.log('LogClass: ', target);
}

export function LogClassWithArgs(filter: string) {
    console.log('LogClass: ', filter);
    return (target: Object) => {
    }
}
