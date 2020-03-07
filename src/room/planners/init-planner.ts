import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";
import {Invasion} from "../../war/invasion";
import {InvasionStageEnum} from "../../war/invasion-stage-enum";

export class InitPlanner {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    reassignCreeps() {
        // TODO reassign creeps to different roles (especially idle ones)
    }

    getNextCreepToSpawn(): CreepSpawnData {
        const invasion: Invasion = this.room.getInvasion();
        if (invasion && invasion.getInvasionPlanner().getInvasionStage() === InvasionStageEnum.SPAWNING) {
            const neededResponderCreeps: Array<CreepSpawnData> = invasion.getInvasionPlanner().getNeededResponderCreeps();
            if (neededResponderCreeps.length) {
                return neededResponderCreeps[0];
            }
        }
        return CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(this.room.energyAvailable, 600)), 0);
    }
}
