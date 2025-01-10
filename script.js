document.getElementById('subir').addEventListener('change', cargarImagenes);
document.getElementById('listaImagenes').addEventListener('change', mostrarImagen);
document.getElementById('guardar').addEventListener('click', guardarAnotaciones);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let imagenes = [];
let anotaciones = [];
let anotacionesActuales = [];
let dibujando = false;
let inicioX, inicioY;
let anotacionActual = null;
let nombresArchivos = [];

canvas.addEventListener('mousedown', comenzarDibujo);
canvas.addEventListener('mousemove', dibujarRectangulo);
canvas.addEventListener('mouseup', finalizarDibujo);
canvas.addEventListener('click', eliminarAnotacion);

const botonEliminar = document.createElement('button'); //se crea un boton dinamico para la eliminacion de los datos 
botonEliminar.textContent = 'Eliminar datos'; //se pone el texto del boton
botonEliminar.className = "eliminar" //se asigna a una clase
botonEliminar.addEventListener('click', eliminarTodasAnotaciones); //asigna el evento al mouse 
document.querySelector('.contenedor').appendChild(botonEliminar) //lo mete al contenedor para que se alinee con los demas botones.
//document.body.appendChild(botonEliminar);

function cargarImagenes(evento) {
  const archivos = evento.target.files // Obtiene la lista de archivos seleccionados por el usuario
  imagenes = []; //para reiniciar el arreglo de imagenes
  const listaImagenes = document.getElementById('listaImagenes'); //obtiene las imagenes que se subieron
  listaImagenes.innerHTML = '';  // Limpiar el contenido actual, para empezar con nuevas imagenes

  Array.from(archivos).forEach((archivo, indice) => { //convierte la lista de archivos en un arreglo para poder buscar las imagenes con el foreach e iterar sobre cada imagen
    const cargcontenido = new FileReader();
    const img = new Image();

    //carga las imagenes y las almacena con el "imagenes.push"
    cargcontenido.onload = function (e) {
      img.onload = function () {
        imagenes.push(img);
        nombresArchivos.push(archivo.name); //guarda el nombre del archivo
        anotaciones.push([]); //se guardan las anotaciones de cada imagen
        const opcion = document.createElement('option');
        opcion.value = indice;
        opcion.textContent = `Imagen ${indice + 1}`;
        listaImagenes.appendChild(opcion);

        if (indice === 0) { //muestra la primera imagen cargada 
          mostrarImagenDesdeIndice(0);
        }
      };
      img.src = e.target.result; //carga la imagen en el navegador para que se pueda usar en el canvas 
    };
    cargcontenido.readAsDataURL(archivo);
  });
}

//funcion que permite mostrar la imagen seleccionada 
function mostrarImagen(evento) {
  const indiceSeleccionado = parseInt(evento.target.value, 10);
  if (indiceSeleccionado >= 0) {
    mostrarImagenDesdeIndice(indiceSeleccionado); //depende el indice seleccionado, se actualiza la imagen en el canvas
  }
}

function mostrarImagenDesdeIndice(indice) {
  const img = imagenes[indice] //este arreglo contiene todas las imagenes almacenadas
  if (img) { //si hay una imagen, el canvas se ajusta a la medida de cada una de ellas 
    canvas.width = img.width
    canvas.height = img.height
    ctx.clearRect(0, 0, canvas.width, canvas.height) //se va limpiando al canvas, para dejarlo listo para dibujar otras medidas para la sig imagen
    ctx.drawImage(img, 0, 0)
    anotacionesActuales = anotaciones[indice] || [] //ya que se dibuja la imagen, se van viendo las anotaciones pero si se borra entonces el arreglo estará vacio
    dibujarTodasAnotaciones()
    actualizarListaAnotaciones()
  }
}

function comenzarDibujo(evento) {
  //verificar si el clic esta en la X para eliminar, entonces se para la funcion de dibujar
  if (esClicEnX(evento)) return;
  //aqui empieza a dibujar en x y en y, y pide el nombre de la etiqueta para dibujar el rectangulo que encierra el objeto.
  dibujando = true;
  [inicioX, inicioY] = obtenerPosicionMouse(evento);
  anotacionActual = { x1: inicioX, y1: inicioY, x2: 0, y2: 0, etiqueta: '' };
}

function dibujarRectangulo(evento) {
  if (!dibujando) return;
  const [x, y] = obtenerPosicionMouse(evento);

  anotacionActual.x2 = x;
  anotacionActual.y2 = y;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imagenes[document.getElementById('listaImagenes').value], 0, 0);

  dibujarTodasAnotaciones();

  ctx.beginPath();
  ctx.rect(inicioX, inicioY, x - inicioX, y - inicioY);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'blue';
  ctx.stroke();
}

function finalizarDibujo(evento) {
  if (dibujando) {
    dibujando = false;
    const etiqueta = prompt("Escribe el nombre de la etiqueta:");
    anotacionActual.etiqueta = etiqueta;

    anotacionesActuales.push(anotacionActual);
    anotaciones[document.getElementById('listaImagenes').value] = anotacionesActuales;
    anotacionActual = null;

    dibujarTodasAnotaciones();
    actualizarListaAnotaciones();
  }
}

function obtenerPosicionMouse(evento) {
  const rect = canvas.getBoundingClientRect();
  return [evento.clientX - rect.left, evento.clientY - rect.top];
}

function esClicEnX(evento) {
  const [mouseX, mouseY] = obtenerPosicionMouse(evento);
  return anotacionesActuales.some(anotacion => {
    const xX = anotacion.x2 - 10;
    const yX = anotacion.y1 + 10;
    return (
      mouseX >= xX - 5 && mouseX <= xX + 5 &&
      mouseY >= yX - 5 && mouseY <= yX + 5
    );
  });
}

function eliminarAnotacion(evento) {
  const [mouseX, mouseY] = obtenerPosicionMouse(evento);
  const indice = anotacionesActuales.findIndex(anotacion => {
    const xX = anotacion.x2 - 10;
    const yX = anotacion.y1 + 10;
    return (
      mouseX >= xX - 5 && mouseX <= xX + 5 &&
      mouseY >= yX - 5 && mouseY <= yX + 5
    );
  });

  if (indice !== -1) {
    anotacionesActuales.splice(indice, 1);
    anotaciones[document.getElementById('listaImagenes').value] = anotacionesActuales;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagenes[document.getElementById('listaImagenes').value], 0, 0);
    dibujarTodasAnotaciones();
    actualizarListaAnotaciones();
  }
}

function actualizarListaAnotaciones() {
  const ul = document.getElementById('annotations');
  ul.innerHTML = '';
  console.log("soy anotaciones actuales: " + anotacionesActuales)
  anotacionesActuales.forEach((anotacion, indice) => {
    const li = document.createElement('li');
    li.textContent = `Label: ${anotacion.etiqueta}, Coordinates: (${anotacion.x1}, ${anotacion.y1}) to (${anotacion.x2}, ${anotacion.y2})`;
    ul.appendChild(li);

  });
}

function guardarAnotaciones() {
  //forma en la que esta escrita el json que se va a descargar
  const anotacionesFormateadas = anotaciones.map((setAnotaciones, indice) => ({
    filename: nombresArchivos[indice],
    objects: setAnotaciones.map(anotacion => ({
      label: anotacion.etiqueta,
      bbox: [anotacion.x1, anotacion.y1, anotacion.x2, anotacion.y2]
    }))
  }));

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(anotacionesFormateadas)); //esta linea convierte el objeto de arriba a json
  const downloadfile = document.createElement('a');

  downloadfile.setAttribute("href", dataStr);
  downloadfile.setAttribute("download", "anotaciones.json"); //esto especifica como se llamara el archivo que se descargara.
  document.body.appendChild(downloadfile);
  downloadfile.click();
  document.body.removeChild(downloadfile);
}

function dibujarTodasAnotaciones() {
  anotacionesActuales.forEach((anotacion, indice) => {
    // Dibuja el rectángulo de la anotación
    ctx.beginPath();
    ctx.rect(anotacion.x1, anotacion.y1, anotacion.x2 - anotacion.x1, anotacion.y2 - anotacion.y1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Dibuja una "X" en la esquina superior derecha del rectángulo
    const xX = anotacion.x2 - 10; //estas son las coordenadas -10 para que pueda estar la x en la misma esquina 
    const yX = anotacion.y1 + 10;
    ctx.beginPath();
    ctx.moveTo(xX - 5, yX - 5);
    ctx.lineTo(xX + 5, yX + 5);
    ctx.moveTo(xX + 5, yX - 5);
    ctx.lineTo(xX - 5, yX + 5);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.stroke();
  });
}


function eliminarTodasAnotaciones() {
  const indiceSeleccionado = document.getElementById('listaImagenes').value;
  anotaciones[indiceSeleccionado] = [];
  anotacionesActuales = [];
  actualizarListaAnotaciones();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (indiceSeleccionado >= 0) {
    ctx.drawImage(imagenes[indiceSeleccionado], 0, 0);
    dibujarTodasAnotaciones();
  }
}

canvas.addEventListener('mousemove', mostrarEtiqueta);
function mostrarEtiqueta(evento) {
  const [mouseX, mouseY] = obtenerPosicionMouse(evento);
  const tooltip = document.getElementById('veretiqueta');
  let mostrar = false;
  anotacionesActuales.forEach(anotacion => {
    if (mouseX >= anotacion.x1 && mouseX <= anotacion.x2 && mouseY >= anotacion.y1 && mouseY <= anotacion.y2) {
      tooltip.style.left = `${evento.clientX + 10}px`;
      tooltip.style.top = `${evento.clientY + 10}px`;
      tooltip.textContent = anotacion.etiqueta;
      tooltip.style.display = 'block';
      mostrar = true;
    }
  });
  if (!mostrar) {
    tooltip.style.display = 'none';
  }
}
function reload() {
  location.reload()
}
function inicio() {
  window.location.href = "index.html";
}
