import {InvasionTypeEnum} from "./invasion-type-enum";
import {BorderPatrolPlanner} from "./planners/border-patrol-planner";
import {InvasionPlannerInterface} from "./planners/invasion-planner-interface";

export class Invasion {
    public enemyCreeps: Array<Creep> = [];
    public spawningCreeps: Array<string> = [];
    private readonly invasionPlanner: InvasionPlannerInterface;
    public readonly name: string;

    constructor(name: string, creeps: Array<Creep>) {
        this.name = name;
        this.enemyCreeps = creeps;
        if (Memory['war']['invasions'][name]) {
            if (!Memory['war']['invasions'][name]['respondingCreeps']) {
                Memory['war']['invasions'][name]['respondingCreeps'] = [];
            }
            if (Memory['war']['invasions'][name]['spawningCreeps']) {
                this.spawningCreeps = Memory['war']['invasions'][name]['spawningCreeps'];
            }
        }
        this.invasionPlanner = this.setInvasionPlanner();
    }

    public addCommittedResponder(id: Id<Creep>) {
        if (Memory['war']['invasions'][this.name]) {
            Memory['war']['invasions'][this.name]['respondingCreeps'].push(id);
        }
    }

    public addSpawningCreep(name: string) {
        this.spawningCreeps.push(name);
        if (!Memory['war']['invasions'][name]['spawningCreeps']) {
            Memory['war']['invasions'][name]['spawningCreeps'] = [];
        }
        Memory['war']['invasions'][name]['spawningCreeps'].push(name);
    }

    private setInvasionPlanner() {
        switch (this.getInvasionType()) {
            case InvasionTypeEnum.HARVESTER:
            default:
                return new BorderPatrolPlanner(this);
        }
    }

    public getInvasionPlanner(): InvasionPlannerInterface {
        return this.invasionPlanner;
    }

    public getInvasionType() {
        // TODO check the creeps array to find what type of invasion it is
        return InvasionTypeEnum.HARVESTER;
    }
}
