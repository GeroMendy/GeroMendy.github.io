document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    let hero_parallax_change_values = [
        // { layerID: 0, esPorcentual: true, property: "translateY", ratio: 0 },
        { layerID: 1, property: "scale", ratio: 1.5 },
        { layerID: 2, esPorcentual: true, property: "translateY", ratio: -0.65 },
        { layerID: 3, esPorcentual: true, property: "translateY", ratio: -0.37 },
        { layerID: 4, property: "scale", ratio: -0.6 }
        // { layerID: 5, esPorcentual: true, property: "translateY", ratio: 0 }
    ];


    let hero_parallax = document.querySelector("#hero_parallax_principal");
    let parallax_layers = document.querySelectorAll(".parallax_layer");

    let hero_parallax_controller = new ParallaxController(parallax_layers, hero_parallax_change_values);

    let position_helper = document.querySelector("#position_helper");
    let is_parallax_fixed = true;
    let min_position_parallax;
    let max_position_parallax;
    let image_size = 0;

    let scroll = window.requestAnimationFrame;

    //Reajusta el div al tamaño de las imágenes
    function ajustarHeightParallax() {
        image_size = parallax_layers[0].clientHeight;
        min_position_parallax = image_size;
        max_position_parallax = image_size * 4;
        document.querySelector("#contenido_siguiente").style.margin = max_position_parallax + "px 0 0 0";

        //Vuelve a revisar el image_size en caso de que la barra de scroll le haya robado espacio.
        image_size = parallax_layers[0].clientHeight;
        hero_parallax.style.height = image_size + "px";
        ajustarScroll();
    }

    function ajustarScroll() {

        let rect = position_helper.getBoundingClientRect();

        if (is_parallax_fixed && rect.top < image_size) {

            hero_parallax.classList.add("js-parallax_absolute");
            hero_parallax.classList.remove("js-parallax_fixed");
            hero_parallax.style.top = max_position_parallax - image_size + "px";
            is_parallax_fixed = false;

        } else if (!is_parallax_fixed && rect.top > image_size + 1) {

            hero_parallax.classList.remove("js-parallax_absolute");
            hero_parallax.classList.add("js-parallax_fixed");
            hero_parallax.style.top = 0;
            is_parallax_fixed = true;

        }

        let pos_ratio = rect.top / max_position_parallax;
        pos_ratio = 1 - pos_ratio;
        changeParallaxValues(pos_ratio);
        scroll(ajustarScroll);
    }

    function changeParallaxValues(pos_ratio) {
        hero_parallax_controller.changeParallaxValues(pos_ratio);
    }

    window.addEventListener("resize", ajustarHeightParallax);

    ajustarHeightParallax();

});