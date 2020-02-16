import WebSocket from 'ws';
import {Server, Socket} from "socket.io";

export default class DuduSocket {
    io?: Server;
    ws: WebSocket;

    static instance: DuduSocket = new DuduSocket();

    private constructor() {
        this.ws = new WebSocket('ws://116.202.105.91:8080/');
        this.initWS();
    }

    private initWS() {
        this.ws.onclose = ev => setTimeout(() => this.restart(), 3000);
        this.ws.onerror = () => this.ws.close();
        this.ws.onmessage = ({data}) => this.onMessage(data.toString());
    }

    private restart() {
        this.ws = new WebSocket('ws://116.202.105.91:8080/');
        this.initWS();
    }

    setIo(io: Server) {
        this.io = io;
        this.io.sockets.on('connection', (socket) => {
            this.onConnection(socket);
        });

        this._onSeed = this._onSeed.bind(this);
    }

    private onConnection(socket: Socket) {

        //TODO add filter for user
        console.log("client logged in");

    }

    private  _onSeed(seed: string, trainer: string, pokemon: string) {
        this.io && this.io.emit("seed", {seed, trainer, pokemon});
    }


    private onMessage(message: string) {
        console.log("message", {message});
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

                    this._onSeed(seed, trainer, pokemon);
                }
            }
        } catch(e) {
            console.error(e);
        }
    }

}