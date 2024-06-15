import { InventoryItem } from 'module/loader'
import { roomId, flagId, questId } from 'interface'

export class Player {
    private savemanager: SaveGameManager;

    /** The current player name */
    public name: string;
    /** Their version of money */
    public stars: number;
    /** The total count of the moves */
    public moves: number;
    /** The current player location */
    public location: roomId;
    /** The map of all the flags */
    public flags: Map<flagId, number>;
    /** The inventory of all the items the player has on them */
    public inventory: InventoryItem[];
    /** A list of all the quests and the progrss on them
     * ```ts
     * "z1-main": 0
     * ```
     */
    public quests: Map<questId, number>;
    /** A list of all the places you can 'teleport' to */
    public stables: roomId[];
    /** A way to save what items have been dropped on the ground */
    public world: Map<roomId, InventoryItem[]>;
    /** A way to save the state of the containers in the world */
    public containers: Map<roomId, InventoryItem[]>;
    /** A list of all the current crafting recipies */
    public recipes: string[];

    constructor(savemanager: SaveGameManager) {
        // set default values
        this.name = "";
        this.stars = 0;
        this.moves = 0;
        this.location = "z1-docks";
        this.flags = new Map<flagId, number>();
        this.inventory = [];
        this.quests = new Map<questId, number>();
        this.stables = [];
        this.world = new Map<roomId, InventoryItem[]>();
        this.containers = new Map<roomId, InventoryItem[]>();
        this.recipes = [];

        this.savemanager = savemanager;
    }

    getMngr(): SaveGameManager {
        return this.savemanager;
    }
}

export class SaveGameManager {
    private playerObj: Player;

    constructor() {
        this.playerObj = new Player(this);
    }

    data(): Player {
        return this.playerObj;
    }

    save(): void {}

    load(): void {}
}