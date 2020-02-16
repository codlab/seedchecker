import { EventEmitter2 } from "eventemitter2";

export default class DarkMode extends EventEmitter2 {
  static instance = new DarkMode();

  setDarkMode(state) {
    this.state = state;
    this.emit("dark_mode", state);
  }
}