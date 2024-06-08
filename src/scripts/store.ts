import * as Menu from 'module/menu';
import * as Utils from 'core/utils';
import * as Game from 'core/game';
import { InventoryItem } from 'module/savegame'
import { EXIT_KEYS } from 'const';

interface StoreDict {
    price_multiplier: number;
    items: string[];
}

function storeMenu(storedict: StoreDict, game: Game.Game): void {
    game.tm.clear();

    let done = false;
    const buyback: string[] = [];

    while (!done) {
        let maxinvlength = 9;
        for (const i of game.player.inventory) {
            const nme = game.items[i.id].name;
            if (nme.length > maxinvlength) {
                maxinvlength = nme.length;
            }
        }

        let maxstolength = 5;
        for (const i of storedict.items) {
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

        const maxlength = Math.max(storedict.items.length, game.player.inventory.length, buyback.length) + 1;

        printstring += `| ${" ".repeat(maxinvlength)} | ${" ".repeat(maxstolength)} | ${" ".repeat(maxbuylength)} |\n`;

        for (let i = 0; i < maxlength; i++) {
            if (i < game.player.inventory.length) {
                const extraspaces = maxinvlength - game.items[game.player.inventory[i].id].name.length;
                printstring += `| ${" ".repeat(extraspaces)}{inv>${game.player.inventory[i]}>${i}} |`;
                dislist_inv.push(game.items[game.player.inventory[i].id].name);
                reglist_inv.push(`inv>${game.player.inventory[i]}>${i}`);
            } else {
                printstring += `| ${" ".repeat(maxinvlength)} |`;
            }

            if (i < storedict.items.length) {
                const extraspaces = maxstolength - game.items[storedict.items[i]].name.length;
                printstring += ` ${" ".repeat(extraspaces)}{sto>${storedict.items[i]}>${i}} |`;
                dislist_sto.push(game.items[storedict.items[i]].name);
                reglist_sto.push(`sto>${storedict.items[i]}>${i}`);
            } else {
                printstring += ` ${" ".repeat(maxstolength)} |`;
            }

            if (i < buyback.length) {
                const extraspaces = maxbuylength - game.items[buyback[i]].name.length;
                printstring += ` ${" ".repeat(extraspaces)}{buy>${buyback[i]}>${i}} |`;
                dislist_buy.push(game.items[buyback[i]].name);
                reglist_buy.push(`buy>${buyback[i]}>${i}`);
            } else {
                printstring += ` ${" ".repeat(maxbuylength)} |`;
            }

            printstring += `\n`;
        }

        printstring += `+-${"-".repeat(maxinvlength)}-+-${"-".repeat(maxstolength)}-+-${"-".repeat(maxbuylength)}-+\n`;

        const invMenu = new Menu.Menu(printstring, game.tm, [reglist_inv, reglist_sto, reglist_buy], [dislist_inv, dislist_sto, dislist_buy]);
        invMenu.find();

        game.tm.hidden_cursor(() => {
            while (invMenu.value === null) {
                console.log(game.tm.clear + invMenu.get());
                const keypress = game.tm.getchar();
                invMenu.registerkey(keypress);
            }
        });

        const item = invMenu.value.split(">");
        if (EXIT_KEYS.includes(invMenu.prev_key)) {
            done = true;
        } else {
            if (item[0] === "sto") {
                const stars = game.items[item[1]].value * storedict.price_multiplier;
                const pr_text = `Do you want to purchase a ${item[1]} for ${stars} stars?`;
                if (game.tm.prompt(pr_text)) {
                    if (stars > game.player.stars) {
                        console.log("You do not have enough stars!");
                    } else {
                        game.player.stars -= stars;
                        game.player.inventory.push(item[1]);
                        console.log(`You purchased a ${item[1]} for ${stars} stars`);
                    }
                }
            } else if (item[0] === "inv") {
                const stars = game.items[item[1]].value;
                const pr_text = `Do you want to sell a ${item[1]} for ${stars} stars?`;
                if (game.tm.prompt(pr_text)) {
                    console.log(`You sold a ${item[1]} for ${stars} stars`);
                    game.player.stars += stars;
                    const index = game.player.inventory.indexOf(item[1]);
                    if (index > -1) {
                        game.player.inventory.splice(index, 1);
                    }
                    buyback.push(item[1]);
                }
            } else if (item[0] === "buy") {
                const stars = game.items[item[1]].value;
                const pr_text = `Do you want to purchase a ${item[1]} for ${stars} stars?`;
                if (game.tm.prompt(pr_text)) {
                    if (stars > game.player.stars) {
                        console.log("You do not have enough stars!");
                    } else {
                        game.player.stars -= stars;
                        game.player.inventory.push(item[1]);
                        const index = buyback.indexOf(item[1]);
                        if (index > -1) {
                            buyback.splice(index, 1);
                        }
                        console.log(`You purchased a ${item[1]} for ${stars} stars`);
                    }
                }
            }
        }
    }
}
