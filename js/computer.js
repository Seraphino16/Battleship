/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                self.game.fire(this, 0, 0, function (hasSucced) {
                    self.tries[0][0] = hasSucced;
                });
            }, 2000);
        },
        isShipOk: function (callback) {

            this.fleet.forEach(function (ship) {
                let y = Math.floor(Math.random() * 10);
                let x = Math.floor(Math.random() * 10); 

                

                let i = 0;
                while(i < ship.getLife()) {
                    if(this.grid[y][x + i] !== 0) {
                        return false;
                    }
                    i += 1;
                }

                i = 0;
                while (i < ship.getLife()) {
                    this.grid[y][x + i] = ship.getId();
                    i += 1;
                }

                // console.log(this.grid[y]);
            }, this);

            console.log(this.grid);

            setTimeout(function () {
                callback();
            }, 500);
        }
    });

    global.computer = computer;

}(this));