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
                creep.deliverEnergyToSpawner();
                break;
            case TransferAction.KEY:
            default:
                creep.goGetEnergy();
                break;
        }
        creep.runAction();
    }
}
