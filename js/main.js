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
	const createCanvasFromImage = function() {
		var canvas = document.getElementById('canvas');
		console.log('canvas:', canvas);
		const img = document.getElementById('captured-img');
		console.log('img:', img);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, 500, 500);
		return canvas;
	};
	


	/**
	* 
	* @returns {undefined}
	*/
	const createSvgFromCanvas = function(canvas) {
		var imgd = ImageTracer.getImgdata( canvas );
		console.log('imgd:', imgd);
	 	
	 	// Synchronous tracing to SVG string
	 	var svgstr = ImageTracer.imagedataToSVG( imgd, { scale:5 } );
	 
	 	// Appending SVG
	 	ImageTracer.appendSVGString( svgstr, 'svg-container' );
	};


	function handleFile(e) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext("2d");

        var reader = new FileReader;
        reader.onload = function (event) {
            var img = new Image();
            img.src = reader.result;
            img.onload = function () {
                canvas.width = img.width/3;
				canvas.height = img.height/3;
				
				console.log('go draw');

				ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
				console.log('drew canvas');

                // Do whatever image operation you need (resize/crop, visual effects, barcode detection, etc.+
                // invertImage(ctx, canvas);

                // You can even upload the new image to your server
				// postCanvasDataToServer(canvas);
				createSvgFromCanvas(canvas);
				console.log('done');
            }
        }
        reader.readAsDataURL(e.target.files[0]);
    }

	/**
	* 
	* @returns {undefined}
	*/
	const convertImageDataToCanvas = function(dataUri) {
		image = document.getElementById('captured-img');
		image2 = document.getElementById('captured-img-2');
		image2.src = dataUri;
		// var canvas = document.createElement("canvas");
		var canvas = document.getElementById('canvas');
		canvas.width = image2.width;
		canvas.height = image2.height;
		canvas.getContext("2d").drawImage(image2, 0, 0);
	
		return canvas;
	};
	
	
	


	/**
	* handle new image being uploaded
	* @returns {undefined}
	*/
	const newImageHandler = function(e) {
		// console.log(e.detail);
		// const canvas = createCanvasFromImage();
		console.log('go create canvas');
		// const canvas = convertImageToCanvas();
		const canvas = convertImageDataToCanvas(e.detail.imgData);
		console.log('done creating canvas', canvas);
		createSvgFromCanvas(canvas);
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