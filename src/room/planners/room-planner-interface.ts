import {CreepSpawnData} from "../../creeps/creep-spawn-data";

export interface RoomPlannerInterface {
    reassignCreeps();
    getNextReassignRole();
    buildMemory();
    getNextCreepToSpawn():CreepSpawnData;
}
