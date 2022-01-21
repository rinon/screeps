import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";
import {CreepBodyBuilder} from "../../creeps/creep-body-builder";
import {RoomPlannerInterface} from "./room-planner-interface";
import {Transport} from "../../creeps/roles/transport";
import {CreepRoleEnum} from "../../creeps/roles/creep-role-enum";
import {Miner} from "../../creeps/roles/miner";
import {Builder} from "../../creeps/roles/builder";
import * as _ from "lodash";
import {ConstructionSiteData} from "../../structures/construction/construction-site-data";
import {Planner} from "./planner";
import {Traveler} from "../../creeps/roles/traveler";
import {GrandStrategyPlanner} from "../../war/grand-strategy-planner";
import {Claimer} from "../../creeps/roles/claimer";

export class InitPlanner extends Planner implements RoomPlannerInterface {
    private room: Room;
    private creepsAssigned = false;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    public getNextReassignRole() {
        const travelers = this.room.getNumberOfCreepsByRole(Traveler.KEY);
        const transports = this.room.getNumberOfCreepsByRole(Transport.KEY);
        const builders = this.room.getNumberOfCreepsByRole(Builder.KEY);
        const upgraders = this.room.getNumberOfCreepsByRole(Upgrader.KEY);
        const miners = this.room.getNumberOfCreepsByRole(Miner.KEY);
        // const spawnersNeedingEnergy = this.room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => {
        //         return s['store'] && (s.structureType === STRUCTURE_SPAWN ||
        //             s.structureType === STRUCTURE_EXTENSION) && s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
        //     }});
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES).length;
        const spawns = this.room.find(FIND_MY_SPAWNS).length;
        if (spawns < 1 && upgraders < 1 && travelers > 0) {
            return { newRole: CreepRoleEnum.UPGRADER, oldRole: CreepRoleEnum.TRAVELER, type: 'single'};
        } else if (spawns < 1 && upgraders < 1 && builders > 0) {
            return { newRole: CreepRoleEnum.UPGRADER, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        } else if (spawns < 1 && upgraders < 1 && miners > 0) {
            return { newRole: CreepRoleEnum.UPGRADER, oldRole: CreepRoleEnum.MINER, type: 'single'};
        } else if (spawns < 1 && builders < 3 && travelers > 0) {
            return { newRole: CreepRoleEnum.BUILDER, oldRole: CreepRoleEnum.TRAVELER, type: 'single'};
        } else if (spawns < 1 && miners < 2 && travelers > 0) {
            return { newRole: CreepRoleEnum.MINER, oldRole: CreepRoleEnum.TRAVELER, type: 'single'};
        } else if (spawns < 1 && travelers > 0 && upgraders < 3) {
            return { newRole: CreepRoleEnum.UPGRADER, oldRole: CreepRoleEnum.TRAVELER, type: 'single'};
        }
        if (spawns > 0 && transports < 1 && builders > 0) {
            return { newRole: CreepRoleEnum.TRANSPORT, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        }
        if (spawns > 0 && transports < 1 && upgraders > 0) {
            return { newRole: CreepRoleEnum.TRANSPORT, oldRole: CreepRoleEnum.UPGRADER, type: 'single'};
        }
        if (upgraders < 1 && builders > 0 && this.room.controller.level < 8) {
            return { newRole: CreepRoleEnum.UPGRADER, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        }
        if (spawns > 0 && builders > transports && transports < 2) {
            return { newRole: CreepRoleEnum.TRANSPORT, oldRole: CreepRoleEnum.BUILDER, type: 'single'};
        }
        if (((upgraders / 2 > builders && constructionSites > 0) || builders < 1) && upgraders > 1) {
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
                console.log(this.room.name + ' init reassigning ' + nextReassignRole.oldRole + ' to ' + nextReassignRole.newRole);
                this.room.reassignSingleCreep(nextReassignRole.newRole, (creep: Creep) => {
                    return creep.memory &&
                        (!creep.memory['role'] || creep.memory['role'] === nextReassignRole.oldRole);
                });
            }
            nextReassignRole = this.getNextReassignRole();
        }
        this.creepsAssigned = true;
    }

    public getNextCreepToSpawn(): CreepSpawnData {
        const transports = this.room.getNumberOfCreepsByRole(Transport.KEY);
        const travelers = this.room.getNumberOfCreepsByRole(Traveler.KEY);
        const builders = this.room.getNumberOfCreepsByRole(Builder.KEY);
        const upgraders = this.room.getNumberOfCreepsByRole(Upgrader.KEY);
        const miners = this.room.getNumberOfCreepsByRole(Miner.KEY);
        // const spawns = this.room.find(FIND_MY_SPAWNS).length;
        const minerNearDeath = this.room.find(FIND_MY_CREEPS, {filter: (creep: Creep) => {
                return creep.memory && creep.memory['role'] == Miner.KEY && creep.ticksToLive < 170;
            }}).length > 0;
        const hasContainers: boolean = this.room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
                return s.structureType == STRUCTURE_CONTAINER;
            }}).length > 0;
        let sources:number = 0;
        if (this.room.memory['sources'] && this.room.memory['sources']) {
            _.forEach(this.room.memory['sources']['sources'], (source:number, id:string) => {
                sources++;
            })
        } else {
            sources = this.room.find(FIND_SOURCES_ACTIVE).length;
        }

        // if (spawns > 1) {
        //     console.log('room: ' + this.room.name + ' Upgraders: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.UPGRADER) +
        //         ' Transport: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.TRANSPORT) +
        //         ' Miners: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.MINER) +
        //         ' Builders: ' + this.room.getNumberOfCreepsByRole(CreepRoleEnum.BUILDER) +
        //         ' Sources: ' + sources);
        // }
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES).length;

        if (transports < 1) {
            return CreepSpawnData.build(
                Transport.KEY,
                hasContainers ? CreepBodyBuilder.buildTransport(Math.min(this.room.energyAvailable, 350)) :
                    CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 350)),
                0);
        } else if (upgraders < 1) {
            return CreepSpawnData.build(
                Upgrader.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 600)),
                0);
        } else if (miners < 1 && hasContainers) {
            return CreepSpawnData.build(
                Miner.KEY,
                CreepBodyBuilder.buildMiner(Math.min(this.room.energyAvailable, 750)),
                0);
        } else if (hasContainers && (miners < sources || (minerNearDeath && miners <= sources))) {
            return CreepSpawnData.build(
                Miner.KEY,
                CreepBodyBuilder.buildMiner(Math.min(this.room.energyAvailable, 750)),
                transports > 1 ? 1 : 0.5);
        } else if (hasContainers && (transports < 3 || (transports < builders + upgraders / 2 && transports < 4 * sources) ||
                (constructionSites < 1 && transports < 3 * sources + 1))) {
            return CreepSpawnData.build(
                Transport.KEY,
                CreepBodyBuilder.buildTransport(Math.min(this.room.energyAvailable, 700)),
                transports > 1 ? 1 : 0.4);
        } else if (upgraders + 1 < Math.max(2, this.room.getTotalNumberOfMiningSpaces()) && upgraders / 2 <= builders
                && this.room.controller.level < 8) {
            return CreepSpawnData.build(
                Upgrader.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 900)),
                1);
        } else if (builders < 3 * sources && constructionSites > 0) {
            return CreepSpawnData.build(
                Builder.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 900)),
                1);
        } else if (GrandStrategyPlanner.canClaimAnyRoom()) { // TODO only build 1 for the room
            return CreepSpawnData.build(
                Claimer.KEY,
                CreepBodyBuilder.buildClaimer(), 0.5);
        } else if (this.room.energyAvailable > 600 && travelers < 2) {
            return CreepSpawnData.build(
                Traveler.KEY,
                CreepBodyBuilder.buildBasicWorker(Math.min(this.room.energyAvailable, 450)),
                1);
        }
        return null;
    }

    public buildMemory() {
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

        if (!this.room.memory['exits'] || Object.keys(this.room.memory['exits']).indexOf("" + FIND_EXIT_TOP) === -1) {
            if (!this.room.memory['exits']) {
                this.room.memory['exits'] = {};
            }
            this.room.memory['exits'][FIND_EXIT_TOP] = findExitAndPlanWalls(FIND_EXIT_TOP, this.room);
            return;
        }
        if (Object.keys(this.room.memory['exits']).indexOf("" + FIND_EXIT_BOTTOM) === -1) {
            this.room.memory['exits'][FIND_EXIT_BOTTOM] = findExitAndPlanWalls(FIND_EXIT_BOTTOM, this.room);
            return;
        }
        if (Object.keys(this.room.memory['exits']).indexOf("" + FIND_EXIT_LEFT) === -1) {
            this.room.memory['exits'][FIND_EXIT_LEFT] = findExitAndPlanWalls(FIND_EXIT_LEFT, this.room);
            return;
        }
        if (Object.keys(this.room.memory['exits']).indexOf("" + FIND_EXIT_RIGHT) === -1) {
            this.room.memory['exits'][FIND_EXIT_RIGHT] = findExitAndPlanWalls(FIND_EXIT_RIGHT, this.room);
            return;
        }

        if (!this.room.controller || (!this.room.controller.reservation && !this.room.controller.my)) {
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

        if (!this.room.memory[STRUCTURE_TOWER + 'Structure'] && this.room.memory['center'] && this.room.controller && this.room.controller.my) {
            planBuildings(this.room, STRUCTURE_TOWER);
            return;
        }
        if (!this.room.memory[STRUCTURE_STORAGE + 'Structure'] && this.room.memory['center'] && this.room.controller && this.room.controller.my) {
            planBuildings(this.room, STRUCTURE_STORAGE);
            return;
        }
        if (!this.room.memory[STRUCTURE_SPAWN + 'Structure'] && this.room.memory['center'] && this.room.controller && this.room.controller.my) {
            planBuildings(this.room, STRUCTURE_SPAWN);
            return;
        }
        if (!this.room.memory[STRUCTURE_POWER_SPAWN + 'Structure'] && this.room.memory['center'] && this.room.controller && this.room.controller.my) {
            planBuildings(this.room, STRUCTURE_POWER_SPAWN);
            return;
        }
        if (!this.room.memory[STRUCTURE_TERMINAL + 'Structure'] && this.room.memory['center'] && this.room.controller && this.room.controller.my) {
            planBuildings(this.room, STRUCTURE_TERMINAL);
            return;
        }

        if (!this.room.memory['sourceRoads']) {
            let pointsOfImportance:Array<any> = this.room.find(FIND_SOURCES);
            pointsOfImportance.push(this.room.controller);

            _.forEach(pointsOfImportance, (origin:RoomObject) => {
                _.forEach(pointsOfImportance, (destination:RoomObject) => {
                    if (!origin || !destination || origin === destination) {
                        return;
                    }
                    let path:Array<PathStep> = origin.pos.findPathTo(destination.pos.x, destination.pos.y,
                        {ignoreCreeps: true, costCallback: getPlannedCostMatrix(this.room)});
                    planRoadAlongPath(this.room, path);
                });
            });

            this.room.memory['sourceRoads'] = true;
            return;
        }

        if (!this.room.memory['exitRoads'] && this.room.memory['center']) {
            let directions:Array<ExitConstant> = [ FIND_EXIT_TOP, FIND_EXIT_LEFT, FIND_EXIT_BOTTOM, FIND_EXIT_RIGHT ];
            _.forEach(directions, (direction:ExitConstant) => {
                let startPosition:RoomPosition = this.room.getPositionAt(25, 25);
                let exitPoint:RoomPosition = startPosition.findClosestByPath(direction);
                if (exitPoint) {
                    let path:Array<PathStep> = startPosition.findPathTo(exitPoint.x, exitPoint.y,
                        {ignoreCreeps: true, costCallback: getPlannedCostMatrix(this.room)});
                    planRoadAlongPath(this.room, path);
                }
            });
            this.room.memory['exitRoads'] = true;
            return;
        }

        // TODO break this up into multiple ticks?
        if (!this.room.memory[STRUCTURE_EXTENSION + 'Structure'] && this.room.memory['center'] && this.room.controller && this.room.controller.my) {
            planBuildings(this.room, STRUCTURE_EXTENSION);
            return;
        }

        // this.room.memory['complete'] = true;
    };

}

function findExitAndPlanWalls(exit:ExitConstant, room:Room):boolean {
    if (!room.memory['sites2']) {
        room.memory['sites2'] = {};
    }
    if (!room.memory['sites']) {
        room.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
    }
    if (!room.memory['sites'][2]) {
        room.memory['sites'][2] = {};
    }
    let exitExists = false;
    let x = -1;
    let y = -1;
    let isX = false;
    let exits = [];
    let exitSize = 0;
    for (let dynamicCoord=2; dynamicCoord<49; dynamicCoord++) {
        if (exit === FIND_EXIT_TOP) {
            y = 2;
            x = dynamicCoord;
            isX = true;
        } else if (exit === FIND_EXIT_BOTTOM) {
            y = 47;
            x = dynamicCoord;
            isX = true;
        } else if (exit === FIND_EXIT_RIGHT) {
            x = 47;
            y = dynamicCoord;
        } else if (exit === FIND_EXIT_LEFT) {
            x = 2;
            y = dynamicCoord;
        }
        let isRampart = false;
        let spotHasNoWall = false;
        if (isX) {
            let newY = y === 2 ? 0 : 49;
            spotHasNoWall = _.filter(room.lookAt(x, newY), (c:LookAtResultWithPos) => {
                if (c.type === 'structure' && c.structure.structureType !== STRUCTURE_RAMPART &&
                    c.structure.structureType !== STRUCTURE_WALL) {
                    isRampart = true;
                }
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
        } else {
            let newX = x === 2 ? 0 : 49;
            spotHasNoWall = _.filter(room.lookAt(newX, y), (c:LookAtResultWithPos) => {
                if (c.type === 'structure' && c.structure.structureType !== STRUCTURE_RAMPART &&
                    c.structure.structureType !== STRUCTURE_WALL) {
                    isRampart = true;
                }
                return c.type === 'terrain' && c.terrain === 'wall';
            }).length < 1;
        }
        if (spotHasNoWall) {
            if (exitSize === 0) {
                if (isX) {
                    if (room.isSpotOpen(new RoomPosition(x - 1, y, room.name))) {
                        room.memory['sites'][2][(x - 1) + ":" + y] = STRUCTURE_WALL;
                    }
                    if (room.isSpotOpen(new RoomPosition(x - 1, y, room.name))) {
                        room.memory['sites'][2][(x - 2) + ":" + y] = STRUCTURE_WALL;
                    }
                    let newY = y === 2 ? 1 : 48;
                    if (room.isSpotOpen(new RoomPosition(x - 1, newY, room.name))) {
                        room.memory['sites'][2][(x - 2) + ":" + newY] = STRUCTURE_WALL;
                    }
                } else {
                    if (room.isSpotOpen(new RoomPosition(x, y - 1, room.name))) {
                        room.memory['sites'][2][x + ":" + (y - 1)] = STRUCTURE_WALL;
                    }
                    if (room.isSpotOpen(new RoomPosition(x, y - 1, room.name))) {
                        room.memory['sites'][2][x + ":" + (y - 2)] = STRUCTURE_WALL;
                    }
                    let newX = x === 2 ? 1 : 48;
                    if (room.isSpotOpen(new RoomPosition(newX, y - 1, room.name))) {
                        room.memory['sites'][2][newX + ":" + (y - 2)] = STRUCTURE_WALL;
                    }
                }
            }
            exitSize += 1;
            if (isRampart) {
                room.memory['sites2'][x + ":" + y] = STRUCTURE_RAMPART;
            } else {
                room.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
            }
        } else if (exitSize) {
            if (isX) {
                if (room.isSpotOpen(new RoomPosition(x, y, room.name))) {
                    room.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
                }
                if (room.isSpotOpen(new RoomPosition(x + 1, y, room.name))) {
                    room.memory['sites'][2][(x + 1) + ":" + y] = STRUCTURE_WALL;
                }
                let newY = y === 2 ? 1 : 48;
                if (room.isSpotOpen(new RoomPosition(x + 1, newY, room.name))) {
                    room.memory['sites'][2][(x + 1) + ":" + newY] = STRUCTURE_WALL;
                }
            } else {
                if (room.isSpotOpen(new RoomPosition(x, y, room.name))) {
                    room.memory['sites'][2][x + ":" + y] = STRUCTURE_WALL;
                }
                if (room.isSpotOpen(new RoomPosition(x, y + 1, room.name))) {
                    room.memory['sites'][2][x + ":" + (y + 1)] = STRUCTURE_WALL;
                }
                let newX = x === 2 ? 1 : 48;
                if (room.isSpotOpen(new RoomPosition(newX, y + 1, room.name))) {
                    room.memory['sites'][2][newX + ":" + (y + 1)] = STRUCTURE_WALL;
                }
            }
            exits.push(dynamicCoord - Math.round(exitSize / 2));
            exitSize = 0;
        }
        exitExists = exitExists || spotHasNoWall;
    }

    // TODO check if exit works or if needs to shift
    for (let exitIndex = 0; exitIndex < exits.length; exitIndex++) {
        if (isX) {
            delete room.memory['sites'][2][(exits[exitIndex] - 1) + ":" + y];
            delete room.memory['sites'][2][exits[exitIndex] + ":" + y];
            delete room.memory['sites'][2][(exits[exitIndex] + 1) + ":" + y];
            room.memory['sites2'][(exits[exitIndex] - 1) + ":" + y] = STRUCTURE_RAMPART;
            room.memory['sites2'][exits[exitIndex] + ":" + y] = STRUCTURE_RAMPART;
            room.memory['sites2'][(exits[exitIndex] + 1) + ":" + y] = STRUCTURE_RAMPART;
        } else {
            delete room.memory['sites'][2][x + ":" + (exits[exitIndex] - 1)];
            delete room.memory['sites'][2][x + ":" + exits[exitIndex]];
            delete room.memory['sites'][2][x + ":" + (exits[exitIndex] + 1)];
            room.memory['sites2'][x + ":" + (exits[exitIndex] - 1)] = STRUCTURE_RAMPART;
            room.memory['sites2'][x + ":" + exits[exitIndex]] = STRUCTURE_RAMPART;
            room.memory['sites2'][x + ":" + (exits[exitIndex] + 1)] = STRUCTURE_RAMPART;
        }
    }
    return exitExists;
}

function getPlannedCostMatrix(room:Room) {
    return (roomName:string, costMatrix:CostMatrix):CostMatrix => {
        if (roomName == room.name) {
            for (let i = 0; i < 9; i++) {
                _.forEach(room.memory['sites'][i], (value, key) => {
                    if (value !== STRUCTURE_ROAD) {
                        costMatrix.set(+key.split(":")[0], +key.split(":")[1], 256);
                    }
                });
            }
        }
        return costMatrix;
    }
}

function planRoadAlongPath(room:Room, path:Array<PathStep>) {
    if (path != null && path.length > 0) {
        _.forEach(path, (pathStep:PathStep) => {
            if (pathStep.x !== 0 && pathStep.y !== 0 &&
                pathStep.x !== 49 && pathStep.y !== 49 &&
                !Planner.hasPlannedStructureAt(new RoomPosition(pathStep.x, pathStep.y, room.name), true)) {
                room.memory['sites'][0][pathStep.x + ":" + pathStep.y] = STRUCTURE_ROAD;
            }
        });
    }
}

function loopFromCenter(room:Room, x:number, y:number, size:number, callback:Function) {
    let d = 3;
    let c = 0;
    let s = 1;

    for (let k=1;k<=(size - 1); k++) {
        for (let j=0; j < (k<(size-1) ? 2 : 3); j++) {
            for (let i=0; i<s; i++) {
                if (callback(x, y)) {
                    return;
                }

                c++;
                switch (d) {
                    case 0: y = y+1; break;
                    case 1: x = x+1; break;
                    case 2: y = y-1; break;
                    case 3: x = x-1; break;
                }
            }
            d = (d+1)%4;
        }
        s = s+1;
    }
    callback(x, y);
}

function getPositionPlusShapeBuffer(room:Room, type:StructureConstant):ConstructionSiteData {
    let center:RoomPosition = room.memory['center'];
    if (!room.memory['loopCenter']) {
        room.memory['loopCenter'] = {};
    }
    let size:number = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
    let siteFound:ConstructionSiteData = null;
    loopFromCenter(room, center.x, center.y, size, (currentX:number, currentY:number) => {
        if (room.memory['loopCenter'][currentX + ":" + currentY]) {
            return false;
        }
        room.memory['loopCenter'][currentX + ":" + currentY] = true;
        let positionOk = true;
        let currentPlannedPosition:RoomPosition = new RoomPosition(currentX, currentY, room.name);
        if (Planner.hasPlannedStructureAt(currentPlannedPosition, false) || _.filter(room.lookAt(currentX, currentY), (c) => {
            return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
            positionOk = false;
        }
        if (positionOk) {
            const topPosition = new RoomPosition(currentX, currentY+1, room.name);
            const topPosOk = !Planner.hasPlannedStructureAt(topPosition, true) && room.isSpotOpen(topPosition);
            const bottomPosition = new RoomPosition(currentX, currentY-1, room.name);
            const bottomPosOk = !Planner.hasPlannedStructureAt(bottomPosition, true) && room.isSpotOpen(bottomPosition);
            const rightPosition = new RoomPosition(currentX+1, currentY, room.name);
            const rightPosOk = !Planner.hasPlannedStructureAt(rightPosition, true) && room.isSpotOpen(rightPosition);
            const leftPosition = new RoomPosition(currentX-1, currentY, room.name);
            const leftPosOk = !Planner.hasPlannedStructureAt(leftPosition, true) && room.isSpotOpen(leftPosition);
            positionOk = topPosOk && bottomPosOk && leftPosOk && rightPosOk;
        }
        if (positionOk) {
            siteFound = new ConstructionSiteData(new RoomPosition(currentX, currentY, room.name), type);
            return true;
        }
        return false;
    });
    return siteFound;
}

function getPositionWithBuffer(room:Room, buffer:number, type:StructureConstant):ConstructionSiteData {
    let center:RoomPosition = room.memory['center'];
    if (!room.memory['loopCenter']) {
        room.memory['loopCenter'] = {};
    }
    let size:number = 38 - 2 * Math.max(Math.abs(center.x - 25), Math.abs(center.y - 25));
    let siteFound:ConstructionSiteData = null;
    loopFromCenter(room, center.x, center.y, size, (currentX:number, currentY:number) => {
        if (room.memory['loopCenter'][currentX + ":" + currentY]) {
            return false;
        }
        room.memory['loopCenter'][currentX + ":" + currentY] = true;
        let positionOk = true;
        let currentPlannedPosition:RoomPosition = new RoomPosition(currentX, currentY, room.name);
        if (Planner.hasPlannedStructureAt(currentPlannedPosition, false) || _.filter(room.lookAt(currentX, currentY), (c) => {
            return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
            positionOk = false;
        }
        if (buffer > 0 && positionOk) {
            loopFromCenter(room, currentX, currentY, 1 + 2 * buffer, (bufferX:number, bufferY:number) => {
                let currentBufferPosition:RoomPosition = new RoomPosition(bufferX, bufferY, room.name);
                if (Planner.hasPlannedStructureAt(currentBufferPosition, true) || _.filter(room.lookAt(bufferX, bufferY),(c:LookAtResultWithPos) => {
                    return c.type === 'structure' && c.structure.structureType !== STRUCTURE_ROAD; }).length) {
                    positionOk = false;
                    return true;
                }
                return false;
            });
        }
        if (positionOk) {
            siteFound = new ConstructionSiteData(new RoomPosition(currentX, currentY, room.name), type);
            return true;
        }
        return false;
    });
    return siteFound;
}

function planBuildings(room:Room, structureType:StructureConstant) {
    let alreadyPlaced:Array<Structure> = room.find(FIND_STRUCTURES, {filter: (s:Structure) => {
            return s.structureType === structureType;
        }});
    let numberAlreadyPlanned = 0;
    _.forEach(alreadyPlaced, (s:Structure) => {
        for (let i = 0; i < 9; i++) {
            if (numberAlreadyPlanned < CONTROLLER_STRUCTURES[structureType][i]) {
                numberAlreadyPlanned++;
                room.memory['sites'][i][s.pos.x + ":" + s.pos.y] = structureType;
                if (structureType === STRUCTURE_SPAWN || structureType === STRUCTURE_STORAGE ||
                    structureType === STRUCTURE_TOWER || structureType === STRUCTURE_LINK ||
                    structureType === STRUCTURE_TERMINAL || structureType === STRUCTURE_LAB) {
                    room.memory['sites2'][s.pos.x + ":" + s.pos.y] = STRUCTURE_RAMPART;
                }
                return;
            }
        }
    });
    let numberPlaced = alreadyPlaced.length;
    for (let i = 0; i < 9; i++) {
        while (numberPlaced < CONTROLLER_STRUCTURES[structureType][i]) {
            numberPlaced++;
            let constructionSiteData:ConstructionSiteData = null;
            if (structureType == STRUCTURE_EXTENSION) {
                constructionSiteData = getPositionPlusShapeBuffer(room, structureType);
            } else {
                constructionSiteData = getPositionWithBuffer(room, 1, structureType);
            }
            if (constructionSiteData) {
                room.memory['sites'][i][constructionSiteData.pos.x + ":" + constructionSiteData.pos.y] = structureType;
            }
        }
    }
    room.memory[structureType + 'Structure'] = true;
}
