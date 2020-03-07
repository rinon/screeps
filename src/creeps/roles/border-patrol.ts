import {WaitAction} from "../actions/wait";
import {TravelingAction} from "../actions/traveling";
import {MoveAction} from "../actions/move";
import {Invasion} from "../../war/invasion";
import {InvasionStageEnum} from "../../war/invasion-stage-enum";

export class BorderPatrol {
    static KEY = 'border-patrol';
    static setAction(creep: Creep) {
        if (!creep.memory['invasion']) {
            BorderPatrol.returnToBaseForRecycling(creep);
            return;
        }
        const invasion: Invasion = Memory['war']['invasions'][creep.memory['invasion']];
        if (!invasion || invasion.getInvasionPlanner().getInvasionStage() === InvasionStageEnum.RECYCLE) {
            BorderPatrol.returnToBaseForRecycling(creep);
            return;
        }

        if (creep.room.name !== invasion.name) {
            TravelingAction.setAction(creep, new RoomPosition(25, 25, invasion.name));
            creep.runAction();
            return;
        }

        // TODO attack enemy creeps in the room from range
    }

    private static returnToBaseForRecycling(creep: Creep) {
        if (!creep.memory['homeRoom']) {
            WaitAction.setAction(creep);
            return;
        }
        if (creep.room.name === creep.memory['homeRoom']) {
            let closestSpawn: StructureSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_SPAWN;
                }}) as StructureSpawn;
            if (closestSpawn) {
                if (creep.pos.inRangeTo(closestSpawn.pos, 1)) {
                    closestSpawn.recycleCreep(creep);
                } else {
                    MoveAction.setActionTarget(creep, closestSpawn);
                }
            } else {
                WaitAction.setAction(creep);
            }
            creep.runAction();
            return;
        }
        TravelingAction.setAction(creep, new RoomPosition(25, 25, creep.memory['homeRoom']));
        creep.runAction();
    }
}
