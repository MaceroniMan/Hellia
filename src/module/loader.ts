import { ConditionalCheck, npcId, roomId, questId, itemId } from 'interface';

const base64_world: string = ``;
const base64_npc: string = ``;
const base64_container: string = ``;
const base64_quests: string = ``;
const base64_items: string = ``;

function b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

/* WORLD EXAMPLE
  "z1-docks": {
    "name": "Dockyard",
    "desc.long": "You are in a small dockyard with only two ships docked along the pier, there is also faint smell of salty sea air mixed with seaweed that drifts off the ocean",
    "desc.short": "A small dockyard",
    "do": [
      [
        "true",
        "set z1.start 1"
      ]
    ],
    "introtext": [
      [
        "not flag('z1.start')",
        "Welcome to Hurricane! Please sit back and enjoy the adventure."
      ]
    ],
    "container": {
      "condition": "true",
      "desc": "A barrel sits off to the side",
      "say": [
        [
          "true",
          "You pry off the cap to look inside"
        ]
      ]
    },
    "store": {
      "multiplier": 1,
      "desc": "A dusty store counter sits along the far wall",
      "condition": "quest('z1.campstore.unlock') == 1",
      "items": [
        [
          "true",
          "sweet-apple"
        ],
        [
          "true",
          "raw-potato"
        ]
      ]
    }
    "dirs": {
      "south": {
        "dest": "z1-boardwalk",
        "say": [
          [
            "not flag('z1.docks.south') and has('dagger')",
            "[@] used Dagger to cut through vines"
          ],
          [
            "not flag('z1.docks.south') and not has('dagger')",
            "There are some spiky vines blocking your way"
          ]
        ],
        "condition": "has('dagger') or flag('z1.docks.south')",
        "do": "set z1.docks.south 1"
      }
    }
  }
*/

export class QuestDataWarehouse {
  
}

export class ContainerDataWarehouse {

}

/** Represents a dialouge option picker
 * ```yaml
 * condition: string
 * goto: string
 * text: string
 * ```
*/
interface NpcDialougeOption {
  condition: string,
  goto: string,
  text: string
}

/** Represents a single line of dialouge
 * ```yaml
 * speaker: string
 * text: string
 * ```
*/
interface NpcDialougeLine {
  speaker: string,
  text: string
}

/** Represents a entire dialouge interaction
 * ```yaml
 * do: string
 * options: NpcDialougeOption[]
 * dialouge: NpcDialougeLine[]
 * ```
*/
interface NpcInteraction {
  do: string,
  options: NpcDialougeOption[],
  dialouge: NpcDialougeLine[]
}

class NpcRoomData {
  private interactions: Map<string, NpcInteraction>;

  public name: string;
  public conditions: ConditionalCheck[];
  public observation: ConditionalCheck[];

  getInteraction(interactionId: string): NpcInteraction {
    return this.interactions[interactionId];
  }
}

export class NPCDataWarehouse {
  private npcs: Map<string, Map<string, NpcRoomData>>;

  getNpc(npcId: string, roomId: string): NpcRoomData | null {
    if (this.npcs.has(npcId)) {
      if (this.npcs[npcId].has(roomId)) {
        return this.npcs[npcId][roomId];
      }
    }
    return null;
  }

  listNpc(roomId: string): string[] {
    let validNpcs: string[] = [];
    for (let npcId in Object.keys(this.npcs)) {
      if (this.npcs[npcId].has(roomId)) {
        validNpcs.push(npcId);
      }
    }
    return validNpcs;
  }

  loadData(data: any, progress: (c: number, max: number) => void): void {

  }
}

export class InventoryItem {
  public id: string;
  public current: number;
  public max: number;

  constructor(id: string, current: number, max: number) {
    this.id = id;
    this.current = current;
    this.max = max;
  }
}

interface ItemCraftData {
  items: string[],
  locations: string[]
}

interface ItemProperties {
  name: string,
  desc: string,
  value : number,
  recipes : ItemCraftData[] | null
}

export class ItemDataWarehouse {
  private items;

  makeNew(itemId: string): InventoryItem {

  }

  loadData(data: any, progress: (c: number, max: number) => void): void {

  }
}

interface RoomDescription {
  long: string;
  short: string;
}

interface RoomDirection {
  dest: roomId;
  say: ConditionalCheck[];
  condition: string;
  do: string;
}

interface RoomContainer {
  condition: string;
  desc: string;
  say: ConditionalCheck[];
}

interface RoomStore {
  multiplier: number;
  desc: string;
  condition: string;
  items: ConditionalCheck[]
}

export interface RoomWorld {
  name: string;
  desc: RoomDescription;
  do: ConditionalCheck[];
  introtext: ConditionalCheck[];
  dirs: Map<string, RoomDirection>;

  container: RoomContainer | null;
  stable: string | null;
  store: RoomStore | null;
}

export class RoomDataWarehouse {
  private rooms: Map<roomId, RoomWorld>;

  constructor() {

  }

  getRoom(roomId: roomId): RoomWorld {
    return this.rooms[roomId];
  }

  loadData(data: any, progress: (c: number, max: number) => void): void {
    for (var roomId in Object.keys(data)) {
      let room = data[roomId];

      let currentName: string = room["name"];
      let currentDesc: RoomDescription = { long: room["desc.long"], short: room["desc.short"] };

      let currentDo: ConditionalCheck[] = [];
      for (let conditionalList in room["do"]) {
        currentDo.push({
          condition: conditionalList[0],
          content: conditionalList[1]
        })
      }

      let currentIntrotext: ConditionalCheck[] = [];
      for (let conditionalList in room["introtext"]) {
        currentIntrotext.push({
          condition: conditionalList[0],
          content: conditionalList[1]
        })
      }

      console.log(`${roomId}: ${(data as { [key: string]: string })[roomId]}`);
    }
  }
}

const f = {
  "foo": {
    "container": {
      "condition": "true",
      "desc": "A barrel sits off to the side",
      "say": [
        [
          "true",
          "You pry off the cap to look inside"
        ]
      ]
    },
    "store": {
      "multiplier": 1,
      "desc": "A dusty store counter sits along the far wall",
      "condition": "quest('z1.campstore.unlock') == 1",
      "items": [
        [
          "true",
          "sweet-apple"
        ],
        [
          "true",
          "raw-potato"
        ]
      ]
    },
    "dirs": {
      "south": {
        "dest": "z1-boardwalk",
        "say": [
          [
            "not flag('z1.docks.south') and has('dagger')",
            "[@] used Dagger to cut through vines"
          ],
          [
            "not flag('z1.docks.south') and not has('dagger')",
            "There are some spiky vines blocking your way"
          ]
        ],
        "condition": "has('dagger') or flag('z1.docks.south')",
        "do": "set z1.docks.south 1"
      }
    }
  }
}