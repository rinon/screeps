module.exports = function(id) {
    return {
        id: id,
        safeMode: undefined,
        safeModeAvailable: 2,
        safeModeCooldown: undefined,
        my: true,
        reservation: {
            username: 'Multitallented',
            ticksToEnd: 9
        },
        activateSafeMode: function() {
            this.safeMode = 3000;
            this.safeModeAvailable -= 1;
            this.safeModeCooldown = 10000;
        },
        level: 2,
        pos: {
            x: 30,
            y: 40,
        }
    };
};