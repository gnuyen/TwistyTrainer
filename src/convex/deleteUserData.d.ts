import type { MutationCtx } from './_generated/server';
export declare function deleteAllUserData(ctx: MutationCtx, tokenIdentifier: string): Promise<void>;
declare const _default: import("convex/server").RegisteredMutation<"public", {
    tokenIdentifier: string;
}, Promise<void>>;
export default _default;
/**
 * Public mutation for users to delete their own data
 * Gets tokenIdentifier from authenticated session
 */
export declare const deleteMyData: import("convex/server").RegisteredMutation<"public", {}, Promise<void>>;
