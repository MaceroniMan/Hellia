import * as SaveMngr from 'module/savegame';
import * as HtmlMngr from 'module/html'

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