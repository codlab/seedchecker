import { Router, RequestHandler } from "express";
import { v4 as uuidv4 } from 'uuid';
import mkdir from "mkdir-promise";
import copy from "recursive-copy";
const { spawn } = require('child_process');

interface Result {
    output: string;
    code: number;
}

function exec(bin: string, args: string[]): Promise<Result> {
    return new Promise((resolve, reject) => {
        var output = "";
        const cmd = spawn(bin, args || []);
        cmd.stdout.on("data", (data: any) => output += data);
        cmd.stderr.on("data", (data: any) => output += data);

        cmd.on('close', (code: any) => {
            resolve({output, code});
        });
    });
}

export default class Arduino {
    public router: Router;

    public constructor() {
        this.router = Router();

        this.router.get("/compile", this.compile);
        this.router.post("/compile", this.compile);
    }

    compile:RequestHandler = (req, res) => {
        const uuid = uuidv4();
        const folder = `/tmp/${uuid}`;
        const result_folder = `${folder}/bots/auto_loto/`;
        const result_filter = `${folder}/bots/auto_loto/AutoLoto.hex`;

        mkdir(folder)
        .then(() => copy("/usr/local/arduino/src", folder))
        .then(() => exec("/bin/bash", ["-c", `cd ${result_folder}/ ; make`] ))
        .then((result: Result) => {
            console.log("result", {result});

            return new Promise((resolve, reject) => {
                res.sendFile(`${result_filter}`, (err: Error) => {
                    exec("/bin/rm", ["-rf", folder]).then(resolve).catch(reject);
                });
            });
        })
        .catch((err: Error) => {
            console.error(err);
            res.status(500).json({error: "Oops while compiling"});
        })
    };
}