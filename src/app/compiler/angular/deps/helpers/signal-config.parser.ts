export class SignalConfigParser {
    public getSignalConfig(type: 'input' | 'output' | 'model', defaultValue: string) {
        if (!defaultValue) return undefined;

        const normalized = defaultValue.replace(/\n/g, '');
        const prefixRegExp = new RegExp(`^${type}(\\.required)?`);
        const prefixMatch = prefixRegExp.exec(normalized);
        if (!prefixMatch) return undefined;

        const required = !!prefixMatch[1];
        let pos = prefixMatch[0].length;

        let signalType: string | undefined;
        if (normalized[pos] === '<') {
            const typeEnd = this.findMatchingBracket(normalized, pos, '<', '>');
            if (typeEnd === -1) return undefined;
            signalType = normalized.slice(pos + 1, typeEnd);
            pos = typeEnd + 1;
        }

        if (normalized[pos] !== '(') return undefined;
        const argsEnd = this.findMatchingBracket(normalized, pos, '(', ')');
        if (argsEnd === -1) return undefined;

        const fullArgs = normalized.slice(pos + 1, argsEnd).trim();
        const firstArg = this.extractFirstSignalArg(fullArgs) || undefined;
        const secondArg = this.extractSignalOptions(fullArgs);
        const isSoleArgOptions = !secondArg && !!firstArg?.trimStart().startsWith('{');
        let signalDefaultValue = isSoleArgOptions ? undefined : firstArg;

        if (signalDefaultValue && /\)\s*=>\s*\{/.test(signalDefaultValue)) {
            signalDefaultValue = '() => {...}';
        }

        const optionsStr = isSoleArgOptions ? firstArg : secondArg;
        const aliasRegExp = /alias:\s*['"\`]([^\u0000-\u001F\u007F\u0080-\u009F '"\`>/=]+)['"\`]/;
        const alias = optionsStr?.match(aliasRegExp)?.[1];

        const result = {
            required,
            type:
                this.parseSignalType(this.extractFirstTypeParam(signalType)) ??
                this.inferTypeFromValue(signalDefaultValue),
            defaultValue: signalDefaultValue
        };

        return alias ? { ...result, name: alias } : result;
    }

    public parseSignalType(type: string | undefined) {
        if (!type) {
            return type;
        }

        const unionTypeRegex = /^'([\w-]+)'\s?\|\s?('([\w-]+)'|.*)$/;
        let typeRest = type;
        let newType = '';
        let typeMatch: RegExpMatchArray | null;
        while ((typeMatch = typeRest.match(unionTypeRegex))) {
            const [, first, rest, second] = typeMatch;
            if (second) {
                newType += `"${first}" | "${second}"`;
                type = newType;
                break;
            }
            newType += `"${first}" | `;
            typeRest = rest;
        }

        return type;
    }

    private extractSignalOptions(argsStr: string): string | undefined {
        if (!argsStr) return undefined;

        let depth = 0;
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if (ch === '"' || ch === "'" || ch === '`') {
                const quote = ch;
                i++;
                while (i < argsStr.length && argsStr[i] !== quote) {
                    if (argsStr[i] === '\\') i++;
                    i++;
                }
            } else if (ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === ')' || ch === ']' || ch === '}') {
                depth--;
            } else if (ch === ',' && depth === 0) {
                return argsStr.slice(i + 1).trim();
            }
        }

        return undefined;
    }

    private extractFirstSignalArg(argsStr: string): string {
        if (!argsStr) return '';

        let depth = 0;
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if (ch === '"' || ch === "'" || ch === '`') {
                const quote = ch;
                i++;
                while (i < argsStr.length && argsStr[i] !== quote) {
                    if (argsStr[i] === '\\') i++;
                    i++;
                }
            } else if (ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === ')' || ch === ']' || ch === '}') {
                depth--;
            } else if (ch === ',' && depth === 0) {
                return argsStr.slice(0, i).trim();
            }
        }

        return argsStr.trim();
    }

    private findMatchingBracket(
        str: string,
        startPos: number,
        open: string,
        close: string
    ): number {
        let depth = 0;
        for (let i = startPos; i < str.length; i++) {
            if (str[i] === open) depth++;
            else if (str[i] === close) {
                if (close === '>' && i > 0 && str[i - 1] === '=') continue;
                depth--;
                if (depth === 0) return i;
            }
        }
        return -1;
    }

    private extractFirstTypeParam(typeStr: string | undefined): string | undefined {
        if (!typeStr) return typeStr;
        let depth = 0;
        for (let i = 0; i < typeStr.length; i++) {
            const ch = typeStr[i];
            if (ch === '<' || ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') {
                if (ch === '>' && i > 0 && typeStr[i - 1] === '=') continue;
                depth--;
            } else if (ch === ',' && depth === 0) {
                return typeStr.slice(0, i).trim();
            }
        }
        return typeStr;
    }

    private inferTypeFromValue(value: string | undefined): string | undefined {
        if (!value) return undefined;
        const trimmed = value.trim();
        if (trimmed === 'true' || trimmed === 'false') return 'boolean';
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) return 'number';
        if (/^(['"\`]).*\1$/.test(trimmed)) return 'string';
        return undefined;
    }
}
