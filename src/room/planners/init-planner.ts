import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";
import {CreepBodyBuilder} from "../../creeps/creep-body-builder";
import {PlannerInterface} from "./planner-interface";
import {Transport} from "../../creeps/roles/transport";
import * as _ from "lodash";

export class InitPlanner implements PlannerInterface {
    private room: Room;
    private creepsAssigned = false;

    constructor(room: Room) {
        this.room = room;
    }

    reassignCreeps() {
        if (this.creepsAssigned) {
            return;
        }
        const spawnersNeedingEnergy = this.room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s['store'] && (s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_EXTENSION) && s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
            }});
        if (spawnersNeedingEnergy.length > 0) {
            let transportReassigned = false;
            _.forEach(this.room.find(FIND_MY_CREEPS), (creep: Creep) => {
                if (!transportReassigned && creep.memory &&
                        (!creep.memory['role'] || creep.memory['role'] === Upgrader.KEY)) {
                    creep.memory['role'] = Transport.KEY;
                    delete creep.memory['action'];
                    delete creep.memory['target'];
                    transportReassigned = true;
                }
            });
        } else if (this.room.getNumberOfCreepsByRole(Transport.KEY) > 0) {
            _.forEach(this.room.find(FIND_MY_CREEPS), (creep: Creep) => {
                if (!creep.memory || (!creep.memory['role'] || creep.memory['role'] === Transport.KEY)) {
                    creep.memory['role'] = Upgrader.KEY;
                    delete creep.memory['action'];
                    delete creep.memory['target'];
                }
            });
            this.room.creepCountArray = null;
        }
    }

    getNextCreepToSpawn(): CreepSpawnData {
        this.reassignCreeps();

        if (this.room.getNumberOfCreepsByRole(Transport.KEY) < 1) {
            return CreepSpawnData.build(
                Transport.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 350)),
                0);
        } else if (this.room.getNumberOfCreepsByRole(Upgrader.KEY) + 1 < Math.max(2, this.room.getNumberOfMiningSpaces())) {
            return CreepSpawnData.build(
                Upgrader.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 600)),
                0);
        }
        return null;
    }
}
