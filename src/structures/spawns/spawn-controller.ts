import {SpawnPrototype} from "./spawn-prototype";
import * as _ from "lodash";

export class SpawnController {
    static spawnCreeps(room:Room) {
        SpawnPrototype.init();
        _.forEach(room.find(FIND_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_SPAWN;}}),
            (spawn:StructureSpawn) => {
            spawn.spawnNextCreep();
        });
    }
}