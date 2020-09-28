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
        for (let largo_sec = 1; largo_sec < this.largo_para_victoria; largo_sec++) {
            let posibles_secuencias = this.buscarSecuenciaFichas(ultima_ficha_y, ultima_ficha_x, largo_sec);
            posibles_secuencias.forEach(secuencia => {
                let cambio_x = secuencia[0].x - secuencia[1].x;
                let cambio_y = secuencia[0].y - secuencia[1].y;

                let revision_posiciones_siguientes = 1;

                let jugada = {
                    x: secuencia[0].x + cambio_x,
                    y: secuencia[0].y + cambio_y,
                    prioridad: largo_sec + prioridad_jugador
                };
                //Si las siguientes posiciones salteando la ficha de la jugada corresponde al mismo jugador, considera que la secuencia es mayor a la que encontró.
                while (jugada.prioridad < this.largo_para_victoria - 1 && this.esPosicionValida(jugada.y + (cambio_y * revision_posiciones_siguientes), jugada.x + (cambio_x * revision_posiciones_siguientes)) && this.casillas_tablero[jugada.y + (cambio_y * revision_posiciones_siguientes)][jugada.x + (cambio_x * revision_posiciones_siguientes)] == jugador) {
                    jugada.prioridad += 1;
                    revision_posiciones_siguientes++;
                }
                if (this.esPosicionDisponible(jugada.y, jugada.x) && jugada.prioridad > 1) {
                    this.posibles_jugadas.push(jugada);
                }
                jugada = {
                    x: secuencia[largo_sec - 1].x - cambio_x,
                    y: secuencia[largo_sec - 1].y - cambio_y,
                    prioridad: largo_sec + prioridad_jugador
                };
                while (jugada.prioridad < this.largo_para_victoria - 1 && this.esPosicionValida(jugada.y + (cambio_y * revision_posiciones_siguientes), jugada.x + (cambio_x * revision_posiciones_siguientes)) && this.casillas_tablero[jugada.y + (cambio_y * revision_posiciones_siguientes)][jugada.x + (cambio_x * revision_posiciones_siguientes)] == jugador) {
                    jugada.prioridad += 1;
                    revision_posiciones_siguientes++;
                }
                if (this.esPosicionDisponible(jugada.y, jugada.x) && jugada.prioridad > 1) {
                    this.posibles_jugadas.push(jugada);
                }
            });
        }
        this.reducirPosiblesJugadas();
    }
    //Elimina las jugadas imposibles o repetidas.
    reducirPosiblesJugadas() {
        let nuevo_array_jugadas = [];
        this.posibles_jugadas.forEach(jugada => {
            let jugada_similar = this.encontrarJugada(jugada.y, jugada.x, nuevo_array_jugadas);
            //Si encuentra una jugada con las mismas posiciones, guarda la prioridad mayor.
            if (jugada_similar && jugada_similar.prioridad < jugada.prioridad) jugada_similar.prioridad = jugada.prioridad;
            //Si no hay una jugada similar y la jugada es posible, la guarda en el array nuevo.
            else if (this.esPosicionDisponible(jugada.y, jugada.x)) nuevo_array_jugadas.push(jugada);
        });
        this.posibles_jugadas = nuevo_array_jugadas;
    }

    buscarSecuenciaFichas(ultima_ficha_y, ultima_ficha_x, secuencia_size) {

        let jugador = this.casillas_tablero[ultima_ficha_y][ultima_ficha_x];

        let fichas_consecutivas = 0;
        let secuencia = [];
        let todas_secuencias_validas = [];
        let jugador_de_ficha;

        //Revisa todo menos verticalmente.
        for (let y = -1; y < 2; y++) {

            for (let x = -secuencia_size + 1; x < ((secuencia_size * 2) - 1); x++) {
                let nueva_pos_y = ultima_ficha_y + (y * x);
                let nueva_pos_x = ultima_ficha_x + x;
                if (this.esPosicionValida(nueva_pos_y, nueva_pos_x)) jugador_de_ficha = this.casillas_tablero[nueva_pos_y][nueva_pos_x];
                else jugador_de_ficha = -1;

                if (jugador_de_ficha == jugador) {
                    fichas_consecutivas++;
                    secuencia.push({
                        x: nueva_pos_x,
                        y: nueva_pos_y
                    });
                    if (fichas_consecutivas == secuencia_size) {
                        todas_secuencias_validas.push(secuencia);
                    }
                } else {
                    fichas_consecutivas = 0;
                    secuencia = [];
                }
            }
            jugador_de_ficha = -1;
        }
        //Revisa Verticalmente
        for (let y = -secuencia_size + 1; y < ((secuencia_size * 2) - 1); y++) {
            let nueva_pos_y = ultima_ficha_y + y;
            let nueva_pos_x = ultima_ficha_x;
            //No revisa si x 'es valida' porque x es igual a la ficha recibida.
            if (this.esPosicionValida(nueva_pos_y, nueva_pos_x)) jugador_de_ficha = this.casillas_tablero[nueva_pos_y][nueva_pos_x];
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
    //Devuelve la jugada con mayor prioridad con esos x e y.
    encontrarJugada(y, x, array = this.posibles_jugadas) {
        let jugada_encontrada = null;
        let prioridad_anterior = -1;

        if (!this.esPosicionDisponible(y, x)) return null;

        array.forEach(jugada => {
            //Si encuentra una jugada, y tiene mayor prioridad, la agrega
            let prioridad = jugada.prioridad;

            if (jugada.y == y && jugada.x == x && prioridad_anterior < prioridad) {
                prioridad_anterior = prioridad;
                jugada_encontrada = jugada;
            }
        });
        return jugada_encontrada;
    }

    esPosicionValida(y, x) {
        return (x >= 0 && x < this.max_x && y >= 0 && y < this.max_y);
    }

    //Revisa que no haya una ficha en la posición.
    esPosicionDisponible(y, x) {
        let valida = this.esPosicionValida(y, x);
        return (valida && this.casillas_tablero[y][x] == -1);
    }
    //Determina si hay 'plataforma' para ejecutar la jugada.
    esPosibleEsteTurno(y, x) {
        let posible = this.esPosicionDisponible(y, x);
        return (posible && (y == this.max_y - 1 || this.casillas_tablero[y + 1][x] != -1));
    }
    determinarPrioridadEnBaseASiguienteJugada(posible_jugada) {
        //Busca jugada en la pos superior.
        let jugada_casilla_superior = this.encontrarJugada(posible_jugada.y - 1, posible_jugada.x);
        //Si la jugada superior es null, regresa porque 'no hay riesgo' en jugar la anterior.
        //Si la jugada recibida por parámetro 'está revisada' vuelve porque su prioridad ya fue ajustada. 
        if (!jugada_casilla_superior || posible_jugada.revisada) return;
        //Si la jugada daría la victoria al rival, la evita siempre que sea posible.
        else if (jugada_casilla_superior.prioridad == this.largo_para_victoria - 1) {
            posible_jugada.prioridad = 0;
            return;
        } else {
            posible_jugada.prioridad = Math.pow(posible_jugada.prioridad, 1 / jugada_casilla_superior.prioridad);
            posible_jugada.revisada = true;
        }
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
        let max_prior = 0;
        for (let posible_y = this.max_y - 1; posible_y >= 0; posible_y--) {
            for (let posible_x = 0; posible_x < this.max_x; posible_x++) {
                if (!x_encontradas[posible_x] && this.esPosibleEsteTurno(posible_y, posible_x)) {
                    x_encontradas[posible_x] = true;
                    jugadas_validas[posible_x] = {
                        y: posible_y,
                        x: posible_x,
                        prioridad: 1
                    }
                    this.determinarPrioridadEnBaseASiguienteJugada(jugadas_validas[posible_x]);
                    max_prior += jugadas_validas[posible_x].prioridad;
                }
            }
        }
        let elegida = Math.random() * max_prior;
        for (let i = 0; i < jugadas_validas.length; i++) {
            if (jugadas_validas[i]) {
                elegida -= jugadas_validas[i].prioridad;
                if (elegida <= 0) return jugadas_validas[i];
            }
        }
        //Si no hay posibles jugadas devuelve una posición no válida.
        return {
            y: -1,
            x: -1
        }
    }


    decidirJugada() {
        let max_prior = 0;
        let conjunto_jugadas_ejecutables = [];
        for (let prioridad = this.largo_para_victoria - 1; prioridad > 1; prioridad--) {
            let conjunto_posibles_jugadas = this.obtenerJugadasPorPrioridad(prioridad);
            if (conjunto_posibles_jugadas.length > 0) {
                for (let i = 0; i < conjunto_posibles_jugadas.length; i++) {


                    let posible_jugada = conjunto_posibles_jugadas[i];

                    //Si es una jugada ejecutable este turno, la guarda como como 'jugable'
                    if (this.esPosibleEsteTurno(posible_jugada.y, posible_jugada.x)) {
                        //Si además de ser jugable, es una jugada que hace ganar al bot, decide por esa.
                        if (posible_jugada.prioridad > ((this.largo_para_victoria) - 1)) {
                            return posible_jugada;
                        }
                        this.determinarPrioridadEnBaseASiguienteJugada(posible_jugada);
                        conjunto_jugadas_ejecutables.push(posible_jugada);
                        max_prior += posible_jugada.prioridad;
                    }

                }
                //Con las jugadas restantes (después de eliminar las imposibles de hacer y comprobar que no puede ganar este turno), 
                //decide mediante un num random (con mayor probabilidad de que salga una de 'sus jugadas' sobre los bloqueos al rival).
            }
            let elegida = Math.random() * max_prior;
            for (let i = 0; i < conjunto_jugadas_ejecutables.length; i++) {
                elegida -= conjunto_jugadas_ejecutables[i].prioridad;
                if (elegida <= 0) return conjunto_jugadas_ejecutables[i];
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
        if (ultima_ficha_y >= 0 && ultima_ficha_x >= 0) this.revisarUltimaJugada(ultima_ficha_y, ultima_ficha_x, 1);
        let jugada_decidida = this.decidirJugada();
        if (jugada_decidida.x >= 0) {
            this.revisarUltimaJugada(jugada_decidida.y, jugada_decidida.x, 2);
        }
        return jugada_decidida.x;
    }

}