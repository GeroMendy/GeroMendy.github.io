document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const CANVAS_DEFAULT_COLOR = "#00DDAA33";
    const URL_IMAGEN_CASILLA_TABLERO = "../img/entregable02/casilla.png";
    const URL_IMAGEN_FICHA = "../img/entregable02/ficha.png";
    const DEFAULT_FICHAS_NECESARIAS_PARA_VICTORIA = 4;
    const TRANSPARENCIA_COLOR_FONDO = 0.7;
    const COLOR_GANADOR = "#33FF55FF";
    const DEFAULT_TABLERO_SIZE = { width: 7, height: 6 };

    let canvas = document.querySelector("#js-canvas");
    let ctx = canvas.getContext("2d");

    let fichas_necesarias_para_victoria = DEFAULT_FICHAS_NECESARIAS_PARA_VICTORIA;
    let tablero_celdas_horizontal = DEFAULT_TABLERO_SIZE.width;
    let tablero_celdas_vertical = DEFAULT_TABLERO_SIZE.height;
    let espacio_por_jugador = 0.15;

    let ditancia_entre_fichas_y_borde = 12;
    let tablero_pixel_width;
    let celda_pixel_size;

    let ficha_radio;

    let window_width = document.querySelector("#js-canvas_container").clientWidth;
    let window_height = document.querySelector("#js-canvas_container").clientHeight;

    let casillas_tablero = [];
    let jugador_1_fichas = [];
    let jugador_2_fichas = [];
    let colliders_tablero = [];
    let current_player = -1;
    // let ultima_ficha_jugada = null;

    let jugador_1_color = "#FF8800FF";
    let jugador_2_color = "#CCCCCCFF";

    let bot = null;
    let ultima_jugada_bot_info_y = -1;
    let ultima_jugada_bot_info_x = -1;


    //Variable para mover la ficha manteniendo la distancia al centro.
    let hay_ficha_en_movimiento = false;
    let ficha_arrastrada = null;
    let distancia_desde_click_al_centro_de_ficha = {
        x: 0,
        y: 0
    };

    function startGame() {
        //Carga la matriz con 'espacios vacios'
        actualizarUI(false);

        casillas_tablero = [];
        jugador_1_fichas = [];
        jugador_2_fichas = [];

        for (let y = 0; y < tablero_celdas_vertical; y++) {
            casillas_tablero[y] = [];
            for (let x = 0; x < tablero_celdas_horizontal; x++) {
                casillas_tablero[y][x] = null;
            }
        }
        //Cantidad de fichas a dibujar para cada jugador.
        let fichas_por_jugador = parseInt((tablero_celdas_horizontal * tablero_celdas_vertical) / 2);

        //Inicializa el jugador
        current_player = parseInt(Math.random() * 2) + 1;

        let color = getCurrentPlayerBackgroundColor();

        clearCanvas(color);
        createTablero();

        if (bot) bot = new Bot(ctx, tablero_celdas_vertical, tablero_celdas_horizontal, fichas_necesarias_para_victoria);

        let imagen = new Image(ficha_radio * 2, ficha_radio * 2);
        imagen.src = URL_IMAGEN_FICHA;
        imagen.onload = () => {

            // let pos_y = celda_pixel_size + ((y + 0.5) * celda_pixel_size);
            let distancia_entre_fichas = ((tablero_celdas_vertical - 1) * celda_pixel_size) / fichas_por_jugador;

            for (let ficha = 0; ficha < fichas_por_jugador; ficha++) {
                let height_ficha = 2 * celda_pixel_size + (ficha * distancia_entre_fichas);

                //Coloca las fichas en una pila desde abajo hacia arriba.
                let ficha_p1 = createFicha(ficha_radio + ditancia_entre_fichas_y_borde, height_ficha, 1, imagen);
                let ficha_p2 = createFicha(window_width - (ficha_radio + ditancia_entre_fichas_y_borde), height_ficha, 2, imagen);

                ficha_p1.draw();
                ficha_p2.draw();

                jugador_1_fichas.push(ficha_p1);
                jugador_2_fichas.push(ficha_p2);

                //En caso que la cantidad de fichas sea impar, da una mas al jugador inicial.
                if ((tablero_celdas_horizontal * tablero_celdas_vertical) % 2 != 0) {
                    switch (current_player) {
                        case 1:
                            let ficha_p1 = createFicha(ficha_radio + ditancia_entre_fichas_y_borde, window_height - ficha_radio - (fichas_por_jugador * distancia_entre_fichas) - ditancia_entre_fichas_y_borde, 1, imagen);
                            jugador_1_fichas.push(ficha_p1);
                            ficha_p1.draw();
                            break;
                        case 2:
                            let ficha_p2 = createFicha(window_width - ficha_radio - ditancia_entre_fichas_y_borde, window_height - ficha_radio - (fichas_por_jugador * distancia_entre_fichas) - ditancia_entre_fichas_y_borde, 2, imagen);
                            jugador_2_fichas.push(ficha_p2);
                            ficha_p2.draw();
                            break;
                    }
                }

            }

            if (bot != null && current_player == 2) {
                letBotPlay();
            }

        };

        escribirTurnoActual();


    }

    function redrawAll() {
        let color = getCurrentPlayerBackgroundColor();
        clearCanvas(color);
        casillas_tablero.forEach(columna => {
            columna.forEach(casilla => {
                casilla.draw();
            });
        });

        jugador_1_fichas.forEach(ficha => {
            ficha.draw();
        });
        jugador_2_fichas.forEach(ficha => {
            ficha.draw();
        });
        escribirTurnoActual();
    }

    function clearCanvas(color = CANVAS_DEFAULT_COLOR) {

        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // ctx.fillStyle = "#FFFFFFFF";
        // ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        ctx.fillStyle = "#FFFFFF00";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    }

    function createFicha(x = 0, y = 0, jugador = 0, imagen = null) {
        switch (jugador) {
            case 1:
                return new Ficha(ctx, x, y, ficha_radio, jugador_1_color, imagen, 1);
                break;
            case 2:
                let x_en_canvas = getPosicionEnCanvas(x, y).x;
                return new Ficha(ctx, x_en_canvas, y, ficha_radio, jugador_2_color, imagen, 2);
                break;
        }
    }

    function createTablero() {
        //Obtiene la mitad del espacio que queda libre, para ubicar el tablero en el centro.
        let espacio_pixel_por_jugador = (window_width - (celda_pixel_size * tablero_celdas_horizontal)) / 2;

        //Los '+1' en los parámetros de la imagen es para evitar que queden lineas vacías entre casilla y casilla.
        let imagen_casilla_tablero = new Image(celda_pixel_size + 1, celda_pixel_size + 1);
        imagen_casilla_tablero.src = URL_IMAGEN_CASILLA_TABLERO;
        imagen_casilla_tablero.onload = () => {

            for (let y = -1; y < tablero_celdas_vertical; y++) {
                for (let x = 0; x < tablero_celdas_horizontal; x++) {

                    let pos_x = espacio_pixel_por_jugador + (x * celda_pixel_size);
                    let pos_y = celda_pixel_size + ((y + 0.5) * celda_pixel_size);
                    //Deja un espacio igual al tamaño de la celda para 'poner' la ficha
                    if (y < 0) {
                        pos_x += 2 * celda_pixel_size / 5;
                        pos_y += celda_pixel_size / 4;
                        let col = new Collider(pos_x, pos_y, celda_pixel_size / 5, celda_pixel_size / 5);
                        colliders_tablero[x] = col;
                    }
                    else {
                        casillas_tablero[y][x] = new Casilla(ctx, pos_x, pos_y, celda_pixel_size, celda_pixel_size, imagen_casilla_tablero);
                        casillas_tablero[y][x].draw();
                    }
                }
            }

        }

        document.querySelector("#js-canvas_container").style.height = (celda_pixel_size * (tablero_celdas_vertical + 2)) + "px";
    }

    function buscarSecuenciaFichas(ultima_ficha_y, ultima_ficha_x, secuencia_size = fichas_necesarias_para_victoria) {

        let jugador = casillas_tablero[ultima_ficha_y][ultima_ficha_x].getJugador();

        let fichas_consecutivas = 0;
        let secuencia = [];
        let todas_secuencias_validas = [];

        //Revisa todo menos verticalmente.
        for (let y = -1; y < 2; y++) {

            for (let x = -secuencia_size + 1; x < ((secuencia_size * 2) - 1); x++) {
                let ficha
                let nueva_pos_y = ultima_ficha_y + (y * x);
                let nueva_pos_x = ultima_ficha_x + x;
                if ((nueva_pos_y >= 0 && nueva_pos_y < tablero_celdas_vertical) && (nueva_pos_x >= 0 && nueva_pos_x < tablero_celdas_horizontal)) ficha = casillas_tablero[nueva_pos_y][nueva_pos_x].getFicha();
                if (ficha && ficha.esJugador(jugador)) {
                    fichas_consecutivas++;
                    secuencia.push(ficha);
                    if (fichas_consecutivas == secuencia_size) todas_secuencias_validas.push(secuencia);
                } else {
                    fichas_consecutivas = 0;
                    secuencia = [];
                }
            }
        }
        //Revisa Verticalmente
        for (let y = secuencia_size - 1; y >= 0; y--) {
            let ficha
            let nueva_pos_y = ultima_ficha_y + y;
            let nueva_pos_x = ultima_ficha_x;
            //No revisa si x 'es valida' porque x es igual a la ficha recibida.
            if ((nueva_pos_y >= 0 && nueva_pos_y < tablero_celdas_vertical)) ficha = casillas_tablero[nueva_pos_y][nueva_pos_x].getFicha();
            if (ficha && ficha.esJugador(jugador)) {
                fichas_consecutivas++;
                secuencia.push(ficha);
                if (fichas_consecutivas == secuencia_size) todas_secuencias_validas.push(secuencia);
            } else {
                fichas_consecutivas = 0;
                secuencia = [];
            }

        }
        return todas_secuencias_validas;
    }

    //Cambia el color de fondo a una version transparente del color del jugador.
    function getCurrentPlayerBackgroundColor() {
        let color;
        switch (current_player) {
            case 1: color = jugador_1_color; break;
            case 2: color = jugador_2_color; break;
            default: color = COLOR_GANADOR; break;
        }
        color = hexaToRgb(color);
        color[3] *= TRANSPARENCIA_COLOR_FONDO;
        color = rgbToHexa(color[0], color[1], color[2], color[3]);
        return color;
    }

    function setTableroSize(new_width = DEFAULT_TABLERO_SIZE.width, new_height = DEFAULT_TABLERO_SIZE.height) {

        if (new_width > 0 && new_height > 0) {
            tablero_celdas_horizontal = new_width;
            tablero_celdas_vertical = new_height;
        }

        tablero_pixel_width = window_width * (1 - (2 * espacio_por_jugador));
        celda_pixel_size = tablero_pixel_width / tablero_celdas_horizontal;

        if (celda_pixel_size * (tablero_celdas_vertical + 1) >= window_height) {
            celda_pixel_size = window_height / (tablero_celdas_vertical + 1);
        }

        ficha_radio = 1.0 * celda_pixel_size / 2;

    }

    // document.querySelector("#js-change_size_tablero").addEventListener("click", () => {

    //     let inputs_new_size = document.querySelectorAll(".js-size_tablero");
    //     setTableroSize(inputs_new_size[0], inputs_new_size[1]);

    // });


    /* Funciones para controlar la interacción con el juego */

    function buscarFichaClickeada(click_x, click_y) {
        let lista_fichas;
        switch (current_player) {
            case 1: lista_fichas = jugador_1_fichas; break;
            case 2: lista_fichas = jugador_2_fichas; break;
            //Si no es el turno de un jugador, inicializa la lista vacía para saltear el while.
            default: lista_fichas = []; break;
        }
        for (let i = 0; i < lista_fichas.length; i++) {
            let ficha = lista_fichas[i];
            if (ficha.isPointInsideToken(click_x, click_y)) return ficha;
        }
        return false;
    }

    function moverFichaClickeada(nuevo_x, nuevo_y) {
        ficha_arrastrada.setPosition(nuevo_x + distancia_desde_click_al_centro_de_ficha.x, nuevo_y + distancia_desde_click_al_centro_de_ficha.y);
        redrawAll();
    }
    //Al soltar el mouse, revisa si la ficha fue dejada en el espacio libre para ser jugada.
    function intentarjugada() {
        let fueJugada = false;
        if (ficha_arrastrada) {
            let posible_x = 0;
            while (posible_x < colliders_tablero.length && !fueJugada) {
                fueJugada = colliders_tablero[posible_x].isTokenInsideCollider(ficha_arrastrada);
                posible_x++;
            }
            if (fueJugada) {
                let array_fichas = [];
                posible_x--;
                switch (current_player) {
                    case 1: array_fichas = jugador_1_fichas; break;
                    case 2: array_fichas = jugador_2_fichas; break;
                }
                let valor_y = buscarPrimeraPosicionVerticalValida(posible_x);
                let conjunto_secuencias_ganadoras = null;
                //!=false está explícito porque if(y) considera y=0 como false.
                if (valor_y !== false) {
                    //Elimina a ficha del array de fichas del jugador para evitar que la ficha se dibuje con el tablero y luego sobre el tablero con el array.
                    eliminarObjetoEnArray(ficha_arrastrada, array_fichas);
                    casillas_tablero[valor_y][posible_x].setFicha(ficha_arrastrada);

                    //Recibe un array con cada una de las secuencias (arrays de fichas) que cumplen con ese largo (en este caso 4).
                    //'Backtracking completo'
                    conjunto_secuencias_ganadoras = buscarSecuenciaFichas(valor_y, posible_x);

                    if (conjunto_secuencias_ganadoras.length > 0) {
                        conjunto_secuencias_ganadoras.forEach(secuencia_ganadora => {
                            secuencia_ganadora.forEach(ficha => {
                                ficha.setFondo(COLOR_GANADOR);
                            });
                        });
                        current_player *= -1;
                        redrawAll();
                        actualizarUI(false);

                        return;
                    } else {

                        cambiarJugadorActual();
                        if (bot) {
                            ultima_jugada_bot_info_x = posible_x;
                            ultima_jugada_bot_info_y = valor_y;
                        }
                    }

                    eliminarObjetoEnArray(ficha_arrastrada, array_fichas);
                    ficha_arrastrada = null;

                }

                if (bot != null && current_player == 2) {
                    letBotPlay();
                }

                redrawAll();
            }
        }
    }
    function letBotPlay() {
        let posicion_decidida_por_bot = bot.jugar(ultima_jugada_bot_info_y, ultima_jugada_bot_info_x);
        let valor_y = buscarPrimeraPosicionVerticalValida(posicion_decidida_por_bot);

        let pos_in_canvas = casillas_tablero[0][posicion_decidida_por_bot].getCentralPoint();
        pos_in_canvas.y -= celda_pixel_size;
        ficha_arrastrada = jugador_2_fichas[jugador_2_fichas.length - 1];
        ficha_arrastrada.setPosition(pos_in_canvas.x, pos_in_canvas.y);
        intentarjugada();

    }

    function buscarPrimeraPosicionVerticalValida(x) {
        //Recorre la fila de la matriz de abajo hacia arriba para buscar el primer espacio libre.
        let y = tablero_celdas_vertical - 1;

        while (y >= 0) {
            let ficha = casillas_tablero[y][x].getFicha();
            if (!ficha) return y;
            y--;
        }
        return false;

    }

    function cambiarJugadorActual() {
        switch (current_player) {
            case 1: current_player++; break;
            case 2: current_player--; break;
        }
        redrawAll();

    }
    function escribirTurnoActual() {
        let distancia_al_borde = 25;
        let espacio_renglon = 3;
        let renglones = [];
        renglones[0] = "Es el turno del";
        renglones[1] = " jugador " + current_player;
        let text_position = "";
        let text_fill = "";
        let text_align = "";
        let font_size = 1.0 * window_width / 65;
        ctx.font = font_size + "pt Verdana";

        ctx.strokeStyle = "#222277FF";
        ctx.lineWidth = "1px";
        // ctx.strokeStyle = "black";
        // ctx.lineWidth = 2;
        switch (current_player) {
            case 1:
                text_fill = jugador_1_color;
                text_position = { y: distancia_al_borde, x: distancia_al_borde };
                text_align = "left";
                break;
            case 2:
                text_fill = jugador_2_color;
                text_position = { y: distancia_al_borde, x: window_width - distancia_al_borde };
                text_align = "right";
                break;
            default:

                renglones[0] = "Ha ganado el ";
                renglones[1] = "jugador " + (current_player * -1);
                text_position = {
                    x: window_width / 2,
                    y: distancia_al_borde
                };
                text_align = "center";
                if (current_player == -1) text_fill = jugador_1_color;
                else text_fill = jugador_2_color;
                break;
        }
        ctx.textAlign = text_align;
        ctx.fillStyle = text_fill;
        for (let i = 0; i < renglones.length; i++) {
            text_position.y += font_size + (i * espacio_renglon);
            ctx.strokeText(renglones[i], text_position.x, text_position.y);
            ctx.fillText(renglones[i], text_position.x, text_position.y);

        }

    }


    //Regresa un objeto con la posicion en canvas, ignorando el margen hasta el canvas.
    function getPosicionEnCanvas(x, y) {
        let canvas_position = canvas.getBoundingClientRect();
        let canvas_x = x - canvas_position.left;
        let canvas_y = y - canvas_position.top;
        return {
            x: canvas_x,
            y: canvas_y
        }
    }
    function eliminarObjetoEnArray(objeto, array) {
        let index = array.indexOf(objeto);
        if (index >= 0) {
            return array.splice(index, 1);
        }
    }

    function actualizarUI(partida_empezada = false) {
        if (partida_empezada) {
            document.querySelector("#js-reset_game").classList.remove("hidden");
            document.querySelector("#js-opponent_selector").classList.add("hidden");
        } else {
            document.querySelector("#js-reset_game").classList.add("hidden");
            document.querySelector("#js-opponent_selector").classList.remove("hidden");
        }

    }

    /* Event Listenners */

    document.querySelector("#js-reset_game").addEventListener("click", startGame);

    document.querySelector("#js-vs_bot").addEventListener("click", () => {
        bot = new Bot(ctx, tablero_celdas_vertical, tablero_celdas_horizontal, fichas_necesarias_para_victoria);
        startGame();
    });
    document.querySelector("#js-vs_human").addEventListener("click", () => {
        bot = null;
        startGame();
    });
    document.querySelector("#js-change_rules").addEventListener("click", () => {
        let new_size_inputs = document.querySelectorAll(".js-size_tablero");
        let new_size = [];
        new_size[0] = parseInt(new_size_inputs[0].value);
        new_size[1] = parseInt(new_size_inputs[1].value);
        setTableroSize(new_size[0], new_size[1]);

        let new_fichas_necesarias = document.querySelector("#js-fichas_necesarias_para_victoria").value;
        new_fichas_necesarias = parseInt(new_fichas_necesarias);
        if (new_fichas_necesarias >= 3) {
            fichas_necesarias_para_victoria = new_fichas_necesarias
        } else {
            fichas_necesarias_para_victoria = DEFAULT_FICHAS_NECESARIAS_PARA_VICTORIA;
        }

        startGame();
    });

    document.querySelector("#js-set_default").addEventListener("click", () => {
        setTableroSize();
        fichas_necesarias_para_victoria = DEFAULT_FICHAS_NECESARIAS_PARA_VICTORIA;

        startGame();
    });

    canvas.addEventListener("mousedown", (e) => {

        //Debug
        // current_player = 1;
        //Fin Debug
        let click_position = getPosicionEnCanvas(e.clientX, e.clientY);

        let ficha = buscarFichaClickeada(click_position.x, click_position.y);

        if (ficha) {
            let pos_ficha = ficha.getPosition();
            distancia_desde_click_al_centro_de_ficha = {
                x: pos_ficha.x - click_position.x,
                y: pos_ficha.y - click_position.y
            }
            ficha_arrastrada = ficha;
            hay_ficha_en_movimiento = true;

        }
    });
    canvas.addEventListener("mousemove", (e) => {
        if (hay_ficha_en_movimiento) {
            let mouse_position = getPosicionEnCanvas(e.clientX, e.clientY);
            moverFichaClickeada(mouse_position.x, mouse_position.y);
        }
    });
    canvas.addEventListener("mouseup", () => {
        //Si una ficha estaba siendo arrastrada, revisa si fue jugada al soltarla.
        if (hay_ficha_en_movimiento) {
            actualizarUI(true);
            intentarjugada();
        }
        hay_ficha_en_movimiento = false;
        ficha_arrastrada = null;
    });
    canvas.addEventListener("mouseout", () => {
        hay_ficha_en_movimiento = false;
        ficha_arrastrada = null;
    });

    /* Inicio de llamado a funciones */
    setTableroSize();
    startGame();


});