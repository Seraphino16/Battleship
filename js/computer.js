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
               while(!this.placement(ship));
            }, this);

            let k = 0;
            while(k < this.grid.length) {
                console.log(this.grid[k]);
                k += 1;
            }

            setTimeout(function () {
                callback();
            }, 500);
        },
        placement: function (ship) {
            let y = Math.floor(Math.random() * 10);
            let x = Math.floor(Math.random() * 10);

            ship.isVertical = (Math.random() < 0.5) ? false : true;

            let i = 0;
            if(!ship.isVertical) {
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
            } else {
                while(i < ship.getLife()) {
                    if(this.grid[y + i] === undefined || this.grid[y + i][x] !== 0) {
                        return false;
                    }
                    i += 1;
                }

                i = 0;
                while (i < ship.getLife()) {
                    this.grid[y + i][x] = ship.getId();
                    i += 1;
                }
            }
            return true;
        }
    });

    global.computer = computer;

}(this));