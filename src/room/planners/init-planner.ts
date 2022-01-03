import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";
import {CreepBodyBuilder} from "../../creeps/creep-body-builder";
import {RoomPlannerInterface} from "./room-planner-interface";
import {Transport} from "../../creeps/roles/transport";
import {CreepRoleEnum} from "../../creeps/roles/creep-role-enum";
import {Miner} from "../../creeps/roles/miner";
import {Builder} from "../../creeps/roles/builder";

export class InitPlanner implements RoomPlannerInterface {
    private room: Room;
    private creepsAssigned = false;

    constructor(room: Room) {
        this.room = room;
    }

    public getNextReassignRole() {
        const transports = this.room.getNumberOfCreepsByRole(Transport.KEY);
        const builders = this.room.getNumberOfCreepsByRole(Builder.KEY);
        const upgraders = this.room.getNumberOfCreepsByRole(Upgrader.KEY);
        // const spawnersNeedingEnergy = this.room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
        //         return s['store'] && (s.structureType === STRUCTURE_SPAWN ||
        //             s.structureType === STRUCTURE_EXTENSION) && s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
        //     }});
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES).length;
        if (transports < 1 && builders > 0) {
            return { newRole: CreepRoleEnum.TRANSPORT, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        }
        if (transports < 1 && upgraders > 0) {
            return { newRole: CreepRoleEnum.TRANSPORT, oldRole: CreepRoleEnum.UPGRADER, type: 'single'};
        }
        if (upgraders < 1 && builders > 0) {
            return { newRole: CreepRoleEnum.UPGRADER, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        }
        if (builders > transports && transports < 2) {
            return { newRole: CreepRoleEnum.TRANSPORT, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        }
        if (upgraders / 2 > builders && constructionSites > 0) {
            return { newRole: CreepRoleEnum.BUILDER, oldRole: CreepRoleEnum.UPGRADER, type: 'single'};
        }
        return null;
    }

    public reassignCreeps() {
        if (this.creepsAssigned) {
            return;
        }

        let i = 0;
        let nextReassignRole = this.getNextReassignRole();
        while (i < 2 && nextReassignRole) {
            i++;
            if (nextReassignRole.type == 'all') {
                this.room.reassignAllCreeps(nextReassignRole.newRole, (creep: Creep) => {
                    return creep.memory &&
                        (!creep.memory['role'] || creep.memory['role'] === nextReassignRole.oldRole);
                });
            } else {
                console.log('reassigning ' + nextReassignRole.oldRole + ' to ' + nextReassignRole.newRole);
                this.room.reassignSingleCreep(nextReassignRole.newRole, (creep: Creep) => {
                    return creep.memory &&
                        (!creep.memory['role'] || creep.memory['role'] === nextReassignRole.oldRole);
                });
            }
            nextReassignRole = this.getNextReassignRole();
        }
        this.creepsAssigned = true;
        console.log('Upgraders: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.UPGRADER) +
            ' Transport: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.TRANSPORT) +
            ' Miners: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.MINER) +
            ' Builders: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.BUILDER));
    }

    public getNextCreepToSpawn(): CreepSpawnData {
        const transports = this.room.getNumberOfCreepsByRole(Transport.KEY);
        const builders = this.room.getNumberOfCreepsByRole(Builder.KEY);
        const upgraders = this.room.getNumberOfCreepsByRole(Upgrader.KEY);
        const miners = this.room.getNumberOfCreepsByRole(Miner.KEY);
        const minerNearDeath = this.room.find(FIND_MY_CREEPS, {filter: (creep: Creep) => {
                return creep.memory && creep.memory['role'] == Miner.KEY && creep.ticksToLive < 200;
            }}).length > 0;

        if (transports < 1) {
            return CreepSpawnData.build(
                Transport.KEY,
                CreepBodyBuilder.buildTransport(Math.min(this.room.energyAvailable, 350)),
                0);
        } else if (upgraders < 1) {
            return CreepSpawnData.build(
                Upgrader.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 600)),
                0);
        } else if (miners < 1) {
            return CreepSpawnData.build(
                Miner.KEY,
                CreepBodyBuilder.buildMiner(Math.min(this.room.energyAvailable, 750)),
                0);
        } else if (miners < Math.max(2, this.room.getNumberOfSources()) || (minerNearDeath
                && miners <= Math.max(2, this.room.getNumberOfSources()))) {
            return CreepSpawnData.build(
                Miner.KEY,
                CreepBodyBuilder.buildMiner(Math.min(this.room.energyAvailable, 750)),
                transports > 1 ? 1 : 0.5);
        } else if (transports < 3 || transports < builders + upgraders / 2) {
            return CreepSpawnData.build(
                Transport.KEY,
                CreepBodyBuilder.buildTransport(Math.min(this.room.energyAvailable, 350)),
                transports > 1 ? 1 : 0.4);
        } else if (upgraders + 1 < Math.max(2, this.room.getTotalNumberOfMiningSpaces()) && upgraders / 2 <= builders) {
            return CreepSpawnData.build(
                Upgrader.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 600)),
                1);
        } else if (builders < 8) {
            return CreepSpawnData.build(
                Builder.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 600)),
                1);
        }
        return null;
    }
}
