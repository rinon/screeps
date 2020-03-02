import * as _ from "lodash";

export class CreepSpawnData {
    public bodyArray: Array<BodyPartConstant>;
    public name: string;
    public options: Object;
    public minPercentCapacity:number;

    static getBodyPartCost(bodyPartConstant:BodyPartConstant):number {
        switch (bodyPartConstant) {
            case CLAIM:
                return 600;
            case HEAL:
                return 250;
            case RANGED_ATTACK:
                return 150;
            case WORK:
                return 100;
            case ATTACK:
                return 80;
            case TOUGH:
                return 10;
            case MOVE:
            case CARRY:
            default:
                return 50;
        }
    }

    static getBodyPartValue(bodyPart:BodyPartConstant):number {
        switch (bodyPart) {
            case RANGED_ATTACK:
                return 130;
            case ATTACK:
                return 120;
            case HEAL:
                return 110;
            case MOVE:
                return 100;
            case WORK:
                return 25;
            case CLAIM:
                return 90;
            case TOUGH:
                return 5;
            case CARRY:
                return 50;
            default:
                return 0;
        }
    }

    constructor(bodyArray:Array<BodyPartConstant>, name:string, options:Object, minPercentCapacity:number) {
        this.bodyArray = this.sortBodyParts(bodyArray);
        this.name = name;
        this.options = options;
        this.minPercentCapacity = minPercentCapacity;
    }

    sortBodyParts(bodyArray:Array<BodyPartConstant>):Array<BodyPartConstant> {
        bodyArray.sort(function(x, y):number {
            let xValue = CreepSpawnData.getBodyPartValue(x);
            let yValue = CreepSpawnData.getBodyPartValue(y);
            if (xValue < yValue) {
                return -1;
            } else if (xValue > yValue) {
                return 1;
            } else {
                return 0;
            }
        });
        return bodyArray;
    }

    getEnergyRequired(): number {
        let total = 0;
        _.forEach(this.bodyArray, (bodyPart:BodyPartConstant) => {
            total += CreepSpawnData.getBodyPartCost(bodyPart);
        });
        return total;
    }

    static build(key:string, bodyArray:Array<BodyPartConstant>, minPercentCapacity: number):CreepSpawnData {
        return new CreepSpawnData(bodyArray,
            key + Game.time,
            {
                "memory": {
                    "role": key
                }
            }, minPercentCapacity);
    }
}