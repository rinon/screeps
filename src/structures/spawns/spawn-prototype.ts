import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Invasion} from "../../war/invasion";
import {WarController} from "../../war/war-controller";

const spawnNextCreep = function() {
    if (this.spawning) {
        // this.room.displayMessage(this.pos, this.spawning.name);
        return;
    }

    let nextCreepToSpawn: CreepSpawnData = this.room.getPlanner().getNextCreepToSpawn();
    if (nextCreepToSpawn && nextCreepToSpawn.options &&
        nextCreepToSpawn.options['memory'] && nextCreepToSpawn.options['memory']['role']) {
        nextCreepToSpawn.options['memory']['homeRoom'] = this.room.name;
        // this.room.displayMessage(this.pos, nextCreepToSpawn.options['memory']['role']);
        if (nextCreepToSpawn.getEnergyRequired() <= this.room.energyAvailable &&
            (nextCreepToSpawn.getEnergyRequired() + 100 < this.room.energyAvailable ||
                this.room.energyAvailable / this.room.energyCapacityAvailable > nextCreepToSpawn.minPercentCapacity)) {
            const spawnResponse = this.spawnCreep(nextCreepToSpawn.bodyArray, nextCreepToSpawn.name, nextCreepToSpawn.options);

            if (spawnResponse === OK && nextCreepToSpawn.options.memory && nextCreepToSpawn.options.memory['invasion']) {
                const invasionName = nextCreepToSpawn.options.memory['invasion'];
                if (WarController.invasions[invasionName]) {
                    WarController.invasions[invasionName].addSpawningCreep(this.spawning.name);
                }
            }
        }
    }
};


declare global {
    interface StructureSpawn {
        spawnNextCreep();
        init:boolean;
    }
}

export class SpawnPrototype {
    static init() {
        if (!StructureSpawn['init']) {
            StructureSpawn.prototype.spawnNextCreep = spawnNextCreep;
            StructureSpawn.prototype.init = true;
        }
    }
}
