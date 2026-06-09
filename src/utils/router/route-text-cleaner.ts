export class RouteTextCleaner {
    private readonly transformAngular8ImportSyntax =
        /(['"]loadChildren['"]:)\(\)(:[^)]+?)?=>"import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)\.then\(\(?\w+?\)?=>\S+?\.([^)]+?)\)(\\'|'|")/g;
    private readonly transformAngular8ImportSyntaxComponent =
        /(['"]loadComponent['"]:)\(\)(:[^)]+?)?=>"import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)\.then\(\(?\w+?\)?=>\S+?\.([^)]+?)\)(\\'|'|")/g;
    private readonly transformAngular8ImportSyntaxAsyncAwait =
        /(['"]loadChildren['"]:)\(\)(:[^)]+?)?=>\("import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)"\)\.['"]([^)]+?)['"]/g;
    private readonly transformAngular8ImportSyntaxComponentAsyncAwait =
        /(['"]loadComponent['"]:)\(\)(:[^)]+?)?=>\("import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)"\)\.['"]([^)]+?)['"]/g;
    private readonly trailingComma = /,\s*([\]})])/g;

    public clean(route: string): string {
        let cleaned = route
            .replace(/\s/g, '')
            .replace(this.trailingComma, '$1')
            .replace(this.transformAngular8ImportSyntax, '$1"$4#$6"')
            .replace(this.transformAngular8ImportSyntaxAsyncAwait, '$1"$4#$6"')
            .replace(this.transformAngular8ImportSyntaxComponent, '$1"$4#$6"')
            .replace(this.transformAngular8ImportSyntaxComponentAsyncAwait, '$1"$4#$6"');

        cleaned = cleaned
            .replace(
                /"?loadChildren"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(\{["']?(\w+)["']?\}\)=>["']?\2["']?\)/g,
                'loadChildren:"$1#$2"'
            )
            .replace(
                /"?loadComponent"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(\{["']?(\w+)["']?\}\)=>["']?\2["']?\)/g,
                'loadComponent:"$1#$2"'
            )
            .replace(
                /"?loadChildren"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(?["']?\w+["']?\)?"?=>(?:["']?\w+["']?\.)?"?(\w+)"?\)/g,
                'loadChildren:"$1#$2"'
            )
            .replace(
                /"?loadComponent"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(?["']?\w+["']?\)?"?=>(?:["']?\w+["']?\.)?"?(\w+)"?\)/g,
                'loadComponent:"$1#$2"'
            )
            .replace(
                /"?loadComponent"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)(?!\."?then"?\()/g,
                'loadComponent:"$1#default"'
            )
            .replace(
                /"?loadChildren"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)(?!\."?then"?\()/g,
                'loadChildren:"$1#default"'
            );

        cleaned = cleaned.replace(/\$\{([^}]+)\}/g, '$1');

        let previous: string;
        do {
            previous = cleaned;
            cleaned = cleaned
                .replace(/"([^"\\]*)"\+"([^"\\]*)"/g, '"$1$2"')
                .replace(/'([^'\\]*)'\+'([^'\\]*)'/g, "'$1$2'");
        } while (cleaned !== previous);

        do {
            previous = cleaned;
            cleaned = cleaned
                .replace(/([a-zA-Z_$][a-zA-Z0-9_$.]*)\+"([^"]*)"/g, '"$1$2"')
                .replace(/"([^"]*)"\+([a-zA-Z_$][a-zA-Z0-9_$.]*)/g, '"$1$2"');
        } while (cleaned !== previous);

        do {
            previous = cleaned;
            cleaned = cleaned.replace(
                /"([a-zA-Z_$][a-zA-Z0-9_$]*)"\."([a-zA-Z_$][a-zA-Z0-9_$]*)"/g,
                '"$1.$2"'
            );
        } while (cleaned !== previous);

        cleaned = cleaned
            .replace(/:([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)+)/g, ':"$1"')
            .replace(
                /([[,])([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)+)(?=[,\]])/g,
                '$1"$2"'
            )
            .replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\(([^()]*)\)/g, '"$1()"')
            .replace(/([{,])([a-zA-Z_$][a-zA-Z0-9_$]*)(?=[,}])/g, '$1$2:"$2"')
            .replace(/:(\([^)(]*\))=>[^{,}\]]+/g, ':"[Function]"');

        cleaned = this.replaceBlockArrowFunctions(cleaned);
        cleaned = this.unwrapConstructorWrappedObjectValues(cleaned);

        return cleaned;
    }

    private replaceBlockArrowFunctions(input: string): string {
        const lazyKeys = ['loadChildren', 'loadComponent'];
        let result = '';
        let index = 0;
        let inDouble = false;
        let inSingle = false;

        while (index < input.length) {
            const current = input[index];

            if (current === '"' && !inSingle) {
                inDouble = !inDouble;
                result += current;
                index++;
                continue;
            }

            if (current === "'" && !inDouble) {
                inSingle = !inSingle;
                result += current;
                index++;
                continue;
            }

            if (current === '\\' && (inDouble || inSingle)) {
                result += current + (input[index + 1] || '');
                index += 2;
                continue;
            }

            if (
                !inDouble &&
                !inSingle &&
                current === '=' &&
                input[index + 1] === '>' &&
                input[index + 2] === '{'
            ) {
                let valueStart = result.length - 1;
                let depth = 0;

                while (valueStart >= 0) {
                    const resultCharacter = result[valueStart];

                    if (resultCharacter === ')' || resultCharacter === ']') {
                        depth++;
                        valueStart--;
                        continue;
                    }

                    if (resultCharacter === '(' || resultCharacter === '[') {
                        if (depth === 0) {
                            valueStart--;
                            continue;
                        }

                        depth--;
                        valueStart--;
                        continue;
                    }

                    if ((resultCharacter === ':' || resultCharacter === ',') && depth === 0) {
                        break;
                    }

                    valueStart--;
                }

                if (valueStart >= 0 && result[valueStart] === ':') {
                    const prefix = result.substring(0, valueStart);
                    const isLazy = lazyKeys.some(key => prefix.endsWith(key));

                    if (!isLazy) {
                        let bodyIndex = index + 3;
                        let braceDepth = 1;

                        while (bodyIndex < input.length && braceDepth > 0) {
                            if (input[bodyIndex] === '{') {
                                braceDepth++;
                            } else if (input[bodyIndex] === '}') {
                                braceDepth--;
                            }
                            bodyIndex++;
                        }

                        result = `${result.substring(0, valueStart + 1)}:"[Function]"`;
                        index = bodyIndex;
                        continue;
                    }
                }
            }

            result += current;
            index++;
        }

        return result;
    }

    private unwrapConstructorWrappedObjectValues(input: string): string {
        const isIdentifierStart = (current: string | undefined): boolean =>
            Boolean(current && /[A-Za-z_$]/.test(current));
        const isIdentifierPart = (current: string | undefined): boolean =>
            Boolean(current && /[A-Za-z0-9_$]/.test(current));

        let result = '';
        let index = 0;
        let inDouble = false;
        let inSingle = false;

        while (index < input.length) {
            const current = input[index];

            if (current === '"' && !inSingle) {
                inDouble = !inDouble;
                result += current;
                index++;
                continue;
            }

            if (current === "'" && !inDouble) {
                inSingle = !inSingle;
                result += current;
                index++;
                continue;
            }

            if (current === '\\' && (inDouble || inSingle)) {
                result += current + (input[index + 1] || '');
                index += 2;
                continue;
            }

            if (
                !inDouble &&
                !inSingle &&
                current === ':' &&
                input.slice(index + 1, index + 4) === 'new'
            ) {
                let nameStart = index + 4;

                if (!isIdentifierStart(input[nameStart])) {
                    result += current;
                    index++;
                    continue;
                }

                while (isIdentifierPart(input[nameStart])) {
                    nameStart++;
                }

                if (input[nameStart] !== '(' || input[nameStart + 1] !== '{') {
                    result += current;
                    index++;
                    continue;
                }

                let cursor = nameStart + 2;
                let braceDepth = 1;
                let objectInDouble = false;
                let objectInSingle = false;

                while (cursor < input.length && braceDepth > 0) {
                    const cursorValue = input[cursor];

                    if (cursorValue === '\\' && (objectInDouble || objectInSingle)) {
                        cursor += 2;
                        continue;
                    }

                    if (cursorValue === '"' && !objectInSingle) {
                        objectInDouble = !objectInDouble;
                        cursor++;
                        continue;
                    }

                    if (cursorValue === "'" && !objectInDouble) {
                        objectInSingle = !objectInSingle;
                        cursor++;
                        continue;
                    }

                    if (!objectInDouble && !objectInSingle) {
                        if (cursorValue === '{') {
                            braceDepth++;
                        } else if (cursorValue === '}') {
                            braceDepth--;
                        }
                    }

                    cursor++;
                }

                if (braceDepth !== 0 || input[cursor] !== ')') {
                    result += current;
                    index++;
                    continue;
                }

                const objectLiteral = input.slice(nameStart + 1, cursor);
                result += `:${objectLiteral}`;
                index = cursor + 1;
                continue;
            }

            result += current;
            index++;
        }

        return result;
    }
}
