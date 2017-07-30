enum BasicTypes {
    number,
    boolean,
    string,
    object,
    date,
    function
};

enum BasicTypeScriptTypes {
    any,
    void
};

export function finderInBasicTypes(type: string): boolean {
    if (typeof type !== 'undefined') {
        return (type.toLowerCase() in BasicTypes);
    } else {
        return false;
    }
}

export function finderInTypeScriptBasicTypes(type: string): boolean {
    if (typeof type !== 'undefined') {
        return (type.toLowerCase() in BasicTypeScriptTypes);
    } else {
        return false;
    }
}
