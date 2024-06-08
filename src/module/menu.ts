import * as Utils from 'core/utils';
import * as Term from 'module/terminal';
import { KEYMAP } from 'const';

export enum StatusValue {
  Exit,
  Select,
  Enter
}

interface RunFunctionParams {
  keyInput: () => Term.TermKey,
  writeFunc: (content: string) => void,
  doExit?: boolean,
  doSelect?: boolean
}

export class Menu {
  private menuString: string;
  private menuLayout: string[][];
  private displayLayout: string[][];
  private cords: [number, number];
  private screen: Term.Terminal;
  private status: StatusValue | null;
  private value: string;
  private niceValue: string;

  public finValue: [StatusValue, string, string];

  constructor(string: string, screen: Term.Terminal, layout: string[][], dslayout: string[][] | null = null) {
    this.menuString = string;
    this.menuLayout = layout;
    this.displayLayout = dslayout !== null ? dslayout : layout;
    this.cords = [0, 0];
    this.screen = screen;
    this.status = null
  }

  private isIn(x: number, y: number): boolean {
    try {
      if (x < 0 || y < 0 || this.menuLayout[x][y] === "") {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      if (e instanceof RangeError) {
        return false;
      }
      throw e;
    }
  }

  find(name: string | null = null): void {
    for (let x = 0; x < this.displayLayout.length; x++) {
      const column = this.displayLayout[x];
      for (let y = 0; y < column.length; y++) {
        const value = column[y];
        try {
          if (value !== "" && (value === name || name === null)) {
            this.cords = [x, y];
            return; // return on first entry
          }
        } catch (e) {
          if (e instanceof RangeError) {
            // do nothing
          } else {
            throw e;
          }
        }
      }
    }
  }

  up(): void {
    this.cords[1] -= 1;
    if (!this.isIn(this.cords[0], this.cords[1])) {
      this.cords[1] += 1;
    }
  }

  down(): void {
    this.cords[1] += 1;
    if (!this.isIn(this.cords[0], this.cords[1])) {
      this.cords[1] -= 1;
    }
  }

  left(): void {
    this.cords[0] -= 1;
    if (!this.isIn(this.cords[0], this.cords[1])) {
      this.cords[0] += 1;
    }
  }

  right(): void {
    this.cords[0] += 1;
    if (!this.isIn(this.cords[0], this.cords[1])) {
      this.cords[0] -= 1;
    }
  }

  done(): void {
    console.log("");
    this.value = this.menuLayout[this.cords[0]][this.cords[1]];
    this.niceValue = this.displayLayout[this.cords[0]][this.cords[1]];
  }

  registerKey(key: string): void {
    if (key in KEYMAP) {
      if (KEYMAP[key] === "up") {
        this.up();
      } else if (KEYMAP[key] === "down") {
        this.down();
      } else if (KEYMAP[key] === "left") {
        this.left();
      } else if (KEYMAP[key] === "right") {
        this.right();
      } else if (KEYMAP[key] === "enter") {
        this.done();
        this.status = StatusValue.Enter
      } else if (KEYMAP[key] === "exit") {
        this.done();
        this.status = StatusValue.Exit
      } else if (KEYMAP[key] === "select") {
        this.done();
        this.status = StatusValue.Select
      }
    }
  }

  run({ keyInput, writeFunc, doExit, doSelect }: RunFunctionParams): void {
    while (this.status === null) {
      let content = this.menuString;

      for (let x = 0; x < this.displayLayout.length; x++) {
        const column = this.displayLayout[x];
        for (let y = 0; y < column.length; y++) {
          const value = Utils.replaceInStrings(column[y], { "name": "" }, this.screen);
          const replaceValue = this.menuLayout[x][y];
          if (this.cords[0] === x && this.cords[1] === y) {
            content = content.replace(`{${replaceValue}}`, this.screen.onWhite + value + this.screen.normal);
          } else {
            content = content.replace(`{${replaceValue}}`, value);
          }
        }
      }
      writeFunc(content);

      let key = keyInput()
      this.registerKey(key.value);

      if (this.status === StatusValue.Exit) {
        if (doExit === null || doExit === false) {
          this.status = null;
        }
      } else if (this.status === StatusValue.Select) {
        if (doSelect === null || doSelect === false) {
          this.status = null;
        }
      }
    }

    this.finValue = [this.status, this.value, this.niceValue]
  }
}