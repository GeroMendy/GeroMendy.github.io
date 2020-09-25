class Bot {

    context;
    casillas_tablero;
    posibles_jugadas;
    largo_para_victoria;
    max_y;
    max_x;

    constructor(context, max_y, max_x, largo_para_victoria = 4) {
        this.context = context;
        this.max_x = max_x;
        this.max_y = max_y;
        this.resetGame();
        this.largo_para_victoria = largo_para_victoria;
        this.posibles_jugadas = [];
    }
    resetGame() {
        this.casillas_tablero = [];
        for (let y = 0; y < this.max_y; y++) {
            this.casillas_tablero[y] = [];
            for (let x = 0; x < this.max_x; x++) {
                this.casillas_tablero[y][x] = -1;
            }
        }
    }

    revisarUltimaJugada(ultima_ficha_y, ultima_ficha_x, jugador) {
        this.casillas_tablero[ultima_ficha_y][ultima_ficha_x] = jugador;
        let prioridad_jugador = 0;
        //Prioriza las posibles jugadas suyas por encima de las posibles jugadas del rival.
        if (jugador == 2) {
            prioridad_jugador = 0.6;
        }
        for (let largo_sec = 2; largo_sec < this.largo_para_victoria; largo_sec++) {
            let posibles_secuencias = this.buscarSecuenciaFichas(ultima_ficha_y, ultima_ficha_x, largo_sec);
            posibles_secuencias.forEach(secuencia => {
                let cambio_x = secuencia[0].x - secuencia[1].x;
                let cambio_y = secuencia[0].y - secuencia[1].y;

                let jugada = {
                    x: secuencia[0].x + cambio_x,
                    y: secuencia[0].y + cambio_y,
                    prioridad: largo_sec + prioridad_jugador
                };
                if (this.esPosicionValida(jugada.y, jugada.x)) {
                    this.posibles_jugadas.push(jugada);
                }
                jugada = {
                    x: secuencia[largo_sec - 1].x - cambio_x,
                    y: secuencia[largo_sec - 1].y - cambio_y,
                    prioridad: largo_sec + prioridad_jugador
                };
                if (this.esPosicionValida(jugada.y, jugada.x)) {
                    this.posibles_jugadas.push(jugada);
                }
            });
        }
    }

    buscarSecuenciaFichas(ultima_ficha_y, ultima_ficha_x, secuencia_size) {

        let jugador = this.casillas_tablero[ultima_ficha_y][ultima_ficha_x];

        let fichas_consecutivas = 0;
        let secuencia = [];
        let todas_secuencias_validas = [];
        let jugador_de_ficha

        //Revisa todo menos verticalmente.
        for (let y = -1; y < 2; y++) {

            for (let x = -secuencia_size + 1; x < ((secuencia_size * 2) - 1); x++) {
                let nueva_pos_y = ultima_ficha_y + (y * x);
                let nueva_pos_x = ultima_ficha_x + x;
                if ((nueva_pos_y >= 0 && nueva_pos_y < this.max_y) && (nueva_pos_x >= 0 && nueva_pos_x < this.max_x)) jugador_de_ficha = this.casillas_tablero[nueva_pos_y][nueva_pos_x];
                else jugador_de_ficha = -1;

                if (jugador_de_ficha == jugador) {
                    fichas_consecutivas++;
                    secuencia.push({
                        x: nueva_pos_x,
                        y: nueva_pos_y
                    });
                    if (fichas_consecutivas == secuencia_size) todas_secuencias_validas.push(secuencia);
                } else {
                    fichas_consecutivas = 0;
                    secuencia = [];
                }
            }
            jugador_de_ficha = -1;
        }
        //Revisa Verticalmente
        for (let y = secuencia_size - 1; y >= 0; y--) {
            let nueva_pos_y = ultima_ficha_y + y;
            let nueva_pos_x = ultima_ficha_x;
            //No revisa si x 'es valida' porque x es igual a la ficha recibida.
            if ((nueva_pos_y >= 0 && nueva_pos_y < this.max_y)) jugador_de_ficha = this.casillas_tablero[nueva_pos_y][nueva_pos_x];
            else jugador_de_ficha = -1;

            if (jugador_de_ficha == jugador) {
                fichas_consecutivas++;
                secuencia.push({
                    x: nueva_pos_x,
                    y: nueva_pos_y
                });
                if (fichas_consecutivas == secuencia_size) todas_secuencias_validas.push(secuencia);
            } else {
                fichas_consecutivas = 0;
                secuencia = [];
            }

        }
        return todas_secuencias_validas;
    }
    //Determina si los valores están dentro del tablero y que no haya una ficha.
    esPosicionValida(y, x) {
        let valida = (x >= 0 && x < this.max_x && y >= 0 && y < this.max_y);
        valida = (valida && this.casillas_tablero[y][x] == -1);
        return valida;
    }
    //Determina si hay 'plataforma' para ejecutar la jugada.
    esPosibleEsteTurno(y, x) {
        let posible = this.esPosicionValida(y, x);
        posible = (posible && (y == this.max_y-1 || this.casillas_tablero[y + 1][x] != -1));
        return posible;
    }

    obtenerJugadasPorPrioridad(prioridad) {
        let jugadas = [];
        this.posibles_jugadas.forEach(jugada => {
            if (parseInt(jugada.prioridad) == prioridad) jugadas.push(jugada);
        });
        return jugadas;
    }
    getJugadaRandom() {
        let jugadas_validas = [];
        let x_encontradas = [];
        for (let posible_y = this.max_y - 1; posible_y >= 0; posible_y--) {
            for (let posible_x = 0; posible_x < this.max_x; posible_x++) {
                if (!x_encontradas[posible_x] && this.casillas_tablero[posible_y][posible_x] == -1) {
                    x_encontradas[posible_x] = true;
                    jugadas_validas[posible_x] = {
                        y: posible_y,
                        x: posible_x
                    }
                }
            }
        }
        //Si encontró al menos 1 fila libre, elige aleatoriamente en que fila jugar.
        if (jugadas_validas.length > 0) {
            let index = Math.floor(Math.random() * jugadas_validas.length);
            return jugadas_validas[index];
        }
        //Si no hay posibles jugadas devuelve una posición no válida.
        return {
            y: -1,
            x: -1
        }
    }


    decidirJugada() {
        let max_prior = 0;
        for (let prioridad = this.largo_para_victoria - 1; prioridad > 1; prioridad--) {
            let conjunto_posibles_jugadas = this.obtenerJugadasPorPrioridad(prioridad);
            if (conjunto_posibles_jugadas.length > 0) {
                for (let i = 0; i < conjunto_posibles_jugadas.length; i++) {

                    let posible_jugada = conjunto_posibles_jugadas[i];
                    //Si esa posicion está ocupada, la borra del array recibido y de las posibles jugadas en general.
                    if (this.casillas_tablero[posible_jugada.y][posible_jugada.x] != -1) {

                        this.casillas_tablero[posible_jugada.y].splice(posible_jugada.x, 1);
                        conjunto_posibles_jugadas.splice(i, 1);
                        //Si la posicion de abajo no está ocupada (y si y no es la posición mas baja),elimina la jugada de las jugadas actuales pero no de las generales.
                    } else if (!this.esPosibleEsteTurno(posible_jugada.y, posible_jugada.x)) {

                        conjunto_posibles_jugadas.splice(i, 1);
                        //Sino, es una jugada que puede suceder este turno.
                    } else {
                        //Si además de ser jugable, es una jugada que hace ganar al bot o que bloquea la victoria rival, decide esa jugada.
                        if (posible_jugada.prioridad > ((this.largo_para_victoria) - 1.1)) {
                            return posible_jugada;
                        }
                        max_prior += posible_jugada.prioridad;
                    }

                }
                //Con las jugadas restantes (después de eliminar las imposibles de hacer y comprobar que no puede ganar este turno), 
                //decide mediante un num random (con mayor probabilidad de que salga una de 'sus jugadas' sobre los bloqueos al rival).
            }
            let elegida = Math.random() * max_prior;
            for (let i = 0; i < conjunto_posibles_jugadas.length; i++) {
                elegida -= conjunto_posibles_jugadas[i].prioridad;
                if (elegida <= 0) return conjunto_posibles_jugadas[i];
            }


            // conjunto_posibles_jugadas.forEach(jugada => {
            //     elegida -= jugada.prioridad;
            //     if (elegida <= 0) {
            //         return jugada;
            //     }
            // });
        }

        return this.getJugadaRandom();
    }
    jugar(ultima_ficha_y, ultima_ficha_x) {
        if (ultima_ficha_y > 0 && ultima_ficha_x > 0) this.revisarUltimaJugada(ultima_ficha_y, ultima_ficha_x, 1);
        let jugada_decidida = this.decidirJugada();
        if (jugada_decidida.x >= 0) {
            this.revisarUltimaJugada(jugada_decidida.y, jugada_decidida.x, 2);
        }
        return jugada_decidida.x;
    }

}