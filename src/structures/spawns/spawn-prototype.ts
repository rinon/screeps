import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {CreepRoleEnum} from "../../creeps/roles/creep-role-enum";

const spawnNextCreep = function() {
    if (this.spawning) {
        // this.room.displayMessage(this.pos, this.spawning.name);
        return;
    }

    let nextCreepToSpawn: CreepSpawnData = this.room.getPlanner(this.room).getNextCreepToSpawn();
    if (nextCreepToSpawn && nextCreepToSpawn.options &&
            nextCreepToSpawn.options['memory'] && nextCreepToSpawn.options['memory']['role']) {
        const creepEnum:CreepRoleEnum = CreepRoleEnum[nextCreepToSpawn.options.memory['role'].toUpperCase()];
        if (this.room.creepCountArray.has(creepEnum)) {
            this.room.creepCountArray.set(creepEnum, this.room.creepCountArray.get(creepEnum) + 1);
        } else {
            this.room.creepCountArray.set(creepEnum, 1);
        }
        nextCreepToSpawn.options['memory']['homeRoom'] = this.room.name;
        this.room.visual.text(nextCreepToSpawn.options['memory']['role'], this.pos.x+1, this.pos.y, {align: 'left'});
        if (nextCreepToSpawn.getEnergyRequired() <= this.room.energyAvailable &&
            (nextCreepToSpawn.getEnergyRequired() + 100 < this.room.energyAvailable ||
                this.room.energyAvailable / this.room.energyCapacityAvailable >= nextCreepToSpawn.minPercentCapacity)) {
            this.spawnCreep(nextCreepToSpawn.bodyArray, nextCreepToSpawn.name, nextCreepToSpawn.options);
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