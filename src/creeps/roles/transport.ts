import {WithdrawAction} from "../actions/withdraw";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferAction} from "../actions/transfer";
import {CreepRoleEnum} from "./creep-role-enum";

export class Transport {
    static KEY: CreepRoleEnum = CreepRoleEnum.TRANSPORT;

    static setAction(creep: Creep) {
        switch (creep.memory['action']) {
            case WithdrawAction.KEY:
            case MineEnergyAction.KEY:
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < 1) {
                    creep.goGetEnergy(creep.getActiveBodyparts(WORK) > 0);
                } else {
                    creep.deliverEnergyToSpawner();
                }
                break;
            case TransferAction.KEY:
            default:
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.deliverEnergyToSpawner();
                } else {
                    creep.goGetEnergy(creep.getActiveBodyparts(WORK) > 0);
                }
                break;
        }
        creep.runAction();
    }
}
