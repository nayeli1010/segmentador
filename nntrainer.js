let kgucontent, badcontent, testsample;

function kgufiles() { //Crea el bojeto kgucontent con todos los objetos de la carpeta seleccionada
	let archivoskgu = document.getElementById("kgusamples")
	let output = document.getElementById("kgulist");
	kgucontent = archivoskgu.files;
	//showpic(kgucontent[1]);
}

function badfiles() { //Crea el bojeto badcontent con todos los objetos de la carpeta seleccionada
	let archivosbad = document.getElementById("badsamples")//input element
	let output = document.getElementById("badlist");// li element para la lista
	badcontent = archivosbad.files;
	//showpic(badcontent[2]);

}

function loadpic() { //Crea el bojeto badcontent con todos los objetos de la carpeta seleccionada
	let archivotest = document.getElementById("testsample")//input element
	let output = document.getElementById("badlist");// li element para la lista
	testsample = archivotest.files;
	//showpic(badcontent[2]);

}

function lista(content, output) {//Muestra listado de archivos contenido en la carpeta seleccionada
	for (let i = 0; i < content.length; i++) {
		let item = document.createElement("li");
		item.innerHTML = content[i].webkitRelativePath;
		output.appendChild(item);
	}
}

async function showpic(npic) { //Muestra imagen seleccionada
	return new Promise(async resolve => {
		const imageplace = document.getElementById('image');
		imageplace.src = URL.createObjectURL(npic);
		setTimeout(function fire() { resolve('resolved') }, 1000);
	});//Cierra Promise principal resolve('resolved');
}

async function picloader(picsobject, clase) {

	return new Promise(async resolve => {

		mobilenetModule = await mobilenet.load();
		console.log("Mobilenet loaded...");
		console.log("dentro de picloader " + clase);
		for (let i = 0; i < picsobject.length; i++) {
			await showpic(picsobject[i]);
			await trainer(clase);
		}

		resolve('resolved');
	});//Cierra Promise principal
}

const classifier = knnClassifier.create();
let mobilenetModule = 0;
function trainer(clase) {
	console.log("dentro de trainer " + clase);
	return new Promise(async resolve => {

		const img = tf.browser.fromPixels(document.getElementById('image'));
		const logits = mobilenetModule.infer(img, 'conv_preds');
		classifier.addExample(logits, clase);
		const result = await classifier.predictClass(logits);
		// Dispose the tensor to release the memory.
		img.dispose();
		console.log(result);
		resolve('resolved');
		//setTimeout(function fire(){console.log("Timer ejecutado");resolve('resolved')},3000);
	});//Cierra Promise principal
}

async function trainersequence() {

	kgufiles();
	badfiles();
	await picloader(kgucontent, 0);
	console.log("KGU samples trained...");
	await picloader(badcontent, 1);
	console.log("Bad samples trained...");
}

async function predict() {
	const img = tf.browser.fromPixels(document.getElementById('image'));
	const logits = mobilenetModule.infer(img, 'conv_preds');
	const result = await classifier.predictClass(logits);
	const classes = ['Pass', 'Fail'];
	img.dispose();
	console.log(classes[result.label]);
	console.log(result.confidences[result.label] * 100);
	document.getElementById('learning').innerText = `Test result: ${classes[result.label]} -> ${result.confidences[result.label] * 100}%`;
}

async function test_pic() { //Muestra imagen seleccionada

	loadpic();
	return new Promise(async resolve => {
		const imageplace = document.getElementById('image');
		imageplace.src = URL.createObjectURL(testsample[0]);
		setTimeout(function fire() { resolve('resolved') }, 1000);
		setTimeout(function fire() { predict(); resolve('resolved') }, 1000);

	});//Cierra Promise principal resolve('resolved');

}

let netjsonStr;
function jsonnet() {


}

function save() {
	if (badcontent.length == kgucontent.length) {
		let dataset = classifier.getClassifierDataset()
		var datasetObj = {}
		let data;

		Object.keys(dataset).forEach((key) => {
			data = dataset[key].dataSync();
			datasetObj[key] = Array.from(data);
		});
		netjsonStr = JSON.stringify(datasetObj);

		//***************************************

		function downloadObjectAsJson(exportObj, exportName) {
			var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportObj);
			var downloadAnchorNode = document.createElement('a');
			downloadAnchorNode.setAttribute("href", dataStr);
			downloadAnchorNode.setAttribute("download", exportName + ".json");
			document.body.appendChild(downloadAnchorNode); // required for firefox
			downloadAnchorNode.click();
			downloadAnchorNode.remove();
		}

		let file_name = 'Trained net_Samqty_' + kgucontent.length;
		downloadObjectAsJson(netjsonStr, file_name);
		console.log('Saved..');
	}
	else { alert("El numero de muestras Pass vs Fail no es igual"); }
}

function inicio() {
	console.log("Estoy en la funcion inicio")
	window.location.href = "index.html";
}

/*	// Si quisiera usar el listado del lado del servidor
const fs = require('fs');
let path="C:/Users/juan_moreno/myapp/public/KNN/images";
fs.readdir(path, function (err, archivos) {
if (err) {
console.log(err);
return;
}
console.log(archivos);
console.log(archivos.length);
});*/