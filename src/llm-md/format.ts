const SOFT_BREAK_PATTERN = /\s*\n\s*/g;
const MULTI_SPACE_PATTERN = /\s{2,}/g;
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/gi;
const HTML_ENTITY_PATTERN = /&(amp|lt|gt|quot|#39|nbsp);/gi;
const ENTITY_REPLACEMENTS: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
};
const LINK_TAG_PATTERN = /\{@link\s+([^}]+)\}/g;

export const collapseDescription = (input: string | undefined): string => {
    if (!input) {
        return "";
    }
    let out = input.replace(LINK_TAG_PATTERN, (_match, target) => {
        const text = String(target).trim();
        const split = text.split("|");
        return split.length > 1 ? split[1].trim() : split[0];
    });
    out = out.replace(HTML_TAG_PATTERN, " ");
    out = out.replace(
        HTML_ENTITY_PATTERN,
        (m) => ENTITY_REPLACEMENTS[m.toLowerCase()] ?? m,
    );
    out = out.replace(SOFT_BREAK_PATTERN, " ");
    out = out.replace(MULTI_SPACE_PATTERN, " ");
    return out.trim();
};

export const escapeMarkdown = (input: string | undefined): string => {
    if (!input) {
        return "";
    }
    return input
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\*/g, "\\*")
        .replace(/_/g, "\\_")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\|/g, "\\|")
        .replace(/</g, "\\<")
        .replace(/>/g, "\\>")
        .replace(/^#/gm, "\\#");
};

export const inlineCode = (input: string | undefined): string => {
    if (!input) {
        return "``";
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        return "``";
    }
    let runLen = 1;
    const matches = trimmed.match(/`+/g);
    if (matches) {
        for (const m of matches) {
            if (m.length >= runLen) {
                runLen = m.length + 1;
            }
        }
    }
    const fence = "`".repeat(runLen);
    const padded =
        trimmed.startsWith("`") || trimmed.endsWith("`")
            ? ` ${trimmed} `
            : trimmed;
    return `${fence}${padded}${fence}`;
};

export const formatPropertySignature = (
    name: string,
    type: string | undefined,
    optional: boolean | undefined,
    defaultValue: string | undefined,
): string => {
    const nameSeg = `${name}${optional ? "?" : ""}`;
    const parts = [nameSeg];
    if (type) {
        parts[0] = `${nameSeg}: ${collapseSignatureWhitespace(type)}`;
    }
    if (defaultValue !== undefined && defaultValue !== "") {
        parts[0] = `${parts[0]} = ${collapseSignatureWhitespace(defaultValue)}`;
    }
    return parts[0];
};

export const formatMethodSignature = (
    name: string,
    args: ReadonlyArray<string>,
    returnType: string | undefined,
): string => {
    const argSeg = args.join(", ");
    const ret = returnType
        ? `: ${collapseSignatureWhitespace(returnType)}`
        : "";
    return `${name}(${argSeg})${ret}`;
};

export const SIGNATURE_VALUE_CAP = 160;

export const collapseSignatureWhitespace = (s: unknown): string => {
    const collapsed = String(s ?? "")
        .replace(/\s+/g, " ")
        .trim();
    if (collapsed.length <= SIGNATURE_VALUE_CAP) {
        return collapsed;
    }
    return `${collapsed.slice(0, SIGNATURE_VALUE_CAP)}\u2026`;
};

export const deprecatedTail = (
    deprecated: boolean | undefined,
    message: string | undefined,
): string => {
    if (!deprecated) {
        return "";
    }
    const collapsed = collapseDescription(message);
    return collapsed ? ` (deprecated: ${collapsed})` : " (deprecated)";
};

export const joinSections = (sections: ReadonlyArray<string>): string =>
    sections.filter((s) => s && s.length > 0).join("\n\n");
