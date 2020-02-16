import { EventEmitter2 } from "eventemitter2";
import openSocket from 'socket.io-client';

export default class DuduMode extends EventEmitter2 {
  static instance = new DuduMode();

  constructor() {
    super();

    this.state = !!localStorage.getItem("dudu");
    this.results = [];
    this.updateSocket();
  }

  isDuduMode = () => !!this.state;

  setDuduMode(state) {
    this.state = state;
    this.emit("dudu", state);
    localStorage.setItem("dudu", state);
    this.updateSocket();
  }

  updateSocket() {
    if(this.state) {
      if(!this.socket) {
        this.socket = openSocket("/");
        this.socket.on('seed', object => this.onMessage(object));
      }
    } else {
      if(this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    }
  }

  onMessage(json) {
    try {
      const { seed, pokemon, trainer} = json;
      if(seed && pokemon && trainer) {
        this.results.push({ trainer, pokemon, seed });

        if(this.results.length > 10) {
          this.results.splice(0, 1);
        }

        this.emit("dudu_list", this.results);
      }
    } catch(e) {
      console.error(e);
    }
  }
}