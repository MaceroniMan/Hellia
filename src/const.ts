const VERSION = "v0.4.3"
const WIDTH = 70
const EXIT_KEYS = ["`", "KEY_ESCAPE"]
const ENTER_KEYS = ["KEY_ENTER"]
const SAVE_FOLDER_NAME = "saves"

const KEYMAP = {
    "KEY_W": "up",
    "KEY_S": "down",
    "KEY_A": "left",
    "KEY_D": "right",
  
    "KEY_UP": "up",
    "KEY_DOWN": "down",
    "KEY_LEFT": "left",
    "KEY_RIGHT": "right",
  
    "KEY_ENTER": "enter",
    "KEY_ESCAPE": "exit",
    "KEY_SPACE": "select"
  };

const HTML_CANVASID = "html_canvas";

export {VERSION, WIDTH, EXIT_KEYS, ENTER_KEYS, SAVE_FOLDER_NAME, KEYMAP, HTML_CANVASID}