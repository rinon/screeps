const findNextEnergySource = function() {
}

declare global {
    interface Room {
        findNextEnergySource();
    }
}

export class RoomPrototype {
    static init() {
        Room.prototype.findNextEnergySource = findNextEnergySource;
    }
}
