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
                if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 750 &&
                        tower.room.energyAvailable > 0.6 * tower.room.energyCapacityAvailable &&
                        tower.room.getNumberOfCreepsByRole(CreepRoleEnum.MINER) >= Math.max(2, tower.room.getNumberOfSources())) {
                    let damagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s: Structure) => {
                            return s.hits / s.hitsMax < 0.75 && s.hits < 250000;
                        }});
                    if (damagedStructure) {
                        tower.repair(damagedStructure);
                        return;
                    }
                }
            });
    }

    static isOnEdge(pos:RoomPosition):boolean {
        return pos.x < 3 || pos.x > 47 || pos.y < 3 || pos.y > 47;
    }
}