import { EventEmitter2 } from "eventemitter2";

export default class DarkMode extends EventEmitter2 {
  static instance = new DarkMode();

  constructor() {
    super();

    this.state = !!localStorage.getItem('dark_mode');
  }

  setDarkMode(state) {
    this.state = state;
    this.emit("dark_mode", state);
    localStorage.setItem('dark_mode', state);
  }
}