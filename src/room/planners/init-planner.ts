import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";

export class InitPlanner {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    reassignCreeps() {
        // TODO reassign creeps to different roles (especially idle ones)
    }

    getNextCreepToSpawn(): CreepSpawnData {
        return CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(this.room.energyAvailable, 600)), 0);
    }
}