import * as Menu from 'module/menu';
import * as CmdParser from 'core/cmdparser';
import * as Utils from 'core/utils';
import * as SaveMngr from 'module/savegame';
import * as Term from 'module/terminal';
import * as Loader from 'module/loader'
import { ConditionalCheck } from 'interface';

import * as StoreScript from 'scripts/store';
import * as DialougeScript from 'scripts/dialouge';

interface GameConstructorParams {
    savemngr: SaveMngr.SaveGameManager;
    terminal: Term.Terminal;
    items: Loader.ItemDataWarehouse;
    npcmngr: Loader.NPCDataWarehouse;
    world: Loader.RoomDataWarehouse;
    quests: Loader.QuestDataWarehouse;
    containers: Loader.ContainerDataWarehouse;
}

export class Game {
    public savemngr: SaveMngr.SaveGameManager;
    public player: SaveMngr.Player;
    public tm: Term.Terminal;
    public items: Loader.ItemDataWarehouse;
    public npcmngr: Loader.NPCDataWarehouse;
    public world: Loader.RoomDataWarehouse;
    public quests: Loader.QuestDataWarehouse;
    public containers: Loader.ContainerDataWarehouse;

    /** A Shortcut for the current room, calculated at the start of each loop */
    public cr: Loader.RoomWorld;

    constructor({ savemngr, terminal, items, npcmngr, world, quests, containers }: GameConstructorParams) {
        this.savemngr = savemngr;
        this.player = this.savemngr.data();
        this.tm = terminal;
        this.items = items;
        this.npcmngr = npcmngr;
        this.world = world;
        this.quests = quests;
        this.containers = containers;
    }

    say(sayList: ConditionalCheck[]): void {
        for (let i of sayList) {
            if (Utils.parseCondition(i.condition, this.player)) {
                this.tm.typing(i.content, this.player);
                this.tm.wait();
                return;
            }
        }
    }

    unlockChest(): void {
        this.tm.clear();
        if (this.cr.container !== null && Utils.parseCondition(this.cr.container.condition, this.player)) {
            if (!(this.player.location in this.player.containers)) {
                this.say(this.cr.container.say);
                const container = this.containers[this.player.location];
                this.player.containers[this.player.location] = copy(container); // this will need to be fixed
            } else {
                this.tm.typing("The chest is already unlocked", this.player);
                this.tm.wait();
            }
            scripts.inventory(this);
        }
    }

    doStables(): void {
        if (this.player.stables.length === 0) {
            console.log("There are no stables to travel to yet");
            this.tm.wait();
            return;
        }

        const roomName = this.world[this.player.location].name;
        let menuString = ` Use ${roomName} Stables \n`;
        menuString += `==============${"=".repeat(roomName.length)}\n`;

        const regList: string[] = [];
        const disList: string[] = [];

        for (const stableLocation of this.player.stables) {
            if (stableLocation !== this.player.location) {
                menuString += `Travel to '{${stableLocation}}'\n`;
                regList.push(stableLocation);
                disList.push(this.world[stableLocation].name);
            } else {
                menuString += `Travel to '${this.world[stableLocation].name}' ${this.tm.green()}(HERE)\n${this.tm.reset()}`;
            }
        }

        const stableMenu = new Menu.Menu(menuString, this.tm, [regList], [disList]);
        stableMenu.find();

        this.tm.hideCursor()
        stableMenu.run({
            keyInput: this.tm.getChar,
            writeFunc: (content) => {
                this.tm.clear()
                console.log(content);
            },
            doExit: true
        })

        let [menuStatus, value, _] = stableMenu.finValue;

        if (menuStatus === Menu.StatusValue.Enter) {
            this.tm.clear();
            this.tm.typing(`Traveling to ${this.world[value].name}`, this.player, 0.3);
            this.player.location = value;
            return;
        }

        return;
    }

    seeQuests(): void {
        let doneQuests = "";
        let notQuests = "";

        if (Object.keys(this.player.quests).length > 0) {
            for (const qid in this.player.quests) {
                if (this.player.quests[qid] === this.quests[qid].points.length) {
                    doneQuests += Utils.wordWrap(
                        `${this.quests[qid].name}: ${Utils.replaceInStrings(this.quests[qid].done, this.player, this.tm)}\n\n`
                    );
                } else {
                    const replacedString = this.quests[qid].points[this.player.quests[qid]];
                    notQuests += Utils.wordWrap(
                        `${this.quests[qid].name}: ${Utils.replaceInStrings(replacedString, this.player, this.tm)}\n\n`
                    );
                }
            }
        } else {
            notQuests += "No quests yet, go explore!";
        }

        this.tm.clear();
        console.log(" Current Quests");
        console.log("================");
        console.log(notQuests, "", true);

        if (doneQuests !== "") {
            console.log("");
            console.log(" Completed Quests");
            console.log("===================");
            console.log(doneQuests, "", true);
        }

        this.tm.wait();
    }

    gameLoop(): void {
        this.tm.clear();
        this.cr = this.world.getRoom(this.player.location);
        [this.player.location];

        const currentNPCs = Utils.getNPCs(this);

        this.player.moves += 1;

        this.savemngr.save();

        if (this.cr.introtext.length > 0) {
            this.say(this.cr.introtext);
        }

        if (this.cr.do.length > 0) {
            for (const action of this.cr.do) {
                if (Utils.parseCondition(action.condition, this.player)) {
                    Utils.parseDo(action.content, this.player);
                    break;
                }
            }
        }

        if (!(this.player.location in this.player.world)) {
            this.player.world[this.player.location] = [];
        }

        this.tm.clear();
        console.log(` ${this.cr.name}`);
        console.log("=".repeat(this.cr.name.length + 2) + "\n");

        let outText = "";
        outText += `${this.cr.desc.long}. `;

        if (this.cr.store !== null && Utils.parseCondition(this.cr.store.condition, this.player)) {
            outText += `${this.cr.store.desc}. `;
        }

        if (this.cr.stable !== null && !this.player.stables.includes(this.player.location)) {
            this.player.stables.push(this.player.location);
            outText += `${this.cr.stable}. `;
        }

        if (this.cr.container !== null) {
            outText += `${this.cr.container.desc}. `;
        }

        for (const a_npc in currentNPCs) {
            for (const obps of currentNPCs[a_npc][0].observation) {
                if (Utils.parseCondition(obps[0], this.player)) {
                    outText += `${obps[1]}. `;
                    break;
                }
            }
        }

        const groundItems = this.player.world[this.player.location];
        let preface = "";
        let postface = "";

        for (let gitem = 0; gitem < groundItems.length; gitem++) {
            if (gitem === 0) {
                preface = "A ";
            } else if (gitem === groundItems.length - 1) {
                preface = ", and a ";
            } else {
                preface = ", ";
            }

            if (gitem === groundItems.length - 1) {
                postface = " sits on the ground.";
            } else {
                postface = "";
            }

            outText += `${preface}${this.items[groundItems[gitem]].name}${postface}`;
        }

        const newOutText = Utils.wordWrap(Utils.replaceInStrings(outText, this.player, this.tm));
        console.log(newOutText + "\n");

        console.log("You can go:");

        for (const direction in this.cr.dirs) {
            const dir = this.cr.dirs[direction];
            console.log(`  ${direction.charAt(0).toUpperCase() + direction.slice(1)}: ${this.world[dir.dest].name} - ${this.world[dir.dest].desc.short}`);
        }

        console.log("");
        const userInput = this.tm.input(": ");
        const command = CmdParser.parse(userInput, this.player, currentNPCs);

        if (command[0] === "EXT") {
            this.tm.clear();
            if (this.tm.prompt("Are you sure you want to exit?")) {
                return;
            }
        } else if (command[0] === "NAC") {
            this.tm.typing("Unknown command", this.player);
            this.tm.wait();
        } else if (command[0] === "go") {
            if (command[1] in this.cr.dirs) {
                const dr = this.cr.dirs[command[1]];
                if (Utils.parseCondition(dr.condition, this.player)) {
                    this.say(dr.say);
                    Utils.parseDo(dr.do, this.player);
                    this.player.location = dr.dest;
                } else {
                    this.say(dr.say);
                }
            } else {
                this.tm.typing("You cannot go that way", this.player);
                this.tm.wait();
            }
        } else if (command[0] === "inventory") {
            scripts.inventory(this);
        } else if (command[0] === "unlock") {
            if (this.cr.container) {
                this.unlockChest();
            } else {
                this.tm.typing("There is nothing to open here", this.player);
                this.tm.wait();
            }
        } else if (command[0] === "talk") {
            if (!command[1]) {
                if (Object.keys(currentNPCs).length !== 0) {
                    this.tm.typing("Too many options to talk to, be more specific", this.player);
                    this.tm.wait();
                } else {
                    this.tm.typing("Who are you talking to?", this.player);
                    this.tm.wait();
                }
            } else {
                DialougeScript.dialogue(currentNPCs[command[1]], this);
            }
        } else if (command[0] === "quests") {
            this.seeQuests();
        } else if (command[0] === "stable") {
            this.doStables();
        } else if (command[0] === "store") {
            if (this.cr.store !== null && Utils.parseCondition(this.cr.store.condition, this.player)) {
                const storeDict = new StoreScript.ShopStorage(this.cr.store.multiplier, []);
                for (const i of this.cr.store.items) {
                    if (Utils.parseCondition(i.condition, this.player)) {
                        storeDict.items.push(this.npcmngr.makeNew(i.content));
                    }
                }
                StoreScript.storeMenu(storeDict, this);
            } else {
                this.tm.typing("The store seems to be closed", this.player);
                this.tm.wait();
            }
        }
    }
}
