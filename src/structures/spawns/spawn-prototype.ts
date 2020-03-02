
const spawnNextCreep = function() {
    if (this.spawning) {
        this.room.displayMessage(this.pos, this.spawning.name);
        return;
    }

    let nextCreepToSpawn = this.room.getPlanner();
    if (nextCreepToSpawn && nextCreepToSpawn.options &&
        nextCreepToSpawn.options['memory'] && nextCreepToSpawn.options['memory']['role']) {
        nextCreepToSpawn.options['memory']['homeRoom'] = this.room.name;
        this.room.displayMessage(this.pos, nextCreepToSpawn.options['memory']['role']);
        if (nextCreepToSpawn.getEnergyRequired() <= this.room.energyAvailable &&
            (nextCreepToSpawn.getEnergyRequired() + 100 < this.room.energyAvailable ||
                this.room.energyAvailable / this.room.energyCapacityAvailable > nextCreepToSpawn.minPercentCapacity)) {
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