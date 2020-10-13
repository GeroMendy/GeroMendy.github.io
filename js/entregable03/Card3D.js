class Card3D {
    max_degrees;
    card;
    card_container;
    is_moving = true;
    timeoutID = null;
    last_transform_values = {
        x: 0,
        y: 0,
        deg: 0
    };
    constructor(max_degrees = 90, card, card_container) {

        this.max_degrees = max_degrees;
        this.card = card;
        this.card_container = card_container;
        setInterval(() => {
            if (Math.floor(this.last_transform_values.deg) != 0 && !this.is_moving) {
                this.last_transform_values.deg--;
                this.setTransformData(this.last_transform_values.y, this.last_transform_values.x, this.last_transform_values.deg);
            }
        }, 1000 / 60);
    }
    setMoving(is_moving = this.is_moving) {
        this.is_moving = is_moving;
    }
    isThisCard(card) {
        return this.card == card;
    }
    resetCard() {
        this.card.style.transform = "";
    }
    setTransformData(y, x, deg) {
        this.card.style.transform = "rotate3d(" + -y + "," + x + "," + 0 + "," + deg + "deg)";
    }

    updateCard(mouse_x, mouse_y) {

        let centro = {
            x: this.card.clientWidth / 2,
            y: this.card.clientHeight / 2
        }

        let new_ratios = {
            y: ((mouse_y - centro.y) / centro.y),
            x: ((mouse_x - centro.x) / centro.x)
        }
        let distancia_al_centro = Math.sqrt(Math.pow(new_ratios.y, 2) + Math.pow(new_ratios.x, 2));

        let new_degrees = this.max_degrees * distancia_al_centro;
        this.last_transform_values.deg = new_degrees;
        this.last_transform_values.x = new_ratios.x;
        this.last_transform_values.y = new_ratios.y;

        this.setTransformData(new_ratios.y, new_ratios.x, new_degrees);

    }
    animateResetCard() {
        this.is_moving = false;
    }


}