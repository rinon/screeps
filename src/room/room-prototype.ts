import * as _ from "lodash";
import { InitPlanner } from "./planners/init-planner";
import {ConstructionSiteData} from "../structures/construction-site-data";
import {TerrainUtil} from "../terrain/terrain-util";

function getNeighbors(source: Source): Array<RoomPosition> {
    let neighbors: Array<RoomPosition> = new Array();
    if (source.pos.y > 0) {
        if (source.pos.x > 0)
            neighbors.push(new RoomPosition(source.pos.x - 1, source.pos.y - 1, source.room.name));
        neighbors.push(new RoomPosition(source.pos.x, source.pos.y - 1, source.room.name));
        if (source.pos.x < 49)
            neighbors.push(new RoomPosition(source.pos.x + 1, source.pos.y - 1, source.room.name));
    }
    if (source.pos.x > 0)
        neighbors.push(new RoomPosition(source.pos.x - 1, source.pos.y, source.room.name));
    if (source.pos.x < 49)
        neighbors.push(new RoomPosition(source.pos.x + 1, source.pos.y, source.room.name));
    if (source.pos.y < 49) {
        if (source.pos.x > 0)
            neighbors.push(new RoomPosition(source.pos.x - 1, source.pos.y + 1, source.room.name));
        neighbors.push(new RoomPosition(source.pos.x, source.pos.y + 1, source.room.name));
        if (source.pos.x < 49)
            neighbors.push(new RoomPosition(source.pos.x + 1, source.pos.y + 1, source.room.name));
    }
    return neighbors;
}

const getPlanner = function() {
    // TODO write ways to determine what planner to send
    return new InitPlanner(this);
};

const findNextEnergySource = function(creep: Creep) {
    if (!this.memory['source_assignments']) {
        this.memory['source_assignments'] = {};
    }
    let assignments: Object = this.memory['source_assignments'];
    _.forEach(assignments, function(assignment: Object, source: String) {
        assignment = _.filter(assignment, function(creep_id: string) {
            let creep: Creep = Game.creeps[creep_id];
            return creep ? creep.memory['target'] == source : false;
        });
    });

    let sources = _.sortBy(this.find(FIND_SOURCES_ACTIVE), [function(source: Source) {
        // This might need to be faster?
        return this.findPath(creep.pos, source).length;
    }]);
    for (const source of sources) {
        if (!assignments[source.id]) {
            assignments[source.id] = [creep.id];
        } else {
            let terrain: RoomTerrain = this.getTerrain();
            let spaces: number = 0;
            // TODO: put on Source prototype
            getNeighbors(source).forEach(function(pos: RoomPosition) {
                if (terrain.get(pos.x, pos.y) == 0) {
                    spaces += 1;
                }
            });
            if (assignments[source.id].length < spaces) {
                assignments[source.id].push(creep.id);
                return source;
            }
        }
    }
}

const getPendingConstructionSites = function(): Array<ConstructionSiteData> {
    let constructionSites:Array<ConstructionSiteData> = [];
    let controllerLevel = this.controller ? this.controller.level : 0;
    for (let i = 0; i <= controllerLevel; i++) {
        if (this.memory['sites'][i]) {
            _.forEach(this.memory['sites'][i], (structureType:StructureConstant, key:string) => {
                let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
                if (TerrainUtil.isSpotOpen(roomPosition, structureType)) {
                    constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
                }
            });
        }
    }
    if (controllerLevel > 1) {
        _.forEach(this.memory['sites2'], (structureType:StructureConstant, key:string) => {
            let roomPosition = new RoomPosition(+key.split(":")[0], +key.split(":")[1], this.name);
            if (TerrainUtil.canPlaceRampart(roomPosition)) {
                constructionSites.push(new ConstructionSiteData(roomPosition, structureType));
            }
        });
    }
    return constructionSites;
};

const planAllConstructionSites = function() {
    initSitesMemory();

    // TODO plan extensions
    // TODO plan roads
    // TODO plan towers
    planExtractors();
};

const planExtractors = function() {
    if (this.memory['planning'][STRUCTURE_EXTRACTOR]) {
        return false;
    }
    let minerals: Array<Mineral> = this.find(FIND_MINERALS);
    for (const mineral of minerals) {
        this.memory['sites'][6][mineral.pos.x + ":" + mineral.pos.y] = STRUCTURE_EXTRACTOR;
    }
    this.memory['planning'][STRUCTURE_EXTRACTOR] = true;
    return true;
};

const initSitesMemory = function() {
    if (!this.memory['sites']) {
        this.memory['sites'] = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
    }
    if (!this.memory['sites2']) {
        this.memory['sites2'] = {};
    }
    if (!this.memory['planning']) {
        this.memory['planning'] = {};
    }
};

declare global {
    interface Room {
        planAllConstructionSites();
        getPendingConstructionSites(): Array<ConstructionSiteData>
        getPlanner();
        findNextEnergySource(creep: Creep): Source;
    }
}

export class RoomPrototype {
    static init() {
        Room.prototype.planAllConstructionSites = planAllConstructionSites;
        Room.prototype.getPendingConstructionSites = getPendingConstructionSites;
        Room.prototype.findNextEnergySource = findNextEnergySource;
        Room.prototype.getPlanner = getPlanner;
    }
}
