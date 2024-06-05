import { WIDTH } from 'const';
import * as Game from 'core/game';

export function wordWrap(text: string, checkChar: string = "", wrapChar: string = "\n"): string {
    let cnt = 0;
    let newOutText = "";

    for (const currChar of text) {
        if (currChar === checkChar) {
            newOutText += currChar;
            cnt = 0;
        } else if (cnt === WIDTH) {
            if (currChar === " ") {
                newOutText += wrapChar;
                cnt = 0;
            } else {
                newOutText += currChar;
            }
        } else {
            cnt += 1;
            newOutText += currChar;
        }
    }

    return newOutText;
}

export function replaceInStrings(text: string, player: any, screen: any): string {
    text = text.replace("[@]", player.name.title());
    text = text.replace("R{", screen.red);
    text = text.replace("B{", screen.blue);
    text = text.replace("G{", screen.green);
    text = text.replace("Y{", screen.yellow);
    text = text.replace("}", screen.normal);
    return text;
}

interface NPC {
    [key: string]: [any, string];
}

export function getNPCs(game: Game.Game): NPC {
    const returnNPCs: NPC = {};
    for (const npc in game.npcs) {
        let done = false;
        for (const room in game.npcs[npc]) {
            let roomValue: string | null = null;
            if (room === game.player.location) {
                roomValue = typeof game.npcs[npc][room] === 'string' ? game.npcs[npc][room] : room;
            }

            if (roomValue !== null) {
                for (const condition of game.npcs[npc][roomValue].conditions) {
                    if (parseCondition(condition[0], game.player)) {
                        returnNPCs[npc] = [game.npcs[npc][roomValue], condition[1]];
                        done = true;
                        break;
                    }
                }
            }

            if (done) {
                break;
            }
        }
    }
    return returnNPCs;
}

export function parseDo(string: string, player: any): string {
    let returnString = "NA";
    if (string === "") {
        return returnString;
    }
    const items = string.split("|");
    for (const item of items) {
        const currentItem = item.split(" ").filter(i => i !== '');
        switch (currentItem[0]) {
            case "give":
                player.inventory.push(currentItem[1]);
                break;
            case "set":
                player.flags[currentItem[1]] = currentItem[2];
                break;
            case "stars":
                player.stars += parseInt(currentItem[1]);
                break;
            case "quest":
                player.quests[currentItem[1]] = parseInt(currentItem[2]);
                returnString = currentItem[1];
                break;
            case "exit":
                return "EXT";
        }
    }
    return returnString;
}

export function randint(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function parseCondition(string: string, player: any): boolean {
    const flag = (x: string, y: string = "1"): boolean => {
        if (x in player.flags) {
            return String(player.flags[x]) === y;
        }
        return false;
    };

    const quest = (x: string): number => {
        if (x in player.quests) {
            return parseInt(player.quests[x]);
        }
        return -1;
    };

    const evalScope = {
        has: (x: string) => player.inventory.includes(x),
        flag: flag,
        random: (x: number) => randint(1, x) === 1,
        quest: quest,
        stars: player.stars
    };

    return evalInScope(string, evalScope);
}

// Utility function to safely evaluate code within a given scope
function evalInScope(expression: string, scope: any): boolean {
    return Function(`"use strict"; return (${expression})`).call(scope);
}