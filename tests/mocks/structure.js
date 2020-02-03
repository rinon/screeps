module.exports = function(id, x, y, structureType, room) {
    return {
        id: id,
        pos: {
            x: x,
            y: y
        },
        hits: 3000,
        hitsMax: 3000,
        structureType: structureType,
        room: room,
    };
};