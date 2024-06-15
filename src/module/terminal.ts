import * as SaveMngr from 'module/savegame';

class KeyboardManager { // use for getting keyboard input

}

class HtmlContentManager { // use for putting output to screen

  openColor(color: string): void {}

  closeColor(color: string): void {}
}

class MetaContentManager { // use for any browser-side notifications

}

export class TermKey {
  public value: string;
  public special: boolean;
  public code: string;
}

export class Terminal {
  private openColors: string[];

  green(text?: string): string {}
  blue(text?: string): string {}
  red(text?: string): string {}
  reset(): string {}

  wait(): void {}
  clear(): void {}
  hideCursor(): void {}

  getChar(): TermKey {}
  input(ptext?: string): string {}
  prompt(ptext: string): boolean {}

  typing(words: string, player: (SaveMngr.Player | null) = null, speed: number = .03, skip: boolean = true): void {}
}

/*

interface Screen {
    clear: string;
    typing(text: string, player: any, speed?: number): void;
    hide_cursor(): void;
    prompt(message: string): boolean;
    getchar(): string;
}

*/