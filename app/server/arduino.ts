import { Router, RequestHandler } from "express";
import { v4 as uuidv4 } from 'uuid';
import mkdir from "mkdir-promise";
import copy from "recursive-copy";
import { actionFrom, ArduinoActionMake } from "./ArduinoAction";
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
        const todo: ArduinoActionMake|null = actionFrom(req);

        if(!todo) {
            res.status(500).json({error: "Invalid action"});
            return;
        }

        const uuid = uuidv4();

        const output_file = `${todo.name}.hex`;
        const compilation_folder = todo.folder;

        const folder = `/tmp/${uuid}`;
        const result_folder = `${folder}/bots/${compilation_folder}`;
        const result_filter = `${result_folder}/${output_file}`;

        mkdir(folder)
        .then(() => copy("/usr/local/arduino/src", folder))
        .then(() => exec("/bin/bash", ["-c", `cd ${result_folder}/ ; make`] ))
        .then((result: Result) => {
            console.log("result", {result});

            return new Promise((resolve, reject) => {
                res.setHeader('Content-Disposition', 'attachment; filename=' + output_file);
                res.setHeader('Content-Transfer-Encoding', 'binary');
                res.setHeader('Content-Type', 'application/octet-stream');

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