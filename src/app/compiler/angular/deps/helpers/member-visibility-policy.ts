import * as _ from 'lodash';

import { ts, SyntaxKind } from 'ts-morph';

export class MemberVisibilityPolicy {
    constructor(private readonly hasJSDocTag: (member: ts.Node, tagName: string) => boolean) {}

    public extractModifierKinds(node: any): number[] | undefined {
        if (!node.modifiers || node.modifiers.length === 0) {
            return undefined;
        }

        let kinds = node.modifiers.map((modifier: any) => modifier.kind);
        if (
            _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
            _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
        ) {
            kinds = kinds.filter((kind: number) => kind !== SyntaxKind.PublicKeyword);
        }
        return kinds;
    }

    public ensurePrivateKeyword(result: any, node: any): void {
        if (!this.isPrivate(node)) {
            return;
        }

        if (!result.modifierKind) {
            result.modifierKind = [];
        }

        const hasAlreadyPrivateKeyword = result.modifierKind.includes(SyntaxKind.PrivateKeyword);
        if (!hasAlreadyPrivateKeyword) {
            result.modifierKind.push(SyntaxKind.PrivateKeyword);
        }
    }

    public isPrivate(member: any): boolean {
        if (member.modifiers) {
            const isPrivate: boolean = member.modifiers.some(
                (modifier: any) => modifier.kind === SyntaxKind.PrivateKeyword
            );
            if (isPrivate) {
                return true;
            }
        }

        if (member.name && member.name.escapedText) {
            const isPrivate: boolean = member.name.escapedText.indexOf('#') === 0;
            if (isPrivate) {
                return true;
            }
        }

        return this.isHiddenMember(member);
    }

    public isProtected(member: any): boolean {
        if (member.modifiers) {
            const isProtected: boolean = member.modifiers.some(
                (modifier: any) => modifier.kind === SyntaxKind.ProtectedKeyword
            );
            if (isProtected) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    public isInternal(member: any): boolean {
        return this.hasJSDocTag(member, 'internal');
    }

    public isPublic(member: any): boolean {
        if (member.modifiers) {
            const isPublic: boolean = member.modifiers.some(
                (modifier: any) => modifier.kind === SyntaxKind.PublicKeyword
            );
            if (isPublic) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    public isHiddenMember(member: any): boolean {
        return this.hasJSDocTag(member, 'hidden');
    }
}
