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

export default class ApiServer {

  app?: any;
  server?: Server;

  start() {
    if(this.app) {
      console.log("server already listening");
      return false;
    }
    this.app = express();
  
    this.app
    .use(cors())
    .use(express.static(path.join(__dirname, '../front/build')))
    .use(body_parser.json())
  
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
