import * as _ from "lodash";

export class SpawnController {
    static spawnCreeps(room:Room) {
        _.forEach(room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {
            return structure.structureType === STRUCTURE_SPAWN;}}),
            (spawn:StructureSpawn) => {
            spawn.spawnNextCreep();
        });
    }
}
