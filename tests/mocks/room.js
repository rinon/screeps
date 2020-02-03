module.exports = function(name, controller) {
    return {
        entities: {
            111: [], //FIND_CONSTRUCTION_SITES
            105: [], //FIND_SOURCES
            107: [
                controller,
                require('./structuretypes/structure-spawn')('Spawn1', 25,25,this),
            ], //FIND_STRUCTURES
            101: [], //FIND_CREEPS
        },
        controller: controller,
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        memory: {
            controllerLevel: 0,
        },
        name: name,
        storage: undefined,
        terminal: undefined,
        visual: {
            text: function(message, x, y, options) {}
        },
        createConstructionSite: function(x, y, structureType, name) {

        },
        lookAt: function(x, y) {
            return [ { x: x, y: y, type: 'terrain', terrain: 'plain' } ];
        },
        lookAtArea: function(top, left, bottom, right, isArray) {
            let returnArray = [ { x: left, y: top, type: 'terrain', terrain: 'plain' } ];
            _.forEach(this.entities[FIND_STRUCTURES], (s) => {
                if (top <= s.pos.y && bottom >= s.pos.y && left <= s.pos.x && right >= s.pos.x) {
                    returnArray.push({ x: s.pos.x, y: s.pos.y, type: 'structure', structure: s});
                }
            });

            return returnArray;
        },
        getPositionAt: function(x, y) {
            return {
                x: x, y: y, room: this,
                findPathTo: function(position) {
                    return [];
                }
            }
        },
        createFlag: function(x, y, name, color, secondaryColor) {
            //only visible to me
        },
        findExitTo: function(room) {
            return FIND_EXIT_TOP;
        },
        find: function(entityType, options) {
            let returnArray = [];
            _.forEach(this.entities[entityType], (entity) => {
                if (options !== undefined && options.filter !== undefined) {
                    if (options.filter(entity)) {
                        returnArray.push(entity);
                    }
                } else {
                    returnArray.push(entity);
                }
            });
            return returnArray;
        },
    };
};