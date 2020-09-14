document.addEventListener("DOMContentLoaded", () => {


    "use strict";

    let pixelPerfectEnabled = true;
    let is_image_uploaded = false;
    let image_upload_input = document.querySelector("#js-image_upload_input");
    let canvas = document.querySelector("#js-canvas");
    let ctx = canvas.getContext("2d");

    let image_backup_copy;

    const DEFAULT_WIDTH = canvas.clientWidth;
    const DEFAULT_HEIGHT = canvas.clientHeight;
    const DEFAULT_COLOR = '#FFFFFFFF';

    returnCanvasToDefault();

    image_upload_input.onchange = (e) => {

        //Toma solo el primer archivo, en caso que se hayan cargados mas de uno.
        let file = e.target.files[0];

        let reader = new FileReader();
        reader.readAsDataURL(file);

        //Reader, al terminar the cargar el archivo.
        reader.onload = (reader_e) => {
            let content = reader_e.target.result;

            let image = new Image();
            image.src = content;

            image.onload = () => {

                drawImage(image);

            }
        }

    }

    document.querySelector("#js-image_upload_button").addEventListener("click", () => {

        image_upload_input.click();

    });

    function drawImage(image) {
        // cambiarHerramienta();
        createImageBackUp(image);

        //Elimina todo contenido previo del canvas 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (pixelPerfectEnabled && image.height < (DEFAULT_HEIGHT / 2) && image.width < (DEFAULT_WIDTH / 2)) {
            //Cambia el tamaño del canvas para que sea igual a la imagen (imagen sin tamaño modificado).
            resizeCanvas(image.height, image.width);
            //Dibuja la imagen para poder obtener 'image.data' de la imagen original
            ctx.drawImage(image, 0, 0, image.width, image.height);

            let original_image_data = ctx.getImageData(0, 0, image.width, image.height);

            //Guarda las dimensiones originales para utilizar como base para modificar el tamaño manteniendo 'pixel perfect'
            let original_height = image.height;
            let original_width = image.width;

            resizeImage(image);
            resizeCanvas(image.height, image.width);

            //Dibuja la imagen para poder obtener 'image.data' de la imagen con tamaño modificado.
            ctx.drawImage(image, 0, 0, image.width, image.height);

            let resized_image_data = ctx.getImageData(0, 0, image.width, image.height);

            resizeImageMaintainingPixelPerfect(original_image_data, resized_image_data, original_height, original_width);

            ctx.putImageData(resized_image_data, 0, 0);

        } else {

            //Modifica el tamaño de la imagen de la manera mas simple para dibujarla.
            resizeImage(image);
            //Cambia el tamaño del canvas para que sea igual a la imagen (imagen con tamaño modificado).
            resizeCanvas(image.height, image.width);

            ctx.drawImage(image, 0, 0, image.width, image.height);
        }

        is_image_uploaded = true;
        document.querySelector("#js-reset_image").removeAttribute("disabled");

    }

    function resizeImage(image) {

        let new_width = image.width;
        let new_height = image.height;
        let aspectRatio = ((new_height * 1.0) / new_width);

        if (aspectRatio > ((DEFAULT_HEIGHT * 1.0) / DEFAULT_WIDTH)) {
            new_height = DEFAULT_HEIGHT;
            new_width = DEFAULT_HEIGHT * 1 / aspectRatio;
        } else {
            new_width = DEFAULT_WIDTH;
            new_height = DEFAULT_WIDTH * aspectRatio;
        }
        image.width = new_width;
        image.height = new_height;

    }

    function resizeImageMaintainingPixelPerfect(original_image_data, resized_image_data, height, width) {

        let ratio = (1.0 * DEFAULT_HEIGHT) / height;
        let new_width = width * ratio;
        let new_height = height * ratio;

        //Recorre la data al revez para evitar 'pisar' los pixeles que debe copiar
        for (let y = new_height - 1; y >= 0; y--) {
            for (let x = new_width - 1; x >= 0; x--) {

                let old_byte = (Math.floor(x / ratio) + ((Math.floor(y / ratio)) * width)) * 4;

                let new_pixel = [original_image_data.data[old_byte], original_image_data.data[old_byte + 1], original_image_data.data[old_byte + 2], original_image_data.data[old_byte + 3]];
                setPixel(resized_image_data.data, new_width, x, y, new_pixel);

            }
        }
    }

    function getBloqueDeBytesCercanos(x, y, width, height, rango = 0) {

        let bytes = [];
        let cant_bytes = 0;

        //Obtiene todos los bytes a una distancia 'rango' del original.
        //Salta al siguiente posible byte cuando llega a uno de los bordes del canvas.
        for (let bloque_y = y - rango; bloque_y <= y + rango; bloque_y++) {

            if ((bloque_y < height) && (bloque_y >= 0)) {
                for (let bloque_x = x - rango; bloque_x <= x + rango; bloque_x++) {

                    if ((bloque_x < width) && (bloque_x >= 0)) {
                        bytes[cant_bytes] = ((bloque_x + (bloque_y * width)) * 4);
                        cant_bytes++;
                    }
                }

            }
        }
        return bytes;

    }

    function setPixel(image, width, x, y, new_pixel = [], rango = 0) {
        let bytes = getBloqueDeBytesCercanos(x, y, width, canvas.height, rango);
        new_pixel.forEach(e => {
            if (e > 255) e = 255;
            else if (e < 0) e = 0;
        });
        bytes.forEach(byte => {
            image[byte] = new_pixel[0];
            image[byte + 1] = new_pixel[1];
            image[byte + 2] = new_pixel[2];
            image[byte + 3] = new_pixel[3];
        });
    }

    function createImageBackUp(image) {
        image_backup_copy = new Image();
        image_backup_copy.src = image.src;
    }

    function resizeCanvas(new_height = DEFAULT_HEIGHT, new_width = DEFAULT_WIDTH) {
        canvas.height = new_height;
        canvas.width = new_width;
    }

    function returnCanvasToDefault() {
        // cambiarHerramienta();
        document.querySelector("#js-reset_image").setAttribute("disabled", "true");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        is_image_uploaded = false;
        resizeCanvas();
        ctx.fillStyle = DEFAULT_COLOR;
        ctx.fillRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        image_backup_copy = null;
        aplicarFiltro();
    }

    //Filtros:

    //Transforma RGB a 255 - RGB
    function aplicarFiltroNegativo(imageData, width, height) {

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                let byte = (x + (y * width)) * 4;
                let new_red = 255 - imageData[byte];
                let new_green = 255 - imageData[byte + 1];
                let new_blue = 255 - imageData[byte + 2];
                let new_alpha = imageData[byte + 3];

                setPixel(imageData, width, x, y, [new_red, new_green, new_blue, new_alpha]);

            }
        }
    }
    //Transforma RGB a RGB+20%.
    function aplicarFiltroBrillo(imageData, width, height, brillo = 1.2) {

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let byte = (x + (y * width)) * 4;

                let new_red = imageData[byte];
                let new_green = imageData[byte + 1];
                let new_blue = imageData[byte + 2];
                let new_alpha = imageData[byte + 3];

                let pixel_hsl = rgbToHsl(new_red, new_green, new_blue);
                pixel_hsl[2] *= 1.2;
                let new_pixel_RGBA = hslToRgb(pixel_hsl[0], pixel_hsl[1], pixel_hsl[2]);
                new_pixel_RGBA[3] = new_alpha;

                setPixel(imageData, width, x, y, new_pixel_RGBA);
            }
        }
    }
    //Transforma promedio_RGB<=limite a colorA y promedio_RGB>limite a colorB 
    function aplicarFiltroBinarizacion(imageData, width, height, colorA = [0, 0, 0, 255], colorB = [255, 255, 255, 255], luminosidad_limite = null) {

        if (!luminosidad_limite || luminosidad_limite == "") {

            let promedio_imagen = getPromedioImagen(imageData, width, height);
            luminosidad_limite = (promedio_imagen[0] + promedio_imagen[1] + promedio_imagen[2]) / 3;

        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let byte = (x + (y * width)) * 4;

                let promedio_pixel = (imageData[byte] + imageData[byte + 1] + imageData[byte + 2]) / 3
                let new_pixel_RGB = colorA;

                if (promedio_pixel > luminosidad_limite) {
                    new_pixel_RGB = colorB;
                }
                new_pixel_RGB[3] = imageData[byte + 3];

                setPixel(imageData, width, x, y, new_pixel_RGB);
            }
        }
    }
    //Utilizando los sig valores:
    //Red = (R * .393) + (G *.769) + (B * .189)
    //Green = (R * .349) + (G *.686) + (B * .168)
    //Blue = (R * .272) + (G *.534) + (B * .131)
    function aplicarFiltroSepia(imageData, width, height) {

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let byte = (x + (y * width)) * 4;

                let old_red = imageData[byte];
                let old_green = imageData[byte + 1];
                let old_blue = imageData[byte + 2];

                let new_red = Math.floor((old_red * 0.393) + (old_green * 0.769) + (old_blue * 0.189));
                let new_green = Math.floor((old_red * 0.349) + (old_green * 0.686) + (old_blue * 0.168));
                let new_blue = Math.floor((old_red * 0.272) + (old_green * 0.534) + (old_blue * 0.131));
                let new_alpha = imageData[byte + 3];

                setPixel(imageData, width, x, y, [new_red, new_green, new_blue, new_alpha]);
            }

        }
    }
    function aplicarFiltroSaturacion(imageData, width, height, nueva_saturacion = 1.2) {

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let byte = (x + (y * width)) * 4;

                let red = imageData[byte];
                let green = imageData[byte + 1];
                let blue = imageData[byte + 2];
                let alpha = imageData[byte + 3];

                let hsl_values = rgbToHsl(red, green, blue);

                //Aumenta la saturacion en *nueva_saturacion.
                hsl_values[1] = hsl_values[1] * nueva_saturacion
                let rgba_values = hslToRgb(hsl_values[0], hsl_values[1], hsl_values[2]);
                rgba_values[3] = alpha;

                setPixel(imageData, width, x, y, rgba_values);
            }

        }
    }

    function aplicarFiltroBlur(imageData, width, height, rango_blur = 4) {

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                let rgba_values = [0, 0, 0, 0];
                let bytes = getBloqueDeBytesCercanos(x, y, width, height, rango_blur);

                bytes.forEach(byte => {
                    rgba_values[0] += imageData[byte];
                    rgba_values[1] += imageData[byte + 1];
                    rgba_values[2] += imageData[byte + 2];
                });

                rgba_values[0] /= bytes.length;
                rgba_values[1] /= bytes.length;
                rgba_values[2] /= bytes.length;
                rgba_values[3] = imageData[((x + (y * width)) * 4) + 3]

                setPixel(imageData, width, x, y, rgba_values);
            }

        }

    }
    // function aplicarFiltroBinarizacionConMatiz(imageData, width, height) {


    //     let last_gris = 0;
    //     for (let y = 0; y < height; y++) {
    //         for (let x = 0; x < width; x++) {
    //             let byte = (x + (y * width)) * 4;

    //             let promedio_RGB = (imageData[byte] + imageData[byte + 1] + imageData[byte + 2]) / 3
    //             let new_valueRGB;

    //             if (promedio_RGB <= 70) {
    //                 new_valueRGB = 0;
    //             } else if (promedio_RGB > 155) {
    //                 new_valueRGB = 255;
    //             } else {
    //                 if (last_gris == 0) {
    //                     new_valueRGB = 255;
    //                     last_gris++;
    //                 } else {
    //                     new_valueRGB = 0;
    //                     last_gris--;
    //                 }
    //             }

    //             let new_alpha = imageData[byte + 3];

    //             setPixel(imageData, width, x, y, new_valueRGB, new_valueRGB, new_valueRGB, new_alpha);
    //         }
    //     }
    // }

    function getPromedioImagen(imageData, width, height) {
        let values_RGB = [0, 0, 0];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let byte = (x + (y * width)) * 4;
                // let real_value = 255/imageData[byte+3];

                values_RGB[0] += imageData[byte];
                values_RGB[1] += imageData[byte + 1];
                values_RGB[2] += imageData[byte + 2];
            }
        }
        values_RGB[0] = values_RGB[0] / (width * height);
        values_RGB[1] = values_RGB[1] / (width * height);
        values_RGB[2] = values_RGB[2] / (width * height);

        return values_RGB;

    }

    function downloadCanvasAsImage() {

        let data = canvas.toDataURL('image/png');
        let download_button = document.querySelector("#js-download_button");

        //Descarga la imagen en lugar de apuntar a ella.
        data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

        download_button.href = data;
        //download_button.click();
    }

    function aplicarFiltro(filtro = 6) {
        hideFilterMenus();

        if (!is_image_uploaded) return;
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let width = canvas.width;
        let height = canvas.height;
        switch (filtro) {
            case 0:
                aplicarFiltroNegativo(imageData.data, width, height);
                break;

            case 1:
                aplicarFiltroBrillo(imageData.data, width, height);
                break;

            case 2:
                document.querySelector("#js-menu_filtro_binarizacion").classList.remove("hidden");
                break;

            case 3:
                aplicarFiltroSepia(imageData.data, width, height);
                break;

            case 4:
                document.querySelector("#js-menu_filtro_saturacion").classList.remove("hidden");
                break;
            case 5:
                document.querySelector("#js-menu_filtro_blur").classList.remove("hidden");
                break;
        }
        ctx.putImageData(imageData, 0, 0);
    }
    function cambiarHerramienta(herramienta = 0) {
        setToolsOff();
        switch (herramienta) {
            case 1:
                setPencilOn();
                cambiarColorLapiz();
                changeWidth();
                break;

            case 2:
                setPencilOn();
                cambiarColorLapiz("#FFFFFF");
                changeWidth(10);
                break;
        }
    }

    function hideFilterMenus() {
        let menus = document.querySelectorAll(".js-hidden_filter_menu");
        menus.forEach(m => {
            m.classList.add("hidden");
        });
    }
    function setToolsOff() {
        setPencilOff();
    }
    let botones_filtro = document.querySelectorAll(".js-filtro");

    for (let num_filtro = 0; num_filtro < botones_filtro.length; num_filtro++) {
        botones_filtro[num_filtro].addEventListener("click", () => {

            aplicarFiltro(num_filtro);

        });
    }
    let opciones_toolbar = document.querySelectorAll(".js-toolbar_item");
    for (let num_tool = 0; num_tool < opciones_toolbar.length; num_tool++) {
        opciones_toolbar[num_tool].addEventListener("click", () => {

            cambiarHerramienta(num_tool);

        });
    }
    document.querySelector("#js-reset_image").addEventListener("click", () => {
        if (is_image_uploaded) drawImage(image_backup_copy);
    });

    document.querySelector("#js-new_canvas").addEventListener("click", returnCanvasToDefault);

    document.querySelector("#js-boton_confirmar_binarizacion").addEventListener("click", () => {

        let luminosidad_limite = document.querySelector("#js-input_luminosidad_filtro_binario").value;
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let colores = document.querySelectorAll(".js-color_filtro_binarizacion");
        let colorA = hexaToRgb(colores[0].value);
        colorA[3] = 255;
        let colorB = hexaToRgb(colores[1].value);
        colorB[3] = 255;
        aplicarFiltroBinarizacion(imageData.data, canvas.width, canvas.height, colorA, colorB, luminosidad_limite);
        ctx.putImageData(imageData, 0, 0);
    });
    document.querySelector("#js-boton_confirmar_saturacion").addEventListener("click", () => {

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let saturacion = document.querySelector("#js-valor_saturacion_filtro_saturacion").value;
        saturacion = (saturacion / 100) + 1;
        aplicarFiltroSaturacion(imageData.data, canvas.width, canvas.height, saturacion);
        ctx.putImageData(imageData, 0, 0);
    });

    document.querySelector("#js-boton_confirmar_blur").addEventListener("click", () => {

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let rango_blur = document.querySelector("#js-rango_pixeles_filtro_blur").value;
        rango_blur *= 1.0;
        aplicarFiltroBlur(imageData.data, canvas.width, canvas.height, rango_blur);
        ctx.putImageData(imageData, 0, 0);
    });
    
    document.querySelector("#js-download_button").addEventListener("click", downloadCanvasAsImage);

});