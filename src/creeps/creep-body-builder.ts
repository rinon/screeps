import {CreepSpawnData} from "./creep-spawn-data";

export class CreepBodyBuilder {
    static buildBasicWorker(energyAvailable: number): Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50 && bodyArray.length < 30) {
            if (partCount['MOVE'] <= partCount['WORK'] && partCount['MOVE'] <= partCount['CARRY']) {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            } else if (partCount['WORK'] <= partCount['CARRY'] &&
                energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
                bodyArray.unshift(WORK);
                partCount['WORK'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(WORK);
            } else {
                bodyArray.unshift(CARRY);
                partCount['CARRY'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(CARRY);
            }
        }
        return bodyArray;
    }
    static buildMiner(energyAvailable: number): Array<BodyPartConstant> {
        let bodyArray:Array<BodyPartConstant> = [ MOVE, CARRY, WORK ];
        energyAvailable -= 200;
        let partCount = { 'WORK': 1, 'MOVE': 1, 'CARRY': 1 };
        while (energyAvailable >= 50 && bodyArray.length < 30) {
            if (energyAvailable >= CreepSpawnData.getBodyPartCost(WORK)) {
                bodyArray.unshift(WORK);
                partCount['WORK'] += 1;
                energyAvailable -= CreepSpawnData.getBodyPartCost(WORK);
            } else {
                partCount['MOVE'] += 1;
                bodyArray.unshift(MOVE);
                energyAvailable -= CreepSpawnData.getBodyPartCost(MOVE);
            }
        }
        return bodyArray;
    }
}
