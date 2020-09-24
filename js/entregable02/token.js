class Token {

    context;
    posX; posY;
    radio;
    stroke;
    fill;
    jugador;

    constructor(context, posX = 25, posY = 25, radio = 25, fill = "#FFFFFFFF", stroke = "#000000FF", jugador = 0) {
        this.context = context;
        this.posX = posX;
        this.posY = posY;
        this.radio = radio;
        this.fill = fill;
        this.jugador = jugador;
    }

    /* Setters: */

    setPosition(new_posX = this.posX, new_posY = this.posY) {
        this.posX = new_posX;
        this.posY = new_posY;
    }
    setRadio(new_radio = this.radio) {
        this.radio = new_radio;
    }
    setFill(new_fill = this.fill) {
        this.fill = new_fill;
    }
    setStroke(new_stroke = this.stroke) {
        this.stroke = new_stroke;
    }
    setJugador(jugador) {
        this.jugador = jugador;
    }

    /* Fin Setters */
    /* Getters: */

    getPosition() {
        return {
            x: this.posX,
            y: this.posY
        }
    }
    getRadio() {
        return this.radio;
    }
    getFill() {
        return this.fill;
    }
    getStroke() {
        return this.stroke;
    }
    getJugador() {
        return this.jugador;
    }
    /* Fin Getters */

    esJugador(jugador = -1) {
        return this.getJugador() == jugador;
    }
    //La distancia se calcula mediante el teorema de pitágoras cosiderando como catetos X1--->X2 y Y1--->Y2
    getDistanceFromCenter(point_posX, point_posY) {
        //Busca la distancia (por cada coordenada) del click al centro del circulo.
        let token_position = this.getPosition();
        let catetoX = token_position.x - point_posX;
        let catetoY = token_position.y - point_posY;
        //Hipotenusa^2 = catX^2 + catY^2
        let hipotenusa = Math.sqrt(Math.pow(catetoX, 2) + Math.pow(catetoY, 2));
        return hipotenusa;
    }
    //Determina si la ditancia entre el punto recibido y el punto central es menor a su radio
    isPointInsideToken(point_posX, point_posY) {

        return this.getDistanceFromCenter(point_posX, point_posY) < this.getRadio();
    }
    draw() {
        let pos = this.getPosition();
        this.context.beginPath();
        this.context.arc(pos.x, pos.y, this.getRadio(), 0, 2 * Math.PI);
        this.context.closePath();

        this.context.fillStyle = this.fill;

        this.context.strokeStyle = this.stroke;
        this.context.lineWidth = "2";

        this.context.fill();
        this.context.stroke();
    }

}