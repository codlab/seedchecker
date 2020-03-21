import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import mkdir from "mkdir-promise";
import copy from "recursive-copy";

export default class Arduino {
    public router: Router;

    public constructor() {
        this.router = Router();

        this.router.post("/compile", (req, res) => {
            const uuid = uuidv4();
            const folder = `tmp/${uuid}/`;

            mkdir(folder)
            .then(() => copy("/usr/local/arduino/src", folder))
            .then(() => {
                res.json({finished: uuid});
            })
            .catch((err: Error) => {
                console.error(err);
                res.status(500).json({error: "Oops while compiling"});
            })
        });
    }
}