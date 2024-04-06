/*jslint browser this */
/*global _, player, computer, utils */

var player1 = "";
var player2 = "";

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_CHOOSE_WHO_STARTS: "PHASE_CHOOSE_WHO_STARTS",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "PHASE_CHOOSE_WHO_STARTS",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur qui commence
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        helpButton: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');
            this.helpButton = document.getElementById("help");
            


            // fonction de choix du joueur qui commence qui sera rappelée lors de la phase de choix
            var chooseWhoStarts = (player1Init, player2Init, player1PLay, player2Play, btnContainer) => {
                // défini l'ordre des phase de jeu
                this.phaseOrder = [
                    player1Init,
                    player2Init,
                    player1PLay,
                    player2Play,
                    this.PHASE_GAME_OVER
                ];
                document.getElementById("choice").style.display = "none";

                // récupère la difficulté choisie à chaque début de partie
                this.level = document.querySelector(".level-input:checked").value;
                this.players[1].level = this.level;

                this.goNextPhase();
            };

            // on commence par choisir qui commence            
            if (this.currentPhase === "PHASE_CHOOSE_WHO_STARTS") {

                // cliquer sur un bouton pour choisir qui commence
                document.querySelector(".choose-player").addEventListener("click", () => {
                    chooseWhoStarts(this.PHASE_INIT_PLAYER, this.PHASE_INIT_OPPONENT, this.PHASE_PLAY_PLAYER, this.PHASE_PLAY_OPPONENT);
                    player1 = "joueur";
                    player2 = "ordinateur";
                });
                document.querySelector(".choose-computer").addEventListener("click", () => {
                    chooseWhoStarts(this.PHASE_INIT_OPPONENT, this.PHASE_INIT_PLAYER, this.PHASE_PLAY_OPPONENT, this.PHASE_PLAY_PLAYER);
                    player1 = "ordinateur";
                    player2 = "joueur";
                });
                document.querySelector(".choose-random").addEventListener("click", () => {

                    // choisir un nombre aléatoire entre 0 et 1 pour déterminer qui commence
                    var choiceRandom = Math.floor(Math.random() * 2);
                    if (choiceRandom === 0) {
                        chooseWhoStarts(this.PHASE_INIT_PLAYER, this.PHASE_INIT_OPPONENT, this.PHASE_PLAY_PLAYER, this.PHASE_PLAY_OPPONENT);
                        player1 = "joueur";
                        player2 = "ordinateur";
                    } else {
                        chooseWhoStarts(this.PHASE_INIT_OPPONENT, this.PHASE_INIT_PLAYER, this.PHASE_PLAY_OPPONENT, this.PHASE_PLAY_PLAYER);
                        player1 = "ordinateur";
                        player2 = "joueur";
                    }
                });
            }
            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
            }

            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    var winner = this.gameIsOver();
                    var title = document.querySelector("#replay h1");

                    if (winner === undefined) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.goNextPhase();
                    } else {
                        utils.info("Fin de partie");
                        document.getElementById("replay").style.display = "flex";
                        if (winner === "Match nul !") {
                            title.textContent = winner;
                        } else if (winner === "joueur") {
                            title.textContent = `Le ${winner} a gagné !`;
                        } else if (winner === "ordinateur") {
                            title.textContent = `L'${winner} a gagné !`;
                        } 
                        document.querySelector(".replay-game").addEventListener("click", () => {
                            window.location.reload();
                        });
                    }
                    break;
                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");
                    this.players[1].isShipOk(function () {
                        self.stopWaiting();
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("A vous de jouer, choisissez une case !");
                    this.helpButton.style.display = "block";
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    this.players[1].play();
                    break;
            }

        },
        gameIsOver: function () {
            var winner = undefined
            var playerIsDefeated = true;
            var opponentIsDefeated = true;

            this.players[0].fleet.forEach((ship) => {
                if (ship.getLife() > 0) {
                    playerIsDefeated = false;
                }
            })

            this.players[1].fleet.forEach((ship) => {
                if (ship.getLife() > 0) {
                    opponentIsDefeated = false;
                }
            })

            if (playerIsDefeated === true && opponentIsDefeated === true) {
                winner = "Match nul !";
            } else if (opponentIsDefeated) {
                if (player1 === "joueur") winner = player1;
                else winner = player2;
            } else if (playerIsDefeated) {
                if (player1 === "ordinateur") winner = player1;
                else winner = player2;
            }
            return winner;

        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu', _.bind(this.handleRightClick, this));
            this.helpButton.addEventListener(
                "click",
                _.bind(this.help, this)
            )
        },
        help: function () {
            if(this.currentPhase !== this.PHASE_PLAY_PLAYER) {
                return;
            }
            if(this.grid.querySelectorAll(".suggestion").length > 0) {
                return;
            }
            var shoot;
            var cell;
            do {
                shoot = this.players[1].difficultIA(this.players[0]);
            } while (this.players[0].tries[shoot.y][shoot.x] !== 0)

            cell = this.grid.querySelector(`.row:nth-child(${shoot.y + 1}) .cell:nth-child(${shoot.x + 1})`);
            cell.classList.add("suggestion")
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau

                // change le décalage si le bateau est pair et qu'il est vertical
                let halfShip = ship.getLife() / 2;
                let n = Math.floor(halfShip);
                let heightGap = 0;
                if (halfShip % 2 === 0 && ship.isVertical === true) {
                    n -= 0.5;
                    heightGap = 0.5
                }

                ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) - heightGap * utils.CELL_SIZE + "px";
                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - n * utils.CELL_SIZE + "px";
            }
        },
        handleRightClick: function (e) {
            e.preventDefault();
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                ship.isVertical = ship.isVertical ? false : true;

                let r = parseInt(ship.dom.style.rotate);
                r = (r === 0) ? 90 : 0;
                ship.dom.style.rotate = r + 'deg';

                this.handleMouseMove(e);
            }

        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    const clickedCell = e.target;
                    let alreadyClicked = false;

                    // si la case a déjà été cliquée, on ne fait rien
                    if (clickedCell.classList.contains('hit') || clickedCell.classList.contains('miss')) {
                        alreadyClicked = true;
                    }
                    
                    if(this.grid.querySelector(".suggestion")) {
                        this.grid.querySelector(".suggestion").classList.remove("suggestion");
                    }
                    
                    // on enregistre le tir
                    this.players[0].play(utils.eq(clickedCell), utils.eq(clickedCell.parentNode), clickedCell, alreadyClicked);
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback, clickedCell = undefined, alreadyClicked = false) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                if (hasSucceed && !alreadyClicked) {
                    msg += "Touché !";
                    if (clickedCell !== undefined) {
                        clickedCell.style.backgroundColor = "red";
                        clickedCell.textContent = "X";
                        clickedCell.classList.add('hit');
                    } else {
                        var cell = self.miniGrid.querySelector(`.row:nth-child(${line + 1}) .cell:nth-child(${col + 1})`);
                        cell.style.backgroundColor = "orange";
                    }
                } else if (!hasSucceed && !alreadyClicked) {
                    msg += "Manqué...";
                    if (clickedCell !== undefined) {
                        clickedCell.style.backgroundColor = "grey";
                        clickedCell.textContent = "O";
                        clickedCell.classList.add('miss');
                    }
                } else if (alreadyClicked) {
                    msg += "Vous avez déjà tiré ici !";
                }

                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);

                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                // setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                // }, 1000);
            });

        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            this.players[0].fleet.forEach(ship => {
                this.miniGrid.appendChild(ship.dom.cloneNode());
            })
            this.miniGrid.style.transform = "scale(0.5) translateX(-250px) translateY(-14.25%)";
        }
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());