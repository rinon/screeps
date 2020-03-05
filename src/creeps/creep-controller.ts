import * as _ from "lodash";

export class CreepController {
    constructor() {
        _.forEach(Game.creeps, (creep) => {
            if (!creep.spawning) {
                if (creep.memory['actionSwitched']) {
                    delete creep.memory['actionSwitched'];
                }
                creep.runAction();
            }
        });
    }
}
