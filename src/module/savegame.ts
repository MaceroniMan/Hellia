import { InventoryItem } from 'module/loader'

export class Player {
    private savemanager: SaveGameManager;

    public name: string; // the current player name
    public stars: number; // their version of money
    public moves: number; // the total count of the moves
    public location: string; // the current player location
    public flags: Map<string, number>; // game flags
    public inventory: InventoryItem[]; // the inventory of all the items the player has on them
    public quests: Map<string, number> // a list of all the quests and the progress on them ex. "z1-main": 0
    public stables: string[]; // a list of all the places you can 'teleport' to
    public world: Map<string, InventoryItem[]>; // a way to save what items have been dropped on the ground
    public containers: Map<string, InventoryItem[]>; // a way to save the state of the containers in the world
    public recipes: string[]; // a list of all the current crafting recipies

    constructor(savemanager: SaveGameManager) {
        // set default values
        this.name = "";
        this.stars = 0;
        this.moves = 0;
        this.location = "z1-docks";
        this.flags = new Map<string, number>();
        this.inventory = [];
        this.quests = new Map<string, number>();
        this.stables = [];
        this.world = new Map<string, InventoryItem[]>();
        this.containers = new Map<string, InventoryItem[]>();
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