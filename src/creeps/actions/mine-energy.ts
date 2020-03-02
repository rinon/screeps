import * as _ from "lodash";

export class MineEnergyAction {
    static KEY = 'mine-energy';

    static run(creep:Creep) {
        let freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
        let workPartCount = 0;
        _.forEach(creep.body, (bodyPart:BodyPartDefinition) => {
            if (bodyPart.type === WORK) {
                workPartCount += 1;
            }
        });
        if (freeCapacity < workPartCount * 2) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        if (!creep.memory['target']) {
            let newSource:Source = creep.room.findNextEnergySource(creep.pos);
            if (newSource) {
                creep.memory['target'] = newSource.id;
            } else {
                creep.setNextAction();
                return;
            }
        }
        let source:Source = Game.getObjectById(creep.memory['target']);
        if (!source) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        if (!creep.pos.inRangeTo(source, 1)) {
            creep.moveToTarget();
            return;
        }
        creep.harvest(source);
    }

    static setActionWithTarget(creep:Creep, target:Source) {
        creep.memory['action'] = this.KEY;
        creep.memory['target'] = target.id;
        creep.say('⚡ mine');
        // creep.say('🔄 harvest');
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = this.KEY;
        let source:Source = creep.room.findNextEnergySource(creep.pos);
        if (source) {
            creep.memory['target'] = source.id;
        } else {
            delete creep.memory['target'];
        }
        creep.say('⚡ mine');
        // creep.say('🔄 harvest');
    }
}