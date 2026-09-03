// ===== Simulador de crédito — lógica de cálculo =====
// Todo ocurre en el navegador: no se envía ni se guarda ningún dato.

// Formateador de moneda: convierte 1234.5 en "$1,234.50"
const formatoMoneda = new Intl.NumberFormat('es-US', {
  style: 'currency',
  currency: 'USD',
});

// Referencias a los elementos de la página que vamos a leer o actualizar
const campos = {
  precio: document.getElementById('precio'),
  inicial: document.getElementById('inicial'),
  tasa: document.getElementById('tasa'),
  plazo: document.getElementById('plazo'),
};

const mensajeError = document.getElementById('mensaje-error');
const cuotaMensual = document.getElementById('cuota-mensual');
const cuotaQuincenal = document.getElementById('cuota-quincenal');
const detalleMensual = document.getElementById('detalle-mensual');
const detalleQuincenal = document.getElementById('detalle-quincenal');
const montoFinanciado = document.getElementById('monto-financiado');
const totalPagadoMensual = document.getElementById('total-pagado-mensual');
const totalPagadoQuincenal = document.getElementById('total-pagado-quincenal');
const totalInteresesMensual = document.getElementById('total-intereses-mensual');
const totalInteresesQuincenal = document.getElementById('total-intereses-quincenal');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const tituloPeriodo = document.getElementById('titulo-periodo');
const botonMensual = document.getElementById('boton-mensual');
const botonQuincenal = document.getElementById('boton-quincenal');
const formulario = document.getElementById('formulario');

// Los dos planes calculados, y cuál de los dos se muestra en la tabla
let planes = null;
let modoTabla = 'mensual';

// Recalcular cada vez que el usuario escribe o cambia cualquier dato
formulario.addEventListener('input', calcular);

// Evitar que la tecla Enter recargue la página
formulario.addEventListener('submit', (evento) => evento.preventDefault());

// Botones que alternan la tabla entre meses y quincenas
botonMensual.addEventListener('click', () => cambiarModo('mensual'));
botonQuincenal.addEventListener('click', () => cambiarModo('quincenal'));

// Primer cálculo al abrir la página, con los valores de ejemplo
calcular();

// Calcula un plan de pagos completo (sistema de amortización francés).
// Sirve para cualquier frecuencia:
//   mensual   → pagosPorAno = 12
//   quincenal → pagosPorAno = 24 (dos pagos por mes)
function calcularPlan(monto, tasaAnual, periodos, pagosPorAno) {
  const tasa = tasaAnual / 100 / pagosPorAno; // tasa de cada periodo

  let cuota;
  if (tasa === 0) {
    // Sin interés: el monto se divide en partes iguales
    cuota = monto / periodos;
  } else {
    // Fórmula del sistema francés: cuota = monto × i / (1 − (1+i)^−n)
    cuota = (monto * tasa) / (1 - Math.pow(1 + tasa, -periodos));
  }

  // Detalle periodo a periodo
  const filas = [];
  let saldo = monto;

  for (let numero = 1; numero <= periodos; numero++) {
    const interes = saldo * tasa; // interés sobre lo que aún se debe
    const capital = cuota - interes; // el resto de la cuota baja la deuda
    saldo = saldo - capital;

    // En el último pago la deuda queda exactamente en cero
    // (evita restos minúsculos por redondeo, tipo $0.0000001)
    if (numero === periodos) saldo = 0;

    filas.push({ numero, cuota, interes, capital, saldo });
  }

  const totalPagado = cuota * periodos;
  return { cuota, filas, totalPagado, totalIntereses: totalPagado - monto };
}

function calcular() {
  // 1. Leer los valores escritos en el formulario (llegan como texto)
  const precio = Number(campos.precio.value);
  const inicial = Number(campos.inicial.value);
  const tasaAnual = Number(campos.tasa.value);
  const plazo = Number(campos.plazo.value);

  // 2. Validar antes de calcular
  if (
    campos.precio.value === '' || campos.inicial.value === '' ||
    campos.tasa.value === '' || campos.plazo.value === ''
  ) {
    mostrarError('Completa todos los campos para ver el resultado.');
    return;
  }
  if (precio <= 0) {
    mostrarError('El precio del bien debe ser mayor que cero.');
    return;
  }
  if (inicial < 0) {
    mostrarError('La cuota inicial no puede ser negativa.');
    return;
  }
  if (inicial >= precio) {
    mostrarError('La cuota inicial debe ser menor que el precio del bien.');
    return;
  }
  if (tasaAnual < 0) {
    mostrarError('La tasa de interés no puede ser negativa.');
    return;
  }
  if (!Number.isInteger(plazo) || plazo < 1) {
    mostrarError('El plazo debe ser un número entero de meses (mínimo 1).');
    return;
  }

  ocultarError();

  // 3. Calcular los DOS planes de una vez
  const monto = precio - inicial; // lo que realmente se financia

  planes = {
    mensual: calcularPlan(monto, tasaAnual, plazo, 12),
    quincenal: calcularPlan(monto, tasaAnual, plazo * 2, 24),
  };

  // 4. Mostrar los resultados en la página
  cuotaMensual.textContent = formatoMoneda.format(planes.mensual.cuota);
  detalleMensual.textContent = `${plazo} ${plazo === 1 ? 'pago' : 'pagos'} en total`;
  cuotaQuincenal.textContent = formatoMoneda.format(planes.quincenal.cuota);
  detalleQuincenal.textContent = `${plazo * 2} pagos en total`;

  montoFinanciado.textContent = formatoMoneda.format(monto);
  totalPagadoMensual.textContent = formatoMoneda.format(planes.mensual.totalPagado);
  totalPagadoQuincenal.textContent = formatoMoneda.format(planes.quincenal.totalPagado);
  totalInteresesMensual.textContent = formatoMoneda.format(planes.mensual.totalIntereses);
  totalInteresesQuincenal.textContent = formatoMoneda.format(planes.quincenal.totalIntereses);

  dibujarTabla();
}

// Muestra en la tabla el plan elegido (mensual o quincenal)
function dibujarTabla() {
  if (!planes) return; // si hay un error, no hay nada que dibujar

  tituloPeriodo.textContent = modoTabla === 'mensual' ? 'Mes' : 'Quincena';

  // Cada fila se crea con createElement + textContent,
  // que es la forma segura de agregar contenido a la página.
  const filasHTML = planes[modoTabla].filas.map((fila) => {
    const tr = document.createElement('tr');
    const celdas = [
      fila.numero,
      formatoMoneda.format(fila.cuota),
      formatoMoneda.format(fila.interes),
      formatoMoneda.format(fila.capital),
      formatoMoneda.format(fila.saldo),
    ];
    for (const valor of celdas) {
      const td = document.createElement('td');
      td.textContent = valor;
      tr.appendChild(td);
    }
    return tr;
  });

  cuerpoTabla.replaceChildren(...filasHTML);
}

// Cambia qué plan se ve en la tabla y marca el botón activo
function cambiarModo(modo) {
  modoTabla = modo;

  botonMensual.classList.toggle('activo', modo === 'mensual');
  botonQuincenal.classList.toggle('activo', modo === 'quincenal');
  botonMensual.setAttribute('aria-pressed', String(modo === 'mensual'));
  botonQuincenal.setAttribute('aria-pressed', String(modo === 'quincenal'));

  dibujarTabla();
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
  planes = null;

  // Limpiar los resultados para no mostrar números que ya no son válidos
  const resultados = [
    cuotaMensual, cuotaQuincenal, montoFinanciado,
    totalPagadoMensual, totalPagadoQuincenal,
    totalInteresesMensual, totalInteresesQuincenal,
  ];
  for (const elemento of resultados) {
    elemento.textContent = '—';
  }
  detalleMensual.textContent = '';
  detalleQuincenal.textContent = '';
  cuerpoTabla.replaceChildren(); // vacía la tabla
}

function ocultarError() {
  mensajeError.hidden = true;
}
