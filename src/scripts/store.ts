import * as Menu from 'module/menu';
import * as Utils from 'core/utils';
import * as Game from 'core/game';
import { EXIT_KEYS } from 'const';
import { InventoryItem } from 'module/savegame';

interface ShopStorage {
    priceMultiplier: number;
    items: InventoryItem[];
}

function storeMenu(shopStorage: ShopStorage, game: Game.Game): void {
    game.tm.clear();

    let done = false;
    const buyback: InventoryItem[] = [];

    while (!done) {
        let maxinvlength = 9;
        for (const i of game.player.inventory) {
            const nme = game.items[i.id].name;
            if (nme.length > maxinvlength) {
                maxinvlength = nme.length;
            }
        }

        let maxstolength = 5;
        for (const i of shopStorage.items) {
            const nme = game.items[i].name;
            if (nme.length > maxstolength) {
                maxstolength = nme.length;
            }
        }

        let maxbuylength = 7;
        for (const i of buyback) {
            const nme = game.items[i].name;
            if (nme.length > maxbuylength) {
                maxbuylength = nme.length;
            }
        }

        const inventorytitleminus = maxinvlength - 9;
        const storetitleminus = maxstolength - 5;
        const buybacktitleminus = maxbuylength - 7;

        if (maxinvlength % 2 === 0) maxinvlength++;
        if (maxstolength % 2 === 0) maxstolength++;
        if (maxbuylength % 2 === 0) maxbuylength++;

        let printstring = `Stars: ${game.player.stars}\n\n`;

        const reglist_inv: string[] = [];
        const reglist_sto: string[] = [];
        const reglist_buy: string[] = [];

        const dislist_inv: string[] = [];
        const dislist_sto: string[] = [];
        const dislist_buy: string[] = [];

        printstring += `+-${"-".repeat(Math.ceil(inventorytitleminus / 2))}inventory${"-".repeat(Math.ceil(inventorytitleminus / 2))}-+`
                    + `-${"-".repeat(Math.ceil(storetitleminus / 2))}store${"-".repeat(Math.ceil(storetitleminus / 2))}-+`
                    + `-${"-".repeat(Math.ceil(buybacktitleminus / 2))}buyback${"-".repeat(Math.ceil(buybacktitleminus / 2))}-+\n`;

        const maxlength = Math.max(shopStorage.items.length, game.player.inventory.length, buyback.length) + 1;

        printstring += `| ${" ".repeat(maxinvlength)} | ${" ".repeat(maxstolength)} | ${" ".repeat(maxbuylength)} |\n`;

        for (let i = 0; i < maxlength; i++) {
            if (i < game.player.inventory.length) {
                const extraspaces = maxinvlength - game.items[game.player.inventory[i].id].name.length;
                printstring += `| ${" ".repeat(extraspaces)}{inv>${game.player.inventory[i].id}>${i}} |`;
                dislist_inv.push(game.items[game.player.inventory[i].id].name);
                reglist_inv.push(`inv>${game.player.inventory[i].id}>${i}`);
            } else {
                printstring += `| ${" ".repeat(maxinvlength)} |`;
            }

            if (i < shopStorage.items.length) {
                const extraspaces = maxstolength - game.items[shopStorage.items[i].id].name.length;
                printstring += ` ${" ".repeat(extraspaces)}{sto>${shopStorage.items[i].id}>${i}} |`;
                dislist_sto.push(game.items[shopStorage.items[i].id].name);
                reglist_sto.push(`sto>${shopStorage.items[i].id}>${i}`);
            } else {
                printstring += ` ${" ".repeat(maxstolength)} |`;
            }

            if (i < buyback.length) {
                const extraspaces = maxbuylength - game.items[buyback[i].id].name.length;
                printstring += ` ${" ".repeat(extraspaces)}{buy>${buyback[i].id}>${i}} |`;
                dislist_buy.push(game.items[buyback[i].id].name);
                reglist_buy.push(`buy>${buyback[i].id}>${i}`);
            } else {
                printstring += ` ${" ".repeat(maxbuylength)} |`;
            }

            printstring += `\n`;
        }

        printstring += `+-${"-".repeat(maxinvlength)}-+-${"-".repeat(maxstolength)}-+-${"-".repeat(maxbuylength)}-+\n`;

        const invMenu = new Menu.Menu(printstring, game.tm, [reglist_inv, reglist_sto, reglist_buy], [dislist_inv, dislist_sto, dislist_buy]);
        invMenu.find();

        let itemList: string[];

        game.tm.hideCursor()
        invMenu.run({
            keyInput: game.tm.getChar,
            writeFunc: (content) => {
                game.tm.clear()
                console.log(content);
            },
            doExit: true
        })

        let [menuStatus, value, _] = invMenu.finValue;
        let [section, itemId, listIdxStr] = value.split(">");

        let listIdx: number = Number(listIdxStr);

        if (menuStatus === Menu.StatusValue.Enter) {
            if (section === "sto") {
                let storeItem = shopStorage.items[itemId];

                const stars = game.items[itemList[1]].value * shopStorage.priceMultiplier;
                const pr_text = `Do you want to purchase a ${itemList[1]} for ${stars} stars?`;
                if (game.tm.prompt(pr_text)) {
                    if (stars > game.player.stars) {
                        console.log("You do not have enough stars!");
                    } else {
                        game.player.stars -= stars;
                        game.player.inventory.push(game.npcmngr.makeNew(storeItem));
                        console.log(`You purchased a ${itemList[1]} for ${stars} stars`);
                    }
                }
            } else if (section === "inv") {
                const stars = game.items[itemList[1]].value;
                const pr_text = `Do you want to sell a ${itemList[1]} for ${stars} stars?`;
                if (game.tm.prompt(pr_text)) {
                    console.log(`You sold a ${itemList[1]} for ${stars} stars`);
                    game.player.stars += stars;
                    const index = game.player.inventory.indexOf(itemList[1]);
                    if (index > -1) {
                        game.player.inventory.splice(index, 1);
                    }
                    buyback.push(itemList[1]);
                }
            } else if (section === "buy") {
                const stars = game.items[itemList[1]].value;
                const pr_text = `Do you want to purchase a ${itemList[1]} for ${stars} stars?`;
                if (game.tm.prompt(pr_text)) {
                    if (stars > game.player.stars) {
                        console.log("You do not have enough stars!");
                    } else {
                        game.player.stars -= stars;
                        game.player.inventory.push(itemList[1]);
                        const index = buyback.indexOf(itemList[1]);
                        if (index > -1) {
                            buyback.splice(index, 1);
                        }
                        console.log(`You purchased a ${itemList[1]} for ${stars} stars`);
                    }
                }
            }
        } else {
            done = true;
        }
    }
}
