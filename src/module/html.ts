import { HTML_CANVASID } from 'const';
import {  } from 'module/terminal'

/** Populate the html content page with the correct  */
function initHtmlContentPlayer(): HTMLCanvasElement {

}

function initHtmlCallbacks(canvas: HTMLCanvasElement) {

}

export class KeyboardManager { // use for getting keyboard input

}

export class HtmlContentManager { // use for putting output to screen
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = initHtmlContentPlayer();
  }

  openColor(color: string): void {}

  closeColor(color: string): void {}
}

export class MetaContentManager { // use for any browser-side notifications

}