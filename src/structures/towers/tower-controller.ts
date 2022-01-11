import * as _ from "lodash";
import {CreepRoleEnum} from "../../creeps/roles/creep-role-enum";

export class TowerController {
    static run(room:Room) {
        let engagedTowers = 0;
        _.forEach(room.find(FIND_MY_STRUCTURES, {filter: (structure:Structure) => {return structure.structureType === STRUCTURE_TOWER;}}),
            (tower:StructureTower) => {
                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestHostile && (engagedTowers < 1 || !TowerController.isOnEdge(closestHostile.pos))) {
                    let attackMessage = tower.attack(closestHostile);
                    if (attackMessage === OK) {
                        engagedTowers += 1;
                    }
                    return;
                }
                let damagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (c:Creep) => {
                        return c.hits < c.hitsMax;
                    }});
                if (damagedCreep) {
                    tower.heal(damagedCreep);
                    return;
                }
                let sources:number = 0;
                if (tower.room.memory['sources'] && tower.room.memory['sources']) {
                    _.forEach(tower.room.memory['sources']['sources'], (source:number, id:string) => {
                        sources++;
                    })
                } else {
                    sources = tower.room.find(FIND_SOURCES_ACTIVE).length;
                }
                if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 750 &&
                        tower.room.controller.level > 2 &&
                        tower.room.getNumberOfCreepsByRole(CreepRoleEnum.BUILDER) > 0 &&
                        tower.room.getNumberOfCreepsByRole(CreepRoleEnum.UPGRADER) > sources &&
                        tower.room.getNumberOfCreepsByRole(CreepRoleEnum.TRANSPORT) > 2 * sources &&
                        tower.room.energyAvailable > 0.6 * tower.room.energyCapacityAvailable &&
                        tower.room.getNumberOfCreepsByRole(CreepRoleEnum.MINER) >= sources) {
                    let damagedStructure = _.sortBy(tower.room.find(FIND_STRUCTURES, {filter: (s: Structure) => {
                            return s.hits / s.hitsMax < 0.75 && s.hits < 150000;
                        }}), (s:Structure) => { return s.hits; });
                    if (damagedStructure && damagedStructure.length > 0) {
                        tower.repair(damagedStructure[0]);
                        return;
                    }
                }
            });
    }

    static isOnEdge(pos:RoomPosition):boolean {
        return pos.x < 3 || pos.x > 47 || pos.y < 3 || pos.y > 47;
    }
}