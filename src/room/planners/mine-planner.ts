import {RoomPlannerInterface} from "./room-planner-interface";
import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import * as _ from "lodash";
import {Planner} from "./planner";
import {Builder} from "../../creeps/roles/builder";
import {Miner} from "../../creeps/roles/miner";
import {CreepRoleEnum} from "../../creeps/roles/creep-role-enum";
import {Traveler} from "../../creeps/roles/traveler";

export class MinePlanner extends Planner implements RoomPlannerInterface {
    private room: Room;
    private creepsAssigned = false;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    buildMemory() {
        if (this.room.memory['complete']) {
            return;
        }
        if (!this.room.memory['sites']) {
            if (!this.room.memory['sites']) {
                this.room.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
            }
            if (!this.room.memory['sites2']) {
                this.room.memory['sites2'] = {};
            }
            return;
        }
        if (this.room.find(FIND_MY_CREEPS).length < 1) {
            return;
        }
        if (!this.room.memory['sources']) {
            this.room.memory['sources'] = {};
            let sources = this.room.find(FIND_SOURCES);
            if (!Memory['roomData']) {
                Memory['roomData'] = {};
            }
            if (!Memory['roomData'][this.room.name]) {
                Memory['roomData'][this.room.name] = {};
            }
            Memory['roomData'][this.room.name]['sources'] = {
                qty: sources.length
            };
            let totalSourceSpots = 0;
            _.forEach(sources, (source:Source) => {
                let currentNumberOfSpots = this.room.getNumberOfMiningSpacesAtSource(source.id);
                totalSourceSpots += currentNumberOfSpots;
                this.room.memory['sources']['sources'][source.id] = currentNumberOfSpots;
            });
            Memory['roomData'][this.room.name]['sources']['spots'] = totalSourceSpots;
            return;
        }

        if (!this.room.memory['containerStructure']) {
            let sources = this.room.find(FIND_SOURCES);
            let containerLocationsNeeded = [];
            let linkNumber = 5;
            _.forEach(sources, (source:Source) => {
                this.placeContainerAndLink(source.pos, linkNumber);
                linkNumber++;
                containerLocationsNeeded.push(source);
            });
            if (this.room.controller) {
                containerLocationsNeeded.push(this.room.controller);
                this.placeContainerAndLink(this.room.controller.pos, 5);
            }
            this.room.memory['center'] = this.room.getPositionAt(25, 25);
            if (containerLocationsNeeded.length) {
                this.room.memory['center'] = this.getCenterOfArray(containerLocationsNeeded, this.room);
            }

            let minerals = this.room.find(FIND_MINERALS);
            if (minerals.length) {
                this.room.memory['sites'][6][minerals[0].pos.x + ":" + minerals[0].pos.y] = STRUCTURE_EXTRACTOR;
            }
            this.room.memory['containerStructure'] = true;
            return;
        }
    }

    getNextReassignRole() {
        const travelers = this.room.getNumberOfCreepsByRole(Traveler.KEY);
        if (travelers < 1) {
            return null;
        }
        const miners = this.room.getNumberOfCreepsByRole(Miner.KEY);
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES).length;
        const builders = this.room.getNumberOfCreepsByRole(Builder.KEY);
        const containers:Array<StructureContainer> = this.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {return s.structureType == STRUCTURE_CONTAINER;} });
        if ((builders < 2 && constructionSites > 0) || builders < 1) {
            return { newRole: CreepRoleEnum.BUILDER, oldRole: CreepRoleEnum.TRAVELER, type: 'single'};
        }
        if (miners < containers.length) {
            return { newRole: CreepRoleEnum.MINER, oldRole: CreepRoleEnum.TRAVELER, type: 'single'};
        }
        if (builders > 1 && constructionSites < 1) {
            return { newRole: CreepRoleEnum.TRAVELER, oldRole: CreepRoleEnum.BUILDER, type: 'all'};
        }
        let freeContainers = false;
        for (let container of containers) {
            if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                freeContainers = true;
                break;
            }
        }
        if (!freeContainers) {
            return { newRole: CreepRoleEnum.TRAVELER, oldRole: CreepRoleEnum.MINER, type: 'all'};
        }
        return null;
    }

    reassignCreeps() {
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
                console.log(this.room.name + ' mine reassigning ' + nextReassignRole.oldRole + ' to ' + nextReassignRole.newRole);
                this.room.reassignSingleCreep(nextReassignRole.newRole, (creep: Creep) => {
                    return creep.memory &&
                        (!creep.memory['role'] || creep.memory['role'] === nextReassignRole.oldRole);
                });
            }
            nextReassignRole = this.getNextReassignRole();
        }
        this.creepsAssigned = true;
    }

    getNextCreepToSpawn():CreepSpawnData {
        return null;
    }

}