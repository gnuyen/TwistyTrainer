export declare const getSavedCubesForCurrentUser: import("convex/server").RegisteredQuery<"public", {
    includeDeleted?: boolean | undefined;
}, Promise<{
    _id: import("convex/values").GenericId<"savedCubes">;
    _creationTime: number;
    deletedAt?: number | undefined;
    macAddress?: string | undefined;
    tokenIdentifier: string;
    name: string;
    lastModified: number;
    uuid: string;
    dateAdded: number;
    lastConnected: number;
}[]>>;
export declare const addCube: import("convex/server").RegisteredMutation<"public", {
    cube: {
        deletedAt?: number | undefined;
        macAddress?: string | undefined;
        name: string;
        lastModified: number;
        uuid: string;
        dateAdded: number;
        lastConnected: number;
    };
}, Promise<import("convex/values").GenericId<"savedCubes">>>;
export declare const updateCube: import("convex/server").RegisteredMutation<"public", {
    uuid: string;
    updates: {
        deletedAt?: number | null | undefined;
        name?: string | undefined;
        macAddress?: string | undefined;
        lastConnected?: number | undefined;
        lastModified: number;
    };
}, Promise<void>>;
export declare const deleteCube: import("convex/server").RegisteredMutation<"public", {
    uuid: string;
}, Promise<void>>;
export declare const bulkUpsertCubes: import("convex/server").RegisteredMutation<"public", {
    cubes: {
        deletedAt?: number | undefined;
        macAddress?: string | undefined;
        name: string;
        lastModified: number;
        uuid: string;
        dateAdded: number;
        lastConnected: number;
    }[];
}, Promise<{
    inserted: number;
    updated: number;
    skipped: number;
}>>;
