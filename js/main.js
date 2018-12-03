;(function() {

	const canvasList = document.getElementById(`canvas-list`);
	let canvasW;
	let canvasH;


	/**
	* 
	* @returns {undefined}
	*/
	const createSvgFromCanvas = function(canvas) {
		log('create svg from canvas...');
		var imgd = ImageTracer.getImgdata( canvas );
		
		// Synchronous tracing to SVG string
		var svgstr = ImageTracer.imagedataToSVG( imgd, { scale:5 } );
		
		// Appending SVG
		ImageTracer.appendSVGString( svgstr, 'svg-container' );

		const svgc = document.getElementById('svg-container');
		const svg = svgc.querySelector('svg');
		svg.setAttribute('viewBox', '0 0 5440 4080');
		svg.setAttribute('width', '544');
		svg.setAttribute('height', '408');
	};

	/**
	* create a canvas from an image
	* @returns {undefined}
	*/
	const createCanvasFromImage = function(img) {
		log('create canvas from image...');
		canvasW = img.width/3;
		canvasH = img.height/3;

		const inputCanvas = document.getElementById('input-canvas');
		inputCanvas.width = canvasW;
		inputCanvas.height = canvasH;
		const iCtx = inputCanvas.getContext("2d");
		
		log('draw input canvas...');
		iCtx.drawImage(img, 0, 0, canvasW, canvasH);
		const inputImgData = iCtx.getImageData(0, 0, canvasW, canvasH);
		
		let outputCanvas;
		let outputImgData = inputImgData;
		outputImgData = contrastImage(outputImgData, 100);
		outputCanvas = addCanvas(outputImgData, 'contrast');
		outputImgData = contrastImage(outputImgData, 100);
		outputCanvas = addCanvas(outputImgData, 'contrast 2');
		outputImgData = convertImageToGrayscale(outputImgData);
		outputCanvas = addCanvas(outputImgData, 'grayscale');
		outputImgData = applyThresholdToImage(outputImgData, 200);
		outputCanvas = addCanvas(outputImgData, 'threshold');
		
		createSvgFromCanvas(outputCanvas);
		convertCanvasToImg(outputCanvas, 'output-img');

		log('');
	};


	/**
	* add a canvas with an output-step
	* @returns {undefined}
	*/
	const addCanvas = function(imgData, heading) {
		log(`draw canvas for ${heading}...`);
		const box = document.createElement('div');
		box.classList.add('canvas-box', 'generated');
		const hd = document.createElement('h3');
		hd.textContent = heading;
		box.appendChild(hd);

		const canvas = document.createElement('canvas');
		canvas.classList.add('media');
		const ctx = canvas.getContext('2d');
		canvas.width = canvasW;
		canvas.height = canvasH;
		ctx.putImageData(imgData, 0, 0);
		box.appendChild(canvas);
		canvasList.appendChild(box);

		return canvas;
	};


	/**
	* remove dynamically added canvasses
	* @returns {undefined}
	*/
	const removeCanvases = function() {
		const canvasBoxes = Array.from(document.querySelectorAll(`.generated`));
		canvasBoxes.forEach(box => box.remove());
	};
	
	


	/**
	* convert canvas to image
	* @returns {undefined}
	*/
	const convertCanvasToImg = function(canvas, imgId) {
		const dataUrl = canvas.toDataURL();
		document.getElementById(imgId).src = dataUrl;
	};
	
	

	/**
	* handle file being uploaded from input
	* @param {event} e - input's change event
	* @returns {undefined}
	*/
	const handleFile = function(e) {
		removeCanvases();
		var reader = new FileReader;
		log('read file...');
		reader.onload = function (event) {
			var img = new Image();
			img.src = reader.result;
			log('create image');
			img.onload = () => {
				createCanvasFromImage(img);
			}
		}
		reader.readAsDataURL(e.target.files[0]);
	}
	

	/**
	* generic function for adjusting imageData
	* @param {ImageData} imgData - The imageData object to transform
	* @param {function} pixelFunction - Function to be called for every pixel in imageData
	* @param {any} options - variable to pass to the pixelFunction
	* @returns {undefined}
	*/
	const transformImageData = function(imgData, pixelFunction, options) {
		let data = imgData.data;
		for (let i=0, len=data.length; i < len; i += 4) {
			data = pixelFunction(data, i, options);
		}
		return imgData;
	};


	/**
	* 
	* @returns {undefined}
	*/
	const convertPixelToGrayScale = function(data, i) {
		// calculate avarage from rgb channels
		const avg = (data[i] + data[i+1] + data[i+2])/3;
		// put avarage value back in channels
		data[i] = avg;
		data[i+1] = avg;
		data[i+2] = avg;

		return data;
	};


	/**
	* apply threshold to a value: values lower (darker) than threshold are set to 0; higher (lighter) are set to 255
	* @returns {undefined}
	*/
	const applyThreshold = function(value, threshold) {
		return (value < threshold ? 0 : 255);
	};
	
	
	
	/**
	* 
	* @returns {undefined}
	*/
	const thresholdPixel = function(data, i, threshold) {
		threshold = threshold || 0;
		data[i] = applyThreshold(data[i], threshold);
		data[i+1] = applyThreshold(data[i+1], threshold);
		data[i+2] = applyThreshold(data[i+2], threshold);

		return data;
	};
	

	
	function contrastImage(imgData, contrast){  //input range [-100..100]
		var d = imgData.data;
		contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
		var intercept = 128 * (1 - contrast);
		for(var i=0;i<d.length;i+=4){   //r,g,b,a
			d[i] = d[i]*contrast + intercept;
			d[i+1] = d[i+1]*contrast + intercept;
			d[i+2] = d[i+2]*contrast + intercept;
		}
		return imgData;
	}


	/**
	* convert imgdata to grayscale
	* @returns {ImageData} imgData
	*/
	const convertImageToGrayscale = function(imgData) {
		return transformImageData(imgData, convertPixelToGrayScale);
	};


	/**
	* apply threshold to imageData
	* @returns {undefined}
	*/
	const applyThresholdToImage = function(imgData, threshold) {
		return transformImageData(imgData, thresholdPixel, threshold);
	};
	

	/**
	* log msg to window
	* @returns {undefined}
	*/
	const log = function(msg) {
		const box = document.getElementById('log-win');
		box.innerText = msg;
	};
	


	/**
	* add event listeners
	* @returns {undefined}
	*/
	const addEventListeners = function() {
		document.getElementById('file-input-desktop').addEventListener('change', handleFile);
		document.getElementById('file-input-camera').addEventListener('change', handleFile);
		// document.getElementById('image-form').addEventListener('submit', submitHandler);
	};


	var init = function() {
		addEventListeners();
	}

	document.addEventListener('DOMContentLoaded', init);
})();