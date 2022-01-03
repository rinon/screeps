import {CreepRoleEnum} from "./creep-role-enum";
import {WithdrawAction} from "../actions/withdraw";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferAction} from "../actions/transfer";
import {WaitAction} from "../actions/wait";

export class Miner {
    static KEY: CreepRoleEnum = CreepRoleEnum.MINER;
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawAction.KEY:
            case MineEnergyAction.KEY:
                let nearestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s:Structure) => {
                        return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ||
                            s.structureType === STRUCTURE_LINK) &&
                            s['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }});
                if (nearestContainer) {
                    TransferAction.setAction(creep, nearestContainer, RESOURCE_ENERGY);
                } else {
                    WaitAction.setActionUntilNextTick(creep);
                }
                break;
            case TransferAction.KEY:
            default:
                MineEnergyAction.setAction(creep);
                break;
        }
        creep.runAction();
    }
}