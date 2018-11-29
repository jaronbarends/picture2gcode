;(function() {

	// const imgToVector
	const srcImg = document.getElementById('src-img');
	const vectorContainer = document.getElementById('vector-container');


	/**
	* create a vector out of ...
	* @returns {undefined}
	*/
	const createVectorFromImg = function() {
		ImageTracer.imageToSVG(

			'img/smiley.jpg', /* input filename / URL */
			
			function(svgstr){ ImageTracer.appendSVGString( svgstr, 'svg-container' ); }, /* callback function to run on SVG string result */
			
			'posterized2' /* Option preset */
			
		);
	};


	/**
	* create an svg from image data
	* @returns {undefined}
	*/
	const createSvgFromImgData = function(imgData) {
		console.log('go create from', imgData);
		// var imgd = ImageTracer.getImgdata( canvas );
	 	
	 	// Synchronous tracing to SVG string
	 	var svgstr = ImageTracer.imagedataToSVG( imgData, { scale:5 } );
	 
	 	// Appending SVG
	 	ImageTracer.appendSVGString( svgstr, 'svg-container' );
	};


	/**
	* create a canvas element from an image
	* @returns {undefined}
	*/
	const createCanvasFromImage_ = function() {
		const canvas = document.getElementById('canvas');
		const canvas2 = document.getElementById('canvas-2');
		const img = document.getElementById('captured-img');
		var ctx = canvas.getContext('2d');
		var ctx2 = canvas2.getContext('2d');
		ctx.drawImage(img, 0, 0, 500, 500);
		ctx2.drawImage(img, 0, 0, 500, 500);

		// enhanceImage(canvas2);
		return canvas;
	};


	/**
	* 
	* @returns {undefined}
	*/
	const enhanceImage = function(canvas) {
		const ctx = canvas.getContext('2d');
		ctx.filter = 'blur(20px)';
	};
	
	


	/**
	* 
	* @returns {undefined}
	*/
	const createSvgFromCanvas = function(canvas) {
		console.log('createSvgFromCanvas');
		var imgd = ImageTracer.getImgdata( canvas );
		console.log('imgd:', imgd);
	 	
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
		const w = img.width/3;
		const h = img.height/3;

        const inputCanvas = document.getElementById('input-canvas');
		inputCanvas.width = w;
		inputCanvas.height = h;
		const iCtx = inputCanvas.getContext("2d");

        const outputCanvas = document.getElementById('output-canvas');
		outputCanvas.width = w;
		outputCanvas.height = h;
		const oCtx = outputCanvas.getContext("2d");
		
		console.log('go draw input canvas');

		iCtx.drawImage(img, 0, 0, w, h);
		console.log('drew inputCanvas');

		const inputImgData = iCtx.getImageData(0, 0, w, h);
		let outputImgData = inputImgData;

		outputImgData = contrastImage(outputImgData, 100);
		outputImgData = contrastImage(outputImgData, 100);
		outputImgData = convertImageToGrayscale(outputImgData);
		outputImgData = applyThresholdToImage(outputImgData, 200);

		oCtx.putImageData(outputImgData, 0, 0);

		// Do whatever image operation you need (resize/crop, visual effects, barcode detection, etc.+
		// invertImage(iCtx, canvas);

		// You can even upload the new image to your server
		// postCanvasDataToServer(canvas);
		createSvgFromCanvas(outputCanvas);
	};
	

	/**
	* handle file being uploaded from input
	* @param {event} e - input's change event
	* @returns {undefined}
	*/
	const handleFile = function(e) {
        var reader = new FileReader;
        reader.onload = function (event) {
            var img = new Image();
            img.src = reader.result;
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
		console.log('options:', options);
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
	* add event listeners
	* @returns {undefined}
	*/
	const addEventListeners = function() {
		// document.body.addEventListener('newimagedata', newImageHandler);
		document.getElementById('file-input-desktop').addEventListener('change', handleFile);
		document.getElementById('file-input-camera').addEventListener('change', handleFile);
		// document.getElementById('image-form').addEventListener('submit', submitHandler);
	};
	


	var init = function() {
		addEventListeners();
	}

	document.addEventListener('DOMContentLoaded', init);
})();