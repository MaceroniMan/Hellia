// The place for public interfaces or types

/** Contains the check string and the content related
 * ```ts
 * condition: string
 * content: string
 * ```
*/
export interface ConditionalCheck {
    condition: string;
    content: string;
}

/** NPC Name Identifier */
export type npcId = string;
/** NPC Interaction Reference Identifier */
export type npcIntId = string;
/** World Room Identifier */
export type roomId = string;
/** Item Identifier */
export type itemId = string;