class ParallaxController {

    layers;
    transforms;
    /*
    transform = {
        layerID : [pos_layer_en_array],
        property : [string = propiedad_de_transform],
        esPorcentual : bool (propiedad_de_transform_se_maneja_en_porcentajes),
        ratio : [double cambio_que_sufre_propiedad]
    }
    */

    constructor(layers = [], transforms = []) {
        this.layers = layers;
        this.transforms = transforms;
    }

    changeParallaxValues(pos_ratio) {

        let new_value;
        let new_property;

        this.transforms.forEach(tr => {
            let layer = this.layers[tr.layerID];
            if (!layer) return;

            if (tr.esPorcentual) {

                new_value = tr.ratio * pos_ratio * 100;
                new_property = tr.property + "(" + new_value + "%)";

            } else {

                new_value = 1 + tr.ratio * pos_ratio;
                new_property = tr.property + "(" + new_value + ")";

            }

            layer.style.transform = new_property;

        });
    }

}