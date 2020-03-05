import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {Upgrader} from "../../creeps/roles/upgrader";

export class InitPlanner {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    reassignCreeps() {
        // TODO reassign creeps to different roles (especially idle ones)
    }

    getNextCreepToSpawn(): CreepSpawnData {
        return CreepSpawnData.build(Upgrader.KEY, Upgrader.buildBodyArray(Math.min(this.room.energyAvailable, 600)), 0);
    }

    placeConstructionSites() {
        if (this.room.memory['ticksTillNextConstruction']) {
            this.room.memory['ticksTillNextConstruction'] -= 1;
        }
        if (!this.room.memory['sites'] || this.room.memory['ticksTillNextConstruction']) {
            return;
        }
        this.room.memory['ticksTillNextConstruction'] = 120;
        let numberConstructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES).length;
        if (numberConstructionSites > 2) {
            return;
        }

        const constructionSites = this.room.getPendingConstructionSites();

        if (constructionSites.length > 0) {
            this.sortByPriority(constructionSites, null);
            this.room.createConstructionSite(constructionSites[0].pos, constructionSites[0].structureType);
            if (numberConstructionSites < 2 && constructionSites.length > 1) {
                this.room.createConstructionSite(constructionSites[1].pos, constructionSites[1].structureType);
            }
            if (numberConstructionSites < 1 && constructionSites.length > 2) {
                this.room.createConstructionSite(constructionSites[2].pos, constructionSites[2].structureType);
            }
        }
    }

    getStructureTypePriority(structureType:StructureConstant):number {
        switch (structureType) {
            case STRUCTURE_TOWER:
                return 200;
            case STRUCTURE_SPAWN:
            case STRUCTURE_POWER_SPAWN:
                return 125;
            case STRUCTURE_EXTENSION:
                return 100;
            case STRUCTURE_EXTRACTOR:
            case STRUCTURE_CONTAINER:
            case STRUCTURE_LINK:
                return 90;
            case STRUCTURE_TERMINAL:
            case STRUCTURE_STORAGE:
                return 75;
            case STRUCTURE_ROAD:
                return 10;
            case STRUCTURE_RAMPART:
                return 8;
            case STRUCTURE_WALL:
                return 7;
            default:
                return 0;
        }
    }

    sortByPriority(array, tieBreaker:Function) {
        array.sort((x, y):number => {
            let xPriority:number = this.getStructureTypePriority(x.structureType);
            let yPriority:number = this.getStructureTypePriority(y.structureType);
            if (xPriority > yPriority) {
                return -1;
            } else if (yPriority > xPriority) {
                return 1;
            } else {
                if (tieBreaker) {
                    return tieBreaker(x, y);
                }
                return 0;
            }
        });
    }
}
