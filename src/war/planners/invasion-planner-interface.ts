import {CreepSpawnData} from "../../creeps/creep-spawn-data";
import {InvasionStageEnum} from "../invasion-stage-enum";

export interface InvasionPlannerInterface {

    getNeededResponderCreeps(): Array<CreepSpawnData>;

    getInvasionStage(): InvasionStageEnum;
}
