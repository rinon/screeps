import {Respawn} from "./respawn";
import * as _ from "lodash";

const roleUpgrader = require('./roles/role.upgrader');
module.exports = {
    loop: function() {

        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        Respawn.run();

        _.forEach(Game.creeps, (creep) => {
            if(creep.memory['role'] === 'upgrader') {
                roleUpgrader.run(creep);
            }
        });
    }
};