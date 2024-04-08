/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    // var ship = { dom: { parentNode: { removeChild: function () { } } } };

    var player = {
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        activeShip: 0,

        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        fleet: [],

        game: null,
        grid: [],
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },

        play: function (col, line, clickedCell, alreadyClicked) {
            // appel la fonction fire du game, et lui passe
            //  une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this), clickedCell, alreadyClicked);
        },
         // quand il est attaqué le joueur doit dire si il a un bateaux
        //  ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;
            var shipId;
            var shipNode;

            if (this.grid[line][col] !== 0) {
                succeed = true;
                shipId = this.grid[line][col];
                this.grid[line][col] = 0;

                const touchedShip = this.fleet.find(function (ship) {
                    return ship.id === shipId;
                });

                var newLife = touchedShip.getLife() - 1;
                newLife = (
                    newLife <= 0
                    ? 0
                    : newLife
                );
                touchedShip.setLife(newLife);

                if (this.game.currentPhase === "PHASE_PLAY_OPPONENT") {
                    if (touchedShip.getLife() === 0) {
                        shipNode = document.querySelector(
                            `.${touchedShip.name.toLowerCase()}`
                        );
                        shipNode.classList.add("sunk");
                    }
                }
            }
            callback.call(undefined, succeed);
        },
        // renderShips: function (grid) {
        // },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {

                    var node = grid.querySelector(
                        ".row:nth-child(" + (rid + 1) + ") " +
                        ".cell:nth-child(" + (col + 1) + ")"
                    );


                    if (val === true) {
                        node.style.backgroundColor = "#e60019";
                    } else if (val === false) {
                        node.style.backgroundColor = "#aeaeae";
                    }
                });
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        setActiveShipPosition: function (x, y) {
            var ship = this.fleet[this.activeShip];
            var i = 0;

            var n = Math.floor(ship.getLife() / 2);

            // vérifie que l'emplacement du bateau est vide
            //  et existe bien dans la grille
            if (ship.isVertical === false) {
                x -= n;

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
                y -= n;

                while (i < ship.getLife()) {
                    if (this.grid[y + i] === undefined) {
                        if (this.grid[y + i][x] !== 0) {
                            return false;
                        }
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

        setGame: function (game) {
            this.game = game;
        },
        tries: []
    };

    global.player = player;

}(this));