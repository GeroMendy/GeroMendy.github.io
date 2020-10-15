class Carrusel {

    elem_carrusel;
    imgs = [];
    current_image;
    cant_images;

    constructor(elem_carrusel, imgs = []) {
        this.current_image = 0;
        this.imgs = imgs;
        this.cant_images = imgs.length;
        this.elem_carrusel = elem_carrusel;
        this.display();
    }
    display(image_pos_dif = 1) {
        this.current_image += image_pos_dif;
        if (this.current_image >= this.cant_images) this.current_image = 0;
        else if (this.current_image < 0) this.current_image = this.cant_images - 1;
        this.elem_carrusel.style.backgroundImage = "url(" + this.imgs[this.current_image] + ")";
    }


}