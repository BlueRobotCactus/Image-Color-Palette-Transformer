// Get references to the DOM elements
const imageUpload = document.getElementById('image-upload');
const originalCanvas = document.getElementById('original-canvas');

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
    };

    img.src = URL.createObjectURL(file);
});

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