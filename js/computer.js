/*jslint browser this for */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        difficultIA: function (e) {
            var self = e;
            var shoot;
            var y;
            var x;
            var bestShoots = [];
            var isVertical = false;
            var isHorizontal = false;
            function Shoot(x, y) {
                this.x = x;
                this.y = y;
            }
            // cherche les cases que l'ordinateur a touché
            for (y = 0; y < self.tries.length; y += 1) {
                for (x = 0; x < self.tries[y].length; x += 1) {
                    if (self.tries[y][x] === true) {

                        // vérifie si une autre case est touchée à coté
                        // pour attaquer dans le même sens
                        if (x < self.tries[y].length - 1
                            && (self.tries[y][x + 1] === 0)
                            && self.tries[y][x - 1] !== undefined
                            && self.tries[y][x - 1] === true) {
                            bestShoots.push(new Shoot(x + 1, y));
                        }
                        if (x > 0
                            && self.tries[y][x - 1] === 0
                            && self.tries[y][x + 1] !== undefined
                            && self.tries[y][x + 1] === true) {
                            bestShoots.push(new Shoot(x - 1, y));
                        }
                        if (y < self.tries.length - 1
                            && self.tries[y + 1][x] === 0
                            && self.tries[y - 1] !== undefined
                            && self.tries[y - 1][x] === true) {
                            bestShoots.push(new Shoot(x, y + 1));
                        }
                        if (y > 0
                            && self.tries[y - 1][x] === 0
                            && self.tries[y + 1] !== undefined
                            && self.tries[y + 1][x] === true) {
                            bestShoots.push(new Shoot(x, y - 1));
                        }

                        // vérifie si un sens a déja été trouvé
                        // (pour ne pas entourer le bateau)
                        if ((self.tries[y][x - 1] !== undefined
                            && self.tries[y][x - 1] === true)
                            || (self.tries[y][x + 1] !== undefined
                            && self.tries[y][x + 1] === true)) {
                            isHorizontal = true;
                        }

                        if ((self.tries[y - 1] !== undefined
                            && self.tries[y - 1][x] === true)
                            || (self.tries[y + 1] !== undefined
                            && self.tries[y + 1][x] === true)) {
                            isVertical = true;
                        }

                        // ajoute toutes les cases à côté
                        // si aucune n'a été touchée
                        if (bestShoots.length === 0) {
                            if (x < self.tries[y].length - 1
                                && self.tries[y][x + 1] === 0
                                && isVertical === false) {
                                bestShoots.push(new Shoot(x + 1, y));
                            }
                            if (x > 0 && self.tries[y][x - 1] === 0
                                && isVertical === false) {
                                bestShoots.push(new Shoot(x - 1, y));
                            }
                            if (y < self.tries.length - 1
                                && self.tries[y + 1][x] === 0
                                && isHorizontal === false) {
                                bestShoots.push(new Shoot(x, y + 1));
                            }
                            if (y > 0 && self.tries[y - 1][x] === 0
                                && isHorizontal === false) {
                                bestShoots.push(new Shoot(x, y - 1));
                            }
                        }
                    }
                    isHorizontal = false;
                    isVertical = false;
                }
            }

            if (bestShoots.length > 0) {
                shoot = _.sample(bestShoots);
            } else {
                shoot = this.pickRandomCoordinates();
            }
            return shoot;
        },
        fleet: [],
        game: null,
        grid: [],
        isShipOk: function (callback) {

            this.fleet.forEach(function (ship) {
                var isOk = false;
                while (!isOk) {
                    isOk = this.placement(ship);
                }
            }, this);

            setTimeout(function () {
                callback();
            }, 500);
        },
        level: null,

        pickRandomCoordinates: function () {
            var coordinates = {
                x: Math.floor(Math.random() * 10),
                y: Math.floor(Math.random() * 10)
            };
            return coordinates;
        },
        placement: function (ship) {
            var y = Math.floor(Math.random() * 10);
            var x = Math.floor(Math.random() * 10);
            var i = 0;

            ship.isVertical = (
                (Math.random() < 0.5)
                ? `${false}`
                : true
            );

            if (!ship.isVertical) {
                while (i < ship.getLife()) {
                    if (this.grid[y][x + i] !== 0) {
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
                while (i < ship.getLife()) {
                    if (this.grid[y + i] === undefined
                        || this.grid[y + i][x] !== 0) {
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
        },
        play: function () {
            var self = this;
            var shoot;
            setTimeout(function () {

                switch (self.level) {
                case "easy":
                    do {
                        shoot = self.pickRandomCoordinates();
                    } while (self.tries[shoot.y][shoot.x] !== 0);
                    break;
                case "difficult":
                    do {
                        shoot = self.difficultIA(this);
                    } while (self.tries[shoot.y][shoot.x] !== 0);
                    break;
                }

                self.game.fire(this, shoot.x, shoot.y, function (hasSucced) {
                    self.tries[shoot.y][shoot.x] = hasSucced;
                });
            }, 2000);
        },
        tries: []
    });

    global.computer = computer;

}(this));