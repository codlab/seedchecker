import { EventEmitter2 } from "eventemitter2";

export default class DuduMode extends EventEmitter2 {
  static instance = new DuduMode();

  constructor() {
    super();

    this.state = !!localStorage.getItem("dudu");
    this.results = [];
  }

  isDuduMode = () => !!this.state;

  setDuduMode(state) {
    this.state = state;
    this.emit("dudu", state);
    localStorage.setItem("dudu", state);
  }

  onMessage(message) {
    try {
      const json = JSON.parse(message);
      const { type, content } = (json||{});
      if(0 == type && content && content.length > 0) {
        const lines = content.split(":\n");
        if(lines.length == 2) {
          const ot_pokemon = lines[0].split(" (");
          const trainer = ot_pokemon[0];
          const pokemon = "(" + ot_pokemon[1];
          const seed = lines[1].split(" ")[1];

          this.results.push({ trainer, pokemon, seed });

          if(this.results.length > 10) {
            this.results.splice(0, 1);
          }

          this.emit("dudu_list", this.results);
        }
      }
    } catch(e) {
      console.error(e);
    }
  }
}