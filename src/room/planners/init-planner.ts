import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";
import {CreepBodyBuilder} from "../../creeps/creep-body-builder";
import {RoomPlannerInterface} from "./room-planner-interface";
import {Transport} from "../../creeps/roles/transport";
import {CreepRoleEnum} from "../../creeps/roles/creep-role-enum";

export class InitPlanner implements RoomPlannerInterface {
    private room: Room;
    private creepsAssigned = false;

    constructor(room: Room) {
        this.room = room;
    }

    private reassignCreeps() {
        if (this.creepsAssigned) {
            return;
        }
        const spawnersNeedingEnergy = this.room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
                return s['store'] && (s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_EXTENSION) && s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
            }});
        if (spawnersNeedingEnergy.length > 0) {
            this.room.reassignSingleCreep(CreepRoleEnum.TRANSPORT, (creep: Creep) => {
                return creep.memory &&
                    (!creep.memory['role'] || creep.memory['role'] === Upgrader.KEY);
            });
        } else if (this.room.getNumberOfCreepsByRole(CreepRoleEnum.TRANSPORT) > 0) {
            this.room.reassignAllCreeps(CreepRoleEnum.UPGRADER, (creep: Creep) => {
                return !creep.memory || (!creep.memory['role'] || creep.memory['role'] === Transport.KEY);
            });
        }
    }

    public getNextCreepToSpawn(): CreepSpawnData {
        this.reassignCreeps();

        if (this.room.getNumberOfCreepsByRole(CreepRoleEnum.TRANSPORT) < 1) {
            return CreepSpawnData.build(
                Transport.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 350)),
                0);
        } else if (this.room.getNumberOfCreepsByRole(CreepRoleEnum.UPGRADER) + 1 < Math.max(2, this.room.getTotalNumberOfMiningSpaces())) {
            return CreepSpawnData.build(
                Upgrader.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 600)),
                0);
        }
        return null;
    }
}
