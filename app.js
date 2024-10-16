// Get references to the DOM elements
const imageUpload = document.getElementById('image-upload');
const originalCanvas = document.getElementById('original-canvas');
const processedCanvas = document.getElementById('processed-canvas');
const colorInputs = [
    document.getElementById('color1'),
    document.getElementById('color2'),
    document.getElementById('color3'),
    document.getElementById('color4'),
    document.getElementById('color5'),
];

let img = new Image();
let imgLoaded = false;

// Event listener for image upload
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    img = new Image();

    img.onload = function() {
        imgLoaded = true;

        // Display the original image
        const oCtx = originalCanvas.getContext('2d');
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        oCtx.drawImage(img, 0, 0);

        // Automatically process the image after loading
        processImage();
    };

    img.src = URL.createObjectURL(file);
});

function processImage() {
    const paletteHex = colorInputs.slice(0, 5).map(input => input.value);
    const palette = paletteHex.map(hexToRgb);

    // Process and display the transformed image
    const oCtx = originalCanvas.getContext('2d');
    const pCtx = processedCanvas.getContext('2d');
    processedCanvas.width = img.width;
    processedCanvas.height = img.height;

    // Get image data
    const imageData = oCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
        const pixelColor = {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        };

        // Find the closest color in the palette
        let closestColor = palette[0];
        let minDistance = colorDistance(pixelColor, palette[0]);

        for (let j = 1; j < palette.length; j++) {
            const dist = colorDistance(pixelColor, palette[j]);
            if (dist < minDistance) {
                minDistance = dist;
                closestColor = palette[j];
            }
        }

        // Set the pixel to the closest palette color
        data[i] = closestColor.r;
        data[i + 1] = closestColor.g;
        data[i + 2] = closestColor.b;
        // Alpha channel remains the same
    }

    // Put the modified data back and draw it
    pCtx.putImageData(imageData, 0, 0);
}

// Function to calculate the distance between two colors
function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

// Function to convert hex code to RGB
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(h => h + h).join('');
    }
    const bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}