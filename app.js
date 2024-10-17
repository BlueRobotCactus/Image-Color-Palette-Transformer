// Get references to the DOM elements
const imageUpload = document.getElementById('image-upload');
const colorInputs = [
    document.getElementById('color1'),
    document.getElementById('color2'),
    document.getElementById('color3'),
    document.getElementById('color4'),
    document.getElementById('color5'),
];
const checkboxes = [
    document.getElementById('checkbox1'),
    document.getElementById('checkbox2'),
    document.getElementById('checkbox3'),
    document.getElementById('checkbox4'),
    document.getElementById('checkbox5'),
];
const originalCanvas = document.getElementById('original-canvas');
const processedCanvas = document.getElementById('processed-canvas');
const downloadBtn = document.getElementById('download-btn');

let img = new Image();
let imgLoaded = false;
let processedImageDataURL = ''; // Store the full-size processed image data

// Event listener for image upload
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    img = new Image();

    img.onload = function() {
        imgLoaded = true;

        // Set canvas dimensions to match the original image for full-resolution processing
        const oCtx = originalCanvas.getContext('2d');
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        oCtx.drawImage(img, 0, 0);

        // Process the image at full resolution
        processImage();
    };

    img.src = URL.createObjectURL(file);
});

// Event listeners for palette changes
[...colorInputs, ...checkboxes].forEach(element => {
    element.addEventListener('input', function() {
        if (imgLoaded) {
            processImage();
        }
    });
});

// Download button event listener
downloadBtn.addEventListener('click', function() {
    if (!processedImageDataURL) {
        alert('Please process an image first.');
        return;
    }

    const link = document.createElement('a');
    link.href = processedImageDataURL;
    link.download = 'transformed-image.png';

    if (typeof link.download === 'undefined') {
        window.open(link.href, '_blank');
    } else {
        link.click();
    }
});

function processImage() {
    const selectedColors = getSelectedColors();

    if (selectedColors.length === 0) {
        alert('Please select at least one color.');
        return;
    }

    // Create an off-screen canvas at full size
    const fullSizeCanvas = document.createElement('canvas');
    const fullSizeCtx = fullSizeCanvas.getContext('2d');
    fullSizeCanvas.width = img.width;
    fullSizeCanvas.height = img.height;
    fullSizeCtx.drawImage(img, 0, 0);

    // Process the image
    const imageData = fullSizeCtx.getImageData(0, 0, img.width, img.height);
    processImageData(imageData.data, selectedColors);
    fullSizeCtx.putImageData(imageData, 0, 0);

    // Store the full-size image data URL
    processedImageDataURL = fullSizeCanvas.toDataURL('image/png');

    // Display the scaled-down image
    displayProcessedImage(fullSizeCanvas);
}

function getSelectedColors() {
    const colors = [];
    for (let i = 0; i < colorInputs.length; i++) {
        if (checkboxes[i].checked) {
            colors.push(hexToRgb(colorInputs[i].value));
        }
    }
    return colors;
}

function processImageData(data, selectedColors) {
    for (let i = 0; i < data.length; i += 4) {
        const pixelColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
        const closestColor = findClosestColor(pixelColor, selectedColors);
        data[i] = closestColor.r;
        data[i + 1] = closestColor.g;
        data[i + 2] = closestColor.b;
    }
}

function findClosestColor(pixelColor, palette) {
    let closestColor = palette[0];
    let minDistance = colorDistance(pixelColor, palette[0]);

    for (let i = 1; i < palette.length; i++) {
        const dist = colorDistance(pixelColor, palette[i]);
        if (dist < minDistance) {
            minDistance = dist;
            closestColor = palette[i];
        }
    }
    return closestColor;
}

function displayProcessedImage(fullSizeCanvas) {
    const pCtx = processedCanvas.getContext('2d');

    const maxDisplayWidth = Math.min(window.innerWidth * 0.8, img.width);
    const scaleFactor = maxDisplayWidth / img.width;
    const displayWidth = img.width * scaleFactor;
    const displayHeight = img.height * scaleFactor;

    processedCanvas.width = displayWidth;
    processedCanvas.height = displayHeight;

    pCtx.drawImage(fullSizeCanvas, 0, 0, img.width, img.height, 0, 0, displayWidth, displayHeight);
}

function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

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