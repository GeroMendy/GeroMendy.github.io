class Casilla {

    context;
    x;
    y;
    width;
    height;
    image;
    ficha = null;

    constructor(context, x = 0, y = 0, width = 0, height = 0, image = null) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }

    /* Setters: */

    setPosition(new_x = this.x, new_y = this.y) {
        this.x = new_x;
        this.x = new_y;
    }
    setSize(width = this.width, height = this.height) {
        this.width = width;
        this.height = height;
    }
    setImage(new_image = this.image) {
        this.image = new_image;
    }
    setFicha(ficha = this.ficha) {
        this.ficha = ficha;
        if (ficha) {
            let pos = this.getCentralPoint();
            ficha.setPosition(pos.x, pos.y);
        }
    }

    /* Fin Setters */
    /* Getters: */

    getPosition() {
        return {
            x: this.x,
            y: this.y
        }
    }
    getSize() {
        return {
            width: this.width,
            height: this.height
        }
    }
    getCentralPoint() {
        let pos = this.getPosition();
        let size = this.getSize();
        return {
            x: pos.x + (size.width / 2),
            y: pos.y + (size.height / 2),
        }
    }
    getImage() {
        return this.image;
    }
    getJugador() {
        let ficha = this.getFicha();
        if (this.ficha) return ficha.jugador;
        return -1;
    }
    getFicha() {
        return this.ficha;
    }
    /* Fin Getters */

    draw() {
        let ficha = this.getFicha();
        if (ficha) ficha.draw();
        let image = this.getImage();
        let pos = this.getPosition();
        let size = this.getSize();
        if (image) this.context.drawImage(image, pos.x, pos.y,image.width,image.height);


    }


}