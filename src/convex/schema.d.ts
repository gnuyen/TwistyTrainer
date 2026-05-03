declare const _default: import("convex/server").SchemaDefinition<{
    solves: import("convex/server").TableDefinition<import("convex/values").VObject<{
        time?: number | undefined;
        side?: string | undefined;
        sessionId?: string | undefined;
        recognitionTime?: number | undefined;
        executionTime?: number | undefined;
        deletedAt?: number | undefined;
        id: string;
        groupId: string;
        caseId: number;
        timestamp: number;
        auf: string;
        scrambleSelection: number;
        trainMode: string;
        tokenIdentifier: string;
    }, {
        id: import("convex/values").VString<string, "required">;
        groupId: import("convex/values").VString<string, "required">;
        caseId: import("convex/values").VFloat64<number, "required">;
        time: import("convex/values").VFloat64<number | undefined, "optional">;
        timestamp: import("convex/values").VFloat64<number, "required">;
        auf: import("convex/values").VString<string, "required">;
        side: import("convex/values").VString<string | undefined, "optional">;
        scrambleSelection: import("convex/values").VFloat64<number, "required">;
        sessionId: import("convex/values").VString<string | undefined, "optional">;
        recognitionTime: import("convex/values").VFloat64<number | undefined, "optional">;
        executionTime: import("convex/values").VFloat64<number | undefined, "optional">;
        trainMode: import("convex/values").VString<string, "required">;
        deletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        tokenIdentifier: import("convex/values").VString<string, "required">;
    }, "required", "id" | "groupId" | "caseId" | "time" | "timestamp" | "auf" | "side" | "scrambleSelection" | "sessionId" | "recognitionTime" | "executionTime" | "trainMode" | "deletedAt" | "tokenIdentifier">, {
        by_tokenIdentifier: ["tokenIdentifier", "_creationTime"];
        by_deletedAt: ["deletedAt", "_creationTime"];
    }, {}, {}>;
    sessions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        deletedAt?: number | undefined;
        favorite?: boolean | undefined;
        id: string;
        tokenIdentifier: string;
        name: string;
        settings: any;
        createdAt: number;
        lastPlayedAt: number;
        lastModified: number;
        archived: boolean;
    }, {
        id: import("convex/values").VString<string, "required">;
        name: import("convex/values").VString<string, "required">;
        settings: import("convex/values").VAny<any, "required", string>;
        createdAt: import("convex/values").VFloat64<number, "required">;
        lastPlayedAt: import("convex/values").VFloat64<number, "required">;
        lastModified: import("convex/values").VFloat64<number, "required">;
        archived: import("convex/values").VBoolean<boolean, "required">;
        deletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        favorite: import("convex/values").VBoolean<boolean | undefined, "optional">;
        tokenIdentifier: import("convex/values").VString<string, "required">;
    }, "required", "id" | "deletedAt" | "tokenIdentifier" | "name" | "settings" | "createdAt" | "lastPlayedAt" | "lastModified" | "archived" | "favorite" | `settings.${string}`>, {
        by_tokenIdentifier: ["tokenIdentifier", "_creationTime"];
        by_deletedAt: ["deletedAt", "_creationTime"];
    }, {}, {}>;
    caseStates: import("convex/server").TableDefinition<import("convex/values").VObject<{
        groupId: string;
        caseId: number;
        tokenIdentifier: string;
        lastModified: number;
        trainState: "unlearned" | "learning" | "finished";
        algorithmSelectionLeft: number | null;
        algorithmSelectionRight: number | null;
        customAlgorithmLeft: string;
        customAlgorithmRight: string;
        identicalAlgorithm: boolean;
    }, {
        groupId: import("convex/values").VString<string, "required">;
        caseId: import("convex/values").VFloat64<number, "required">;
        trainState: import("convex/values").VUnion<"unlearned" | "learning" | "finished", [import("convex/values").VLiteral<"unlearned", "required">, import("convex/values").VLiteral<"learning", "required">, import("convex/values").VLiteral<"finished", "required">], "required", never>;
        algorithmSelectionLeft: import("convex/values").VUnion<number | null, [import("convex/values").VFloat64<number, "required">, import("convex/values").VNull<null, "required">], "required", never>;
        algorithmSelectionRight: import("convex/values").VUnion<number | null, [import("convex/values").VFloat64<number, "required">, import("convex/values").VNull<null, "required">], "required", never>;
        customAlgorithmLeft: import("convex/values").VString<string, "required">;
        customAlgorithmRight: import("convex/values").VString<string, "required">;
        identicalAlgorithm: import("convex/values").VBoolean<boolean, "required">;
        lastModified: import("convex/values").VFloat64<number, "required">;
        tokenIdentifier: import("convex/values").VString<string, "required">;
    }, "required", "groupId" | "caseId" | "tokenIdentifier" | "lastModified" | "trainState" | "algorithmSelectionLeft" | "algorithmSelectionRight" | "customAlgorithmLeft" | "customAlgorithmRight" | "identicalAlgorithm">, {
        by_user: ["tokenIdentifier", "_creationTime"];
        by_user_group: ["tokenIdentifier", "groupId", "_creationTime"];
        by_user_case: ["tokenIdentifier", "groupId", "caseId", "_creationTime"];
    }, {}, {}>;
    savedCubes: import("convex/server").TableDefinition<import("convex/values").VObject<{
        deletedAt?: number | undefined;
        macAddress?: string | undefined;
        tokenIdentifier: string;
        name: string;
        lastModified: number;
        uuid: string;
        dateAdded: number;
        lastConnected: number;
    }, {
        uuid: import("convex/values").VString<string, "required">;
        name: import("convex/values").VString<string, "required">;
        macAddress: import("convex/values").VString<string | undefined, "optional">;
        dateAdded: import("convex/values").VFloat64<number, "required">;
        lastConnected: import("convex/values").VFloat64<number, "required">;
        lastModified: import("convex/values").VFloat64<number, "required">;
        deletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        tokenIdentifier: import("convex/values").VString<string, "required">;
    }, "required", "deletedAt" | "tokenIdentifier" | "name" | "lastModified" | "uuid" | "macAddress" | "dateAdded" | "lastConnected">, {
        by_tokenIdentifier: ["tokenIdentifier", "_creationTime"];
        by_deletedAt: ["deletedAt", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
