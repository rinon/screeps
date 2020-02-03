import * as _ from "lodash";

module.exports = {
    roles: {
        UPGRADER: 'upgrader'
    },
    parts: {
        WORK: {type: "work", hits: 100, buildCost: 100},
        CARRY: {type: "carry", hits: 100, buildCost: 50},
        MOVE: {type: "move", hits: 100, buildCost: 50},
        ATTACK: {type: "attack", hits: 100, buildCost: 80},
        RANGED_ATTACK: {type: "ranged_attack", hits: 100, buildCost: 150},
        HEAL: {type: "heal", hits: 100, buildCost: 250},
        CLAIM: {type: "claim", hits: 100, buildCost: 600},
        TOUGH: {type: "tough", hits: 100, buildCost: 10},
    },
    buildBestCreep: function(type, energy, inputMemory) {
        let partCount = {
            "work": 0,
            "carry": 0,
            "move": 0,
            "attack": 0,
            "ranged_attack": 0,
            "heal": 0,
            "claim": 0,
            "tough": 0
        };
        let bodyArray = [];
        let energyRemaining = energy;
        while (energyRemaining > 10) {
            if (type === this.roles.UPGRADER) {
                if (energyRemaining > 99 && partCount.work < partCount.move) {
                    bodyArray.unshift(WORK);
                    partCount.work++;
                    energyRemaining -= 100;
                } else if (energyRemaining > 49 && partCount.carry < partCount.move) {
                    bodyArray.unshift(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 49) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else {
                    energyRemaining = 0;
                }
            }
        }
        let memory = { memory: { role: type }};
        if (inputMemory) {
            _.forEach(inputMemory, (mem, key) => {
                memory.memory[key] = mem;
            });
        }
        return {
            bodyArray: bodyArray,
            memory: memory,
        };
    },
};