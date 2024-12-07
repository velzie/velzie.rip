const pause = "⏸";
const play = "▶";
pausebutton.innerText = play;
const ytplayercont = document.getElementById("ytplayer-container");
let focusedcurrently = false;
window.addEventListener("blur", () => {
	if (focusedcurrently) {
		setTimeout(() => ytframe.blur(), 10);
		if (pausebutton.innerText == play) pausebutton.innerText = pause;
		else pausebutton.innerText = play;
	}
});
ytplayercont.onmouseenter = () => (focusedcurrently = true);
ytplayercont.onmouseleave = () => (focusedcurrently = false);

// webgl... so coolll
const canvas = document.createElement("canvas");
canvas.id = "bgcanvas";
document.body.append(canvas);

addEventListener("flamethrower:router:end", () => {
	setTimeout(() => {
		// persist canvas through route changes
		document.body.append(canvas);
	}, 20);
});

const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

const BASE_VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 texCoords;

  void main() {
    texCoords = (position + 1.0) / 2.0;
    texCoords.y = 1.0 - texCoords.y;
    gl_Position = vec4(position, 0, 1.0);
  }
`;

const BASE_FRAGMENT_SHADER = await fetch("/static/fragment.glsl").then((res) =>
	res.text(),
);

let width = window.innerWidth;
let height = window.innerHeight;

const image = new Image();
image.crossOrigin = "Anonymous";
image.src =
	// "pfp.png"
	`https://picsum.photos/${width}/${height}`;
// "water.jpg";
canvas.width = width;
canvas.height = height;

image.onload = function () {
	// let width = 1918
	// let height = 1440
	// ctx.drawImage(image, 0, 0, width, height);
	// let data = ctx.getImageData(0, 0, image.width, image.height).data;
	// console.log(data);
	// const thresh = Array.from(data).reduce((sum, value) => sum + value, 0) / (width * height * 4) / 2;
	// console.log(thresh);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, BASE_VERTEX_SHADER);
	gl.compileShader(vertexShader);

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, BASE_FRAGMENT_SHADER);
	gl.compileShader(fragmentShader);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	gl.useProgram(program);

	const VERTICES = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]);

	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

	const positionLocation = gl.getAttribLocation(program, "position");
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(positionLocation);

	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	const timeLocation = gl.getUniformLocation(program, "uTime");
	const timeLocation2 = gl.getUniformLocation(program, "uTime2");

	const thresholdLocation = gl.getUniformLocation(program, "uThreshold");

	gl.uniform1f(thresholdLocation, 52);
	function render() {
		gl.uniform1f(timeLocation, performance.now() / 1000);

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		requestAnimationFrame(render);
	}

	setInterval(() => {
		gl.uniform1f(timeLocation2, performance.now() / 1000);
	}, 150);

	requestAnimationFrame(render);
};

// let refresh;
// // Placeholder image
// const image = new Image();
// image.src = '/water.jpg'; // 1x1 pixel transparent gif
// image.onload = () => {
//   const width = 1918; // Change these dimensions as needed
//   const height = 1440;
//   canvas.width = width;
//   canvas.height = height;
//
//   ctx.drawImage(image, 0, 0, width, height);
//   const imageData = ctx.getImageData(0, 0, width, height);
//   const data = imageData.data;
//
//   const newImageData = ctx.createImageData(width, height);
//   const newData = newImageData.data;
//
//   const prob = 0.1;
//
//
//
//   const thresh = Array.from(data).reduce((sum, value) => sum + value, 0) / (width * height * 4) / 2;
//
//   refresh = function refresh() {
//     for (let i = 0; i < newData.length; i++) {
//       newData[i] = 0;
//     }
//     let noiseMask = new Array(width * height).fill(0).map(() => Math.random() < prob);
//     let clusteredNoiseMask = gaussianFilter(noiseMask, width, height, 1);
//
//
//     for (let j = 0; j < height; j++) {
//       for (let i = 0; i < width; i++) {
//         const index = (i + j * width) * 4;
//         let brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
//
//         brightness += Math.random() * 10 - 5;
//         if (brightness > thresh && clusteredNoiseMask[i + j * width]) {
//           let a = 255 - (brightness - thresh);
//           newData[index] = 255;     // R
//           newData[index + 1] = a - 200;   // G
//           newData[index + 2] = a; // B
//           newData[index + 3] = 255; // A
//         } else {
//           newData[index + 3] = 255;
//         }
//       }
//     }
//
//     ctx.putImageData(newImageData, 0, 0);
//   }
//   setInterval(refresh, 100);
// };
//
//
//
// function gaussianFilter(noiseMask, width, height, sigma) {
//   const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
//   const kernel = new Array(kernelSize).fill(0).map((_, x) =>
//     new Array(kernelSize).fill(0).map((_, y) =>
//       Math.exp(-((x - kernelSize / 2) ** 2 + (y - kernelSize / 2) ** 2) / (2 * sigma ** 2))
//     )
//   );
//
//   const output = new Array(noiseMask.length).fill(0);
//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       let sum = 0;
//       let weight = 0;
//       for (let ky = 0; ky < kernelSize; ky++) {
//         for (let kx = 0; kx < kernelSize; kx++) {
//           const iy = y + ky - Math.floor(kernelSize / 2);
//           const ix = x + kx - Math.floor(kernelSize / 2);
//           if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
//             const idx = ix + iy * width;
//             sum += noiseMask[idx] * kernel[ky][kx];
//             weight += kernel[ky][kx];
//           }
//         }
//       }
//       output[x + y * width] = sum / weight > 0.1;
//     }
//   }
//   return output;
// }
