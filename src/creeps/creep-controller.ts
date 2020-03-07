import * as _ from "lodash";
import { CreepPrototype } from "./creep-prototype";
import {WarController} from "../war/war-controller";
import {Invasion} from "../war/invasion";

export class CreepController {
    constructor() {
        CreepPrototype.init();
        _.forEach(Game.creeps, (creep: Creep) => {
            if (!creep.spawning) {
                if (creep.memory['actionSwitched']) {
                    delete creep.memory['actionSwitched'];
                }
                addCreepToInvasion(creep);
                creep.runAction();
            }
        });
    }
}

function addCreepToInvasion(creep: Creep) {
    if (creep.memory['invasion']) {
        const invasion: Invasion = WarController.invasions[creep.memory['invasion']];
        if (invasion && invasion.spawningCreeps.indexOf(creep.name) !== -1) {
            invasion.spawningCreeps.splice(invasion.spawningCreeps.indexOf(creep.name), 1);
            invasion.addCommittedResponder(creep.id);
        }
    }
}
