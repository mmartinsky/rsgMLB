var Jimp = require('jimp');

function modImage() {
    Jimp.read('http://mlb.mlb.com/assets/images/1/0/6/102773106/Angelsjerz_iksbc8u6.jpg', function (err, image) {
        if (err) {
            console.log("error");
            console.log(err);
        } else {
            Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then(function (font) {
                image.print(font, 10, 10, "HELLO WORLD");
                var file = "new_name." + image.getExtension();
                image.write(file, function (err) {
                    if (!err) {
                        console.log("success");
                    }
                })
            });
        }
    })
}

modImage();