document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const CANVAS_DEFAULT_COLOR = "#00DDAA33";
    const FICHAS_NECESARIAS_PARA_VICTORIA = 4;
    const TRANSPARENCIA_COLOR_FONDO = 0.4;

    let canvas = document.querySelector("#js-canvas");
    let ctx = canvas.getContext("2d");

    let tablero_celdas_horizontal = 7;
    let tablero_celdas_vertical = 6;
    let espacio_por_jugador = 0.15;

    let ditancia_entre_fichas_y_borde = 12;
    let tablero_pixel_width;
    let celda_pixel_size;

    let ficha_radio;

    let window_width = document.querySelector("#js-canvas_container").clientWidth;
    let window_height = document.querySelector("#js-canvas_container").clientHeight;

    let fichas_tablero = [];
    let jugador_1_fichas = [];
    let jugador_2_fichas = [];
    let current_player = -1;
    // let ultima_ficha_jugada = null;

    let jugador_1_color = "#FF8800FF";
    let jugador_2_color = "#2222FFFF";


    //Variable para mover la ficha manteniendo la distancia al centro.
    let hay_ficha_en_movimiento = false;
    let ficha_arrastrada = null;
    let distancia_desde_click_al_centro_de_ficha = {
        x: 0,
        y: 0
    };

    function startGame() {
        //Carga la matriz con 'espacios vacios'

        fichas_tablero = [];
        jugador_1_fichas = [];
        jugador_2_fichas = [];

        for (let y = 0; y < tablero_celdas_vertical; y++) {
            fichas_tablero[y] = [];
            // for (let x = 0; x < tablero_celdas_horizontal; x++) {
            //     fichas_tablero[y][x] = 0;
            // }
        }
        //Cantidad de fichas a dibujar para cada jugador.
        let fichas_por_jugador = parseInt((tablero_celdas_horizontal * tablero_celdas_vertical) / 2);

        //Inicializa el jugador
        current_player = parseInt(Math.random() * 2) + 1;

        let color = getCurrentPlayerBackgroundColor();

        clearCanvas(color);
        drawTablero();

        for (let ficha = 0; ficha < fichas_por_jugador; ficha++) {

            //Coloca las fichas en una pila desde abajo hacia arriba.
            let ficha_p1 = createFicha(ficha_radio + ditancia_entre_fichas_y_borde, window_height - ficha_radio - (ficha * 25) - ditancia_entre_fichas_y_borde, 1);
            let ficha_p2 = createFicha(window_width - ficha_radio - ditancia_entre_fichas_y_borde, window_height - ficha_radio - (ficha * 25) - ditancia_entre_fichas_y_borde, 2);

            ficha_p1.draw();
            ficha_p2.draw();

            jugador_1_fichas.push(ficha_p1);
            jugador_2_fichas.push(ficha_p2);

        }

        //En caso que la cantidad de fichas sea impar, da una mas al jugador inicial.
        if ((tablero_celdas_horizontal * tablero_celdas_vertical) % 2 != 0) {
            switch (current_player) {
                case 1:
                    let ficha_p1 = createFicha(ficha_radio + ditancia_entre_fichas_y_borde, window_height - ficha_radio - (fichas_por_jugador * 25) - ditancia_entre_fichas_y_borde, 1);
                    jugador_1_fichas.push(ficha_p1);
                    ficha_p1.draw();
                    break;
                case 2:
                    let ficha_p2 = createFicha(window_width - ficha_radio - ditancia_entre_fichas_y_borde, window_height - ficha_radio - (fichas_por_jugador * 25) - ditancia_entre_fichas_y_borde, 2);
                    jugador_2_fichas.push(ficha_p2);
                    ficha_p2.draw();
                    break;
            }
        }


    }

    function redrawAll() {
        let color = getCurrentPlayerBackgroundColor();
        clearCanvas(color);
        for (let y = 0; y < tablero_celdas_vertical; y++) {
            fichas_tablero[y] = [];
            for (let x = 0; x < tablero_celdas_horizontal; x++) {
                let ficha = fichas_tablero[y][x];
                if (ficha) {
                    ficha.draw();
                }
            }
        }
        drawTablero();

        jugador_1_fichas.forEach(ficha => {
            if (!ficha.estaDibujado()) ficha.draw();
        });
        jugador_2_fichas.forEach(ficha => {
            if (!ficha.estaDibujado()) ficha.draw();
        });
    }

    function clearCanvas(color = CANVAS_DEFAULT_COLOR) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        ctx.fillStyle = "#FFFFFFFF";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        jugador_1_fichas.forEach(ficha => {
            ficha.setFichaBorrada();
        });
        jugador_2_fichas.forEach(ficha => {
            ficha.setFichaBorrada();
        });

    }

    function createFicha(x = 0, y = 0, jugador = 0) {
        switch (jugador) {
            case 1:
                return new Token(ctx, x, y, ficha_radio, jugador_1_color, "#000000FF", 1);
            case 2:
                return new Token(ctx, x, y, ficha_radio, jugador_2_color, "#000000FF", 2);
        }
    }

    function drawTablero() {
        //DEBUG:

        ctx.strokeStyle = "black";
        ctx.lineWidth = "2";
        //Obtiene la mitad del espacio que queda libre, para ubicar el tablero en el centro.
        let espacio_pixel_por_jugador = (window_width - (celda_pixel_size * tablero_celdas_horizontal)) / 2;
        ctx.beginPath();
        for (let y = 0; y < tablero_celdas_vertical; y++) {
            for (let x = 0; x < tablero_celdas_horizontal; x++) {

                let rect_x = espacio_pixel_por_jugador + (x * celda_pixel_size);
                //Deja un espacio igual al tamaño de la celda para 'poner' la ficha
                let rect_y = celda_pixel_size + (y * celda_pixel_size);

                ctx.rect(rect_x, rect_y, celda_pixel_size, celda_pixel_size);
            }
        }
        ctx.stroke();

        document.querySelector("#js-canvas_container").style.height = (celda_pixel_size * (tablero_celdas_vertical + 2)) + "px";

        //Fin DEBUG
    }

    function buscarSecuenciaFichas(ultima_ficha_y, ultima_ficha_x, secuencia_size = FICHAS_NECESARIAS_PARA_VICTORIA) {

        let jugador = fichas_tablero[ultima_ficha_y][ultima_ficha_x].getJugador();

        let fichas_consecutivas = 0;
        let secuencia = [];

        //Revisa todo menos verticalmente.
        for (let y = -1; y < 2; y++) {

            for (let x = -secuencia_size + 1; x < ((secuencia_size * 2) - 1); x++) {
                let ficha = fichas_tablero[ultima_ficha_y + (y * x)][ultima_ficha_x + x];
                if (ficha && ficha.esJugador(jugador)) {
                    fichas_consecutivas++;
                    secuencia.push(ficha);
                    if (fichas_consecutivas == secuencia_size) return secuencia;
                } else {
                    fichas_consecutivas = 0;
                    secuencia = [];
                }
            }
        }
        //Revisa Verticalmente
        for (let y = -(secuencia_size); y < 0; y++) {
            let ficha = fichas_tablero[ultima_ficha_y + y][ultima_ficha_x]
            if (ficha && ficha.esJugador(jugador)) {
                fichas_consecutivas++;
                secuencia.push(ficha);
                if (fichas_consecutivas == secuencia_size) return secuencia;
            } else {
                fichas_consecutivas = 0;
                secuencia = [];
            }

        }
        return false;
    }

    //Cambia el color de fondo a una version transparente del color del jugador.
    function getCurrentPlayerBackgroundColor() {
        let color;
        switch (current_player) {
            case 1: color = jugador_1_color; break;
            case 2: color = jugador_2_color; break;
        }
        color = hexaToRgb(color);
        color[3] *= TRANSPARENCIA_COLOR_FONDO;
        color = rgbToHexa(color[0], color[1], color[2], color[3]);
        return color;
    }

    function setTableroSize(new_width = tablero_celdas_horizontal, new_height = tablero_celdas_vertical) {

        if (new_width > 0 && new_height > 0) {
            tablero_celdas_horizontal = new_width;
            tablero_celdas_vertical = new_height;
        }

        tablero_pixel_width = window_width * (1 - (2 * espacio_por_jugador));
        celda_pixel_size = tablero_pixel_width / tablero_celdas_horizontal;

        if (celda_pixel_size * (tablero_celdas_vertical + 1) > window_height) {
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

    /* Event Listenners */

    document.querySelector("#js-reset_game").addEventListener("click", startGame);

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
        hay_ficha_en_movimiento = false;
    });
    canvas.addEventListener("mouseout", () => {
        hay_ficha_en_movimiento = false;
    });





    /* Inicio de llamado a funciones */
    setTableroSize();
    startGame();























































    // let icono_player_1 = new Figura(
    //     [
    //         [15,5],
    //         [25,5],
    //         [25,55],
    //         [15,55],
    //         [15,17],
    //         [7,25],
    //         [7,13]
    //     ]
    // );
    // let icono_player_2 = new Figura(
    //     [
    //         [5,5],
    //         [25,5],
    //         [25,20],
    //         [10,20],
    //         [10,25],
    //         [25,25],
    //         [25,30],
    //         [5,30],
    //         [5,15],
    //         [20,15],
    //         [20,10],
    //         [5,10]
    //     ]
    // );
    // let icono_victoria = new Figura(
    //     [

    //     ]
    // );


});