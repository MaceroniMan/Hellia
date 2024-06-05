import * as Menu from 'module/menu';
import * as Utils from 'core/utils';

export function dialogue(npc: any, game: any): void {
    const dialogueDict = npc[0].dialogues;
    let talkLocation = npc[1];
    let startText = "";
    let prev: string[] | null = null;

    while (true) {
        console.log(game.scr.clear);

        if (!(talkLocation in dialogueDict)) {
            throw new Error(`${talkLocation} does not exist`);
        }

        const dialogueCurrent = dialogueDict[talkLocation];
        let beforeText = "";

        if (startText !== "") {
            beforeText += startText + "\n\n";
        }

        let dialogues;
        if (prev === null) {
            dialogues = dialogueCurrent.dialogue;
        } else {
            dialogues = [prev].concat(dialogueCurrent.dialogue);
        }

        prev = null;

        for (let personIndex = 0; personIndex < dialogues.length; personIndex++) {
            console.log(game.scr.clear);
            console.log(Utils.replaceInStrings(beforeText, game.player, game.scr), "", true);

            const person = dialogues[personIndex];
            const text = Utils.wordWrap(`  "${person[1].replace("`", '"`  "')}"`, "`", "\n   ");
            console.log(`${person[0]}: `, "\n", true);
            const doneSkip = game.scr.typing(text, game.player);

            if (doneSkip) {
                console.log(game.scr.clear);
                console.log(Utils.replaceInStrings(beforeText, game.player, game.scr), "", true);
                console.log(`${person[0]}: \n${Utils.replaceInStrings(text, game.player, game.scr).replace("`", "\n")}`, "", true);
            }

            beforeText += `${person[0]}: \n${text.replace("`", "\n")}\n\n`;

            if (personIndex + 1 !== dialogues.length) {
                prompt();
            }
        }

        const doExt = Utils.parseDo(dialogueCurrent.do, game.player);

        if (doExt === "EXT") {
            prompt();
            break;
        } else if (doExt !== "NA") {
            prompt();
            console.log(game.scr.clear);
            if (game.player.quests[doExt] === 0) {
                game.scr.typing(`Quest '${game.quests[doExt].name}' received`, game.player, 0.1);
            } else if (game.player.quests[doExt] === game.quests[doExt].points.length) {
                game.scr.typing(`Quest '${game.quests[doExt].name}' completed`, game.player, 0.1);
            } else {
                game.scr.typing(`Quest '${game.quests[doExt].name}' advanced`, game.player, 0.1);
            }
            game.scr.wait();
        }

        if (dialogueCurrent.options.length === 0) {
            prompt();
            break;
        } else {
            let optionString = "";
            let niceList: string[][] = [[]];
            let optionList: string[][] = [[]];

            for (const option of dialogueCurrent.options) {
                if (Utils.parseCondition(option[0], game.player)) {
                    optionString += `{${option[1].goto}$${option[1].text}}\n`;
                    niceList[0].push(option[1].text);
                    optionList[0].push(`${option[1].goto}$${option[1].text}`);
                }
            }

            beforeText = Utils.replaceInStrings(beforeText, game.player, game.scr).replace("`", "\n");
            const dialogueMenu = new Menu.Menu(beforeText + optionString, game.scr, optionList, niceList);

            game.scr.hideCursor()
            dialogueMenu.run({
                keyInput: game.scr.getChar,
                writeFunc: (content) => {
                    console.log(game.scr.clear + content);
                },
                onEnter: (value, niceValue) => {
                    talkLocation = value.split("$")[0];
                },
                onSelect: (value, niceValue) => {
                    prev = ["You", niceValue];
                }
            })
        }

        if (talkLocation === "exit") {
            break;
        }
    }
}