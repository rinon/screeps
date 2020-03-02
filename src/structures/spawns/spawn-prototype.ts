import {CreepSpawnData} from "../../creeps/creep-spawn-data";

const getNextCreepToSpawn = function(): CreepSpawnData {
    return null;
};


declare global {
    interface StructureSpawn {
        getNextCreepToSpawn();
        init:boolean;
    }
}

export class SpawnPrototype {
    static init() {
        if (!StructureSpawn['init']) {
            StructureSpawn.prototype.getNextCreepToSpawn = getNextCreepToSpawn;
            StructureSpawn.prototype.init = true;
        }
    }
}