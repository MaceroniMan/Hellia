
function splitList(old: string[]): [string[], string[]] {
    const newList: string[] = [];
    const refList: string[] = [];
    for (const item of old) {
        const addList = item.split(" ").map(x => x.toLowerCase());
        for (let p = 0; p < addList.length; p++) {
            refList.push(item);
        }
        newList.push(...addList);
    }
    return [newList, refList];
}

export function parse(command: string, player: any, npcs: string[]): [string, string | null] {
    command = command.toLowerCase().replace("?", "");
    const actionList = command.split(" ");

    let verb: string | null = null;
    let validSubjects: string[] = [];
    let refList: string[] = [];

    for (const word of actionList) {
        if (verb !== null) {
            if (validSubjects.includes(word)) {
                return [verb, refList[validSubjects.indexOf(word)]];
            }
        } else {
            if (word === "talk") {
                verb = "talk";
                validSubjects = [...npcs];
                if (validSubjects.length === 1) {
                    return ["talk", validSubjects[0]];
                } else {
                    [validSubjects, refList] = splitList(validSubjects);
                }

            } else if (["north", "east", "south", "west"].includes(word)) {
                return ["go", word];

            } else if (["go", "move", "walk", "run"].includes(word)) {
                verb = "go";
                validSubjects = ["north", "east", "south", "west"];
                refList = ["north", "east", "south", "west"];

            } else if (["inventory", "bag", "backpack"].includes(word)) {
                return ["inventory", null];

            } else if (["unlock", "open", "look", "inspect"].includes(word)) {
                return ["unlock", null];

            } else if (word === "store") {
                return ["store", null];

            } else if (["quest", "quests", "status"].includes(word)) {
                return ["quests", null];

            } else if (["travel", "stable", "stables"].includes(word)) {
                return ["stable", null];

            } else if (["exit", "quit", "leave"].includes(word)) {
                return ["EXT", null];
            }
        }
    }

    if (verb === null) {
        return ["NAC", null];
    } else {
        return [verb, null];
    }
}