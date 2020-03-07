import {Invasion} from "../invasion";
import {InvasionPlannerInterface} from "./invasion-planner-interface";
import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import * as _ from "lodash";
import {BorderPatrol} from "../../creeps/roles/border-patrol";
import {InvasionStageEnum} from "../invasion-stage-enum";

export class BorderPatrolPlanner implements InvasionPlannerInterface{
    private invasion: Invasion;

    constructor(invasion: Invasion) {
        this.invasion = invasion;
    }

    getNeededResponderCreeps(): Array<CreepSpawnData> {
        if (this.getCommittedResponders().length) {
            return [];
        }
        return [
            new CreepSpawnData([MOVE, RANGED_ATTACK],
                                BorderPatrol.KEY,
                                {memory: { role: BorderPatrol.KEY, invasion: this.invasion.name }},
                                0.25)
        ];
    }

    getCommittedResponders(): Array<Creep> {
        const committedCreeps = [];
        const cleanupInvalidCreepIdIndexes = [];
        const respondingCreeps = Memory['war']['invasions'][this.invasion.name]['respondingCreeps'];
        for (let i = 0; i < respondingCreeps.length; i++) {
            const respondingId = respondingCreeps[i];
            const respondingCreep = Game.getObjectById(respondingId);
            if (respondingCreep) {
                committedCreeps.push(respondingCreep);
            } else {
                cleanupInvalidCreepIdIndexes.push(respondingId);
            }
        }
        _.forEach(cleanupInvalidCreepIdIndexes, (creepIdIndex: number) => {
            delete Memory['war']['invasions'][this.invasion.name]['respondingCreeps'][creepIdIndex];
        });
        return committedCreeps;
    }

    getInvasionStage(): InvasionStageEnum {
        if (this.invasion.enemyCreeps.length) {
            if (this.getCommittedResponders().length) {
                return InvasionStageEnum.ENGAGING;
            } else if (this.invasion.spawningCreeps.length) {
                return InvasionStageEnum.REGROUPING;
            } else {
                return InvasionStageEnum.SPAWNING;
            }
        }
        if (Game.rooms[this.invasion.name]) {
            return InvasionStageEnum.PATROLLING;
        }
        return InvasionStageEnum.RECYCLE;
    }
}
