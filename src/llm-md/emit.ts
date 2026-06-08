import {
    collapseDescription,
    collapseSignatureWhitespace,
    deprecatedTail,
    escapeMarkdown,
    formatMethodSignature,
    formatPropertySignature,
    inlineCode,
    joinSections,
} from "./format";

const fileLine = (file: string | undefined): string =>
    file ? `File: ${inlineCode(file)}` : "";

const descriptionLine = (description: string | undefined): string => {
    const collapsed = collapseDescription(description);
    return collapsed ? `Description: ${escapeMarkdown(collapsed)}` : "";
};

const formatArg = (arg: any): string => {
    const name = `${arg.name}${arg.optional ? "?" : ""}`;
    const prefix = arg.dotDotDotToken ? "..." : "";
    let seg = `${prefix}${name}`;
    if (arg.type) {
        seg = `${prefix}${name}: ${collapseSignatureWhitespace(arg.type)}`;
    }
    if (arg.defaultValue !== undefined && arg.defaultValue !== "") {
        seg = `${seg} = ${collapseSignatureWhitespace(arg.defaultValue)}`;
    }
    return seg;
};

const renderProperty = (prop: any): string => {
    const sig = formatPropertySignature(
        prop.name,
        prop.type,
        prop.optional,
        prop.defaultValue,
    );
    const dep = deprecatedTail(prop.deprecated, prop.deprecationMessage);
    const desc = collapseDescription(prop.description);
    const tail = desc ? ` — ${escapeMarkdown(desc)}` : "";
    return `- ${inlineCode(sig)}${dep}${tail}`;
};

const renderMethod = (method: any): string => {
    const args = (method.args ?? []).map(formatArg);
    const sig = formatMethodSignature(method.name, args, method.returnType);
    const dep = deprecatedTail(method.deprecated, method.deprecationMessage);
    const desc = collapseDescription(method.description);
    const tail = desc ? ` — ${escapeMarkdown(desc)}` : "";
    return `- ${inlineCode(sig)}${dep}${tail}`;
};

const renderList = (heading: string, items: ReadonlyArray<string>): string => {
    if (items.length === 0) {
        return "";
    }
    return `${heading}:\n${items.join("\n")}`;
};

const renderProperties = (heading: string, props: ReadonlyArray<any>): string =>
    renderList(heading, props.map(renderProperty));

const renderMethods = (heading: string, methods: ReadonlyArray<any>): string =>
    renderList(heading, methods.map(renderMethod));

const renderTemplateVariables = (variables: ReadonlyArray<any>): string =>
    renderList(
        "Template variables",
        variables.map(
            variable =>
                `- ${inlineCode(variable.name)} = ${inlineCode(String(variable.defaultValue))}`,
        ),
    );

const heroLines = (
    name: string,
    file: string | undefined,
    extras: ReadonlyArray<string>,
): string => {
    const heading = `### ${escapeMarkdown(name)}`;
    const meta = [fileLine(file), ...extras].filter((s) => s.length > 0);
    return meta.length === 0 ? heading : `${heading}\n\n${meta.join("\n")}`;
};

export const emitComponent = (entity: any): string => {
    const extras: string[] = [];
    if (entity.selector) {
        extras.push(`Selector: ${inlineCode(entity.selector)}`);
    }
    if (entity.standalone === true) {
        extras.push("Standalone: yes");
    }
    if (entity.changeDetection) {
        extras.push(
            `Change detection: ${inlineCode(String(entity.changeDetection))}`,
        );
    }
    if (entity.exportAs) {
        extras.push(`Exported as: ${inlineCode(entity.exportAs)}`);
    }
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    if (dep) {
        extras.push(`Deprecated:${dep}`);
    }
    return joinSections([
        heroLines(entity.name, entity.file, extras),
        descriptionLine(entity.description),
        renderProperties("Inputs", entity.inputsClass ?? []),
        renderProperties("Outputs", entity.outputsClass ?? []),
        renderProperties("Properties", entity.propertiesClass ?? []),
        renderTemplateVariables(entity.templateVariables ?? []),
        renderMethods("Methods", entity.methodsClass ?? []),
    ]);
};

export const emitDirective = (entity: any): string => {
    const extras: string[] = [];
    if (entity.selector) {
        extras.push(`Selector: ${inlineCode(entity.selector)}`);
    }
    if (entity.standalone === true) {
        extras.push("Standalone: yes");
    }
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    if (dep) {
        extras.push(`Deprecated:${dep}`);
    }
    return joinSections([
        heroLines(entity.name, entity.file, extras),
        descriptionLine(entity.description),
        renderProperties("Inputs", entity.inputsClass ?? []),
        renderProperties("Outputs", entity.outputsClass ?? []),
        renderProperties("Properties", entity.propertiesClass ?? []),
        renderMethods("Methods", entity.methodsClass ?? []),
    ]);
};

export const emitPipe = (entity: any): string => {
    const extras: string[] = [];
    if (entity.ngname) {
        extras.push(`Pipe name: ${inlineCode(entity.ngname)}`);
    }
    if (entity.standalone === true) {
        extras.push("Standalone: yes");
    }
    if (entity.pure !== undefined) {
        extras.push(`Pure: ${inlineCode(String(entity.pure))}`);
    }
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    if (dep) {
        extras.push(`Deprecated:${dep}`);
    }
    return joinSections([
        heroLines(entity.name, entity.file, extras),
        descriptionLine(entity.description),
        renderProperties("Properties", entity.properties ?? []),
        renderMethods("Methods", entity.methods ?? []),
    ]);
};

const emitClassLike = (
    entity: any,
    extraLines: ReadonlyArray<string>,
): string => {
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    const allExtras = [...extraLines];
    if (dep) {
        allExtras.push(`Deprecated:${dep}`);
    }
    return joinSections([
        heroLines(entity.name, entity.file, allExtras),
        descriptionLine(entity.description),
        renderProperties("Properties", entity.properties ?? []),
        renderMethods("Methods", entity.methods ?? []),
    ]);
};

export const emitInjectable = (entity: any): string => {
    const extras: string[] = [];
    if (entity.providedIn) {
        extras.push(`providedIn: ${inlineCode(entity.providedIn)}`);
    }
    if (entity.isToken) {
        extras.push("Kind: InjectionToken");
        if (entity.tokenType) {
            extras.push(`Token type: ${inlineCode(entity.tokenType)}`);
        }
    }
    return emitClassLike(entity, extras);
};

export const emitInterceptor = (entity: any): string =>
    emitClassLike(entity, []);

export const emitGuard = (entity: any): string => {
    const extras: string[] = [];
    if (entity.implements && entity.implements.length > 0) {
        extras.push(
            `Implements: ${entity.implements.map((s: string) => inlineCode(s)).join(", ")}`,
        );
    }
    return emitClassLike(entity, extras);
};

export const emitClass = (entity: any): string => {
    const extras: string[] = [];
    if (entity.extends) {
        const list = Array.isArray(entity.extends)
            ? entity.extends
            : [entity.extends];
        if (list.length > 0) {
            extras.push(
                `Extends: ${list.map((s: string) => inlineCode(s)).join(", ")}`,
            );
        }
    }
    return emitClassLike(entity, extras);
};

export const emitInterface = (entity: any): string => {
    const extras: string[] = [];
    if (entity.extends) {
        const list = Array.isArray(entity.extends)
            ? entity.extends
            : [entity.extends];
        if (list.length > 0) {
            extras.push(
                `Extends: ${list.map((s: string) => inlineCode(s)).join(", ")}`,
            );
        }
    }
    return emitClassLike(entity, extras);
};

export const emitModule = (entity: any): string => {
    const extras: string[] = [];
    const groups = entity.children ?? [];
    for (const group of groups) {
        const names = group.elements
            .map((e: any) => e.name)
            .filter((n: any) => typeof n === "string");
        if (names.length === 0) {
            continue;
        }
        const inlined = names.map((n: string) => inlineCode(n)).join(", ");
        extras.push(`${group.type}: ${inlined}`);
    }
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    if (dep) {
        extras.push(`Deprecated:${dep}`);
    }
    return joinSections([
        heroLines(entity.name, entity.file, extras),
        descriptionLine(entity.description),
        renderMethods("Methods", entity.methods ?? []),
    ]);
};

export const emitFunction = (entity: any): string => {
    const args = (entity.args ?? []).map(formatArg);
    const sig = formatMethodSignature(entity.name, args, entity.returnType);
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    const desc = collapseDescription(entity.description);
    let line = `- ${inlineCode(sig)}${dep}`;
    if (desc) {
        line = `${line} — ${escapeMarkdown(desc)}`;
    }
    if (entity.file) {
        line = `${line}\n  Defined in ${inlineCode(entity.file)}`;
    }
    return line;
};

export const emitTypeAlias = (entity: any): string => {
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    const rhs = entity.rawtype
        ? ` = ${collapseSignatureWhitespace(entity.rawtype)}`
        : "";
    const sig = `type ${entity.name}${rhs}`;
    const desc = collapseDescription(entity.description);
    const tail = desc ? ` — ${escapeMarkdown(desc)}` : "";
    return `- ${inlineCode(sig)}${dep}${tail}`;
};

export const emitEnumeration = (entity: any): string => {
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    const headerLine = `- ${inlineCode(`enum ${entity.name}`)}${dep}`;
    const descCollapsed = collapseDescription(entity.description);
    const desc = descCollapsed
        ? `${headerLine} — ${escapeMarkdown(descCollapsed)}`
        : headerLine;
    const memberLines = (entity.childs ?? []).map((m: any) => {
        const valuePart = m.value
            ? ` = ${collapseSignatureWhitespace(m.value)}`
            : "";
        const memberDep = deprecatedTail(m.deprecated, m.deprecationMessage);
        return `  - ${inlineCode(`${m.name}${valuePart}`)}${memberDep}`;
    });
    return memberLines.length > 0 ? `${desc}\n${memberLines.join("\n")}` : desc;
};

export const emitVariable = (entity: any): string => {
    const dep = deprecatedTail(entity.deprecated, entity.deprecationMessage);
    const sig = formatPropertySignature(
        entity.name,
        entity.type,
        false,
        entity.defaultValue,
    );
    const desc = collapseDescription(entity.description);
    const tail = desc ? ` — ${escapeMarkdown(desc)}` : "";
    const fileTail = entity.file
        ? `\n  Defined in ${inlineCode(entity.file)}`
        : "";
    return `- ${inlineCode(sig)}${dep}${tail}${fileTail}`;
};
