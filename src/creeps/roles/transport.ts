import {WithdrawAction} from "../actions/withdraw";
import {MineEnergyAction} from "../actions/mine-energy";
import {TransferAction} from "../actions/transfer";

export class Transport {
    static KEY = 'transport';

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
