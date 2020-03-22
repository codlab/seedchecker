import cors from 'cors';
import SocketIO from "socket.io";
import config from "./configs/server.js";
import express from "express";
import body_parser from "body-parser";
import Socket from "./server/socket";
import path from "path";

import {Server} from "http";
import fs = require('fs');


import https from "https";
import Arduino from './server/arduino.js';

export default class ApiServer {

  app?: any;
  server?: Server;

  start() {
    if(this.app) {
      console.log("server already listening");
      return false;
    }
    const build_folder = path.join(__dirname, '../../front/build'); //with the inclusion of the Arduino descriptor, need "for now" to add ../..
    const pub: any = (req: any, res: any) => res.status(200).sendFile(path.join(build_folder, 'index.html'));

    this.app = express();

    this.app
    .use(cors())
    .use(express.static(build_folder))
    .use(body_parser.json())
    .use("/arduino", new Arduino().router)
    .get("/index", pub )
    .get("/bots", pub);

    const { key, cert, ca } = config;

    if(key && cert && ca) {
      this.server = https.createServer({
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert),
        ca: fs.readFileSync(ca)
      }, this.app);
    } else {
      this.server = new Server(this.app);
    }
    
    const io = SocketIO.listen(this.server);
    Socket.instance.setIo(io);
  
    this.server.listen(7777);
  
    return true;
  }
}
