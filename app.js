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
const checkboxes = [
    document.getElementById('checkbox1'),
    document.getElementById('checkbox2'),
    document.getElementById('checkbox3'),
    document.getElementById('checkbox4'),
    document.getElementById('checkbox5'),
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

        const oCtx = originalCanvas.getContext('2d');

        // Adjust canvas size based on the container width
        const maxWidth = originalCanvas.parentElement.clientWidth;
        const scaleFactor = maxWidth / img.width;
        const newWidth = img.width * scaleFactor;
        const newHeight = img.height * scaleFactor;

        originalCanvas.width = newWidth;
        originalCanvas.height = newHeight;

        // Display the original image
        oCtx.drawImage(img, 0, 0, newWidth, newHeight);

        // Automatically process the image after loading
        processImage();
    };

    img.src = URL.createObjectURL(file);
});

// Keep automatic processing on palette changes
colorInputs.forEach(input => {
    input.addEventListener('input', function() {
        if (imgLoaded) {
            processImage();
        }
    });
});

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (imgLoaded) {
            processImage();
        }
    });
});

function processImage() {
    // Get the selected colors based on the checkboxes
    const selectedColors = [];
    for (let i = 0; i < colorInputs.length; i++) {
        if (checkboxes[i].checked) {
            selectedColors.push(hexToRgb(colorInputs[i].value));
        }
    }
    // If no colors are selected, alert the user and exit the function
    if (selectedColors.length === 0) {
        alert('Please select at least one color.');
        return;
    }

    // Process and display the transformed image
    const oCtx = originalCanvas.getContext('2d');
    const pCtx = processedCanvas.getContext('2d');

    // Match the processed canvas size to the original canvas
    processedCanvas.width = originalCanvas.width;
    processedCanvas.height = originalCanvas.height;

    // Get image data
    const imageData = oCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const data = imageData.data;

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
        const pixelColor = {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        };

        // Find the closest color in the palette
        let closestColor = selectedColors[0];
        let minDistance = colorDistance(pixelColor, selectedColors[0]);

        for (let j = 1; j < selectedColors.length; j++) {
            const dist = colorDistance(pixelColor, selectedColors[j]);
            if (dist < minDistance) {
                minDistance = dist;
                closestColor = selectedColors[j];
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