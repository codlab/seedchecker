import { Router } from "express";
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

        this.router.post("/compile", (req, res) => {
            const uuid = uuidv4();
            const folder = `${__dirname}/tmp/${uuid}/`;

            mkdir(folder)
            .then(() => copy("/usr/local/arduino/src", folder))
            .then(() => exec("/bin/bash", ["-c", `cd ${folder}/ ; make all`] ))
            .then((result: Result) => {
                console.log("result", {result});
                res.json({finished: uuid});
            })
            .catch((err: Error) => {
                console.error(err);
                res.status(500).json({error: "Oops while compiling"});
            })
        });
    }
}