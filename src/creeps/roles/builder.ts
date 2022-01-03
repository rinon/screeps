import {CreepRoleEnum} from "./creep-role-enum";
import {WithdrawAction} from "../actions/withdraw";
import {MineEnergyAction} from "../actions/mine-energy";
import {BuildAction} from "../actions/build";
import * as _ from "lodash";
import {RepairAction} from "../actions/repair";

export class Builder {
    static KEY: CreepRoleEnum = CreepRoleEnum.BUILDER;
    static setAction(creep:Creep) {
        switch (creep.memory['action']) {
            case WithdrawAction.KEY:
            case MineEnergyAction.KEY:
                let repairThese = _.sortBy(creep.room.find(FIND_STRUCTURES, { filter: (s:Structure) => {
                    return s.hits / s.hitsMax < 0.75;
                }}), (s: Structure) => { return -1 * s.hits; });
                if (repairThese.length > 0) {
                    RepairAction.setAction(creep, repairThese[0]);
                } else {
                    let sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                    if (sites.length > 0) {
                        BuildAction.setAction(creep, sites[0]);
                    } else {
                        creep.room.reassignIdleCreep(creep);
                        return;
                    }
                }

                break;
            case BuildAction.KEY:
            default:
                creep.goGetEnergy();
                break;
        }
        creep.runAction();
    }
}