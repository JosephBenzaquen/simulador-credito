// ===== Simulador de crédito — lógica de cálculo y traducción =====
// Todo ocurre en el navegador: no se envía ni se guarda ningún dato.

// Diccionario con TODOS los textos de la página en los dos idiomas.
// Cada clave corresponde a un atributo data-texto del HTML,
// o a un texto dinámico que genera el JavaScript.
const textos = {
  es: {
    tituloPagina: 'Calculadora de préstamos estudiantiles',
    titulo: 'Calculadora de préstamos estudiantiles',
    intro: 'Planifica cómo financiar tus estudios en Yeshiva University: calcula tu cuota pagando cada mes o cada quincena, y mira cómo se reparte cada pago entre interés y capital. La cuota es fija durante todo el préstamo (sistema de amortización francés).',
    datosCredito: 'Datos del préstamo',
    labelPrecio: 'Costo de la matrícula (US$)',
    labelInicial: 'Pago inicial (US$)',
    labelTasa: 'Tasa de interés anual (%)',
    labelPlazo: 'Plazo en meses',
    siMes: 'Si pagas cada mes',
    siQuincena: 'Si pagas cada quincena',
    montoFinanciado: 'Monto financiado',
    colMensual: 'Mensual',
    colQuincenal: 'Quincenal',
    totalPagado: 'Total pagado',
    totalIntereses: 'Total de intereses',
    tituloTabla: 'Tabla de amortización',
    notaTabla: 'Así baja tu deuda pago a pago: una parte de cada cuota cubre el interés y el resto reduce el saldo. Elige cómo verla:',
    botonMeses: 'Por meses',
    botonQuincenas: 'Por quincenas',
    colCuota: 'Cuota',
    colInteres: 'Interés',
    colCapital: 'Capital',
    colSaldo: 'Saldo',
    mes: 'Mes',
    quincena: 'Quincena',
    pieAviso: 'Sitio no oficial — proyecto académico de estudiante, sin afiliación con Yeshiva University.',
    pieNota: 'Los valores calculados son referenciales.',
    botonDescargar: 'Descargar plan de pagos (Excel)',
    archivoMensual: 'plan-de-pagos-mensual.csv',
    archivoQuincenal: 'plan-de-pagos-quincenal.csv',
    pagoUno: 'pago en total',
    pagosMuchos: 'pagos en total',
    ariaFrecuencia: 'Frecuencia de pago',
    errorCampos: 'Completa todos los campos para ver el resultado.',
    errorPrecio: 'El costo de la matrícula debe ser mayor que cero.',
    errorInicialNegativa: 'El pago inicial no puede ser negativo.',
    errorInicialMayor: 'El pago inicial debe ser menor que el costo de la matrícula.',
    errorTasa: 'La tasa de interés no puede ser negativa.',
    errorPlazo: 'El plazo debe ser un número entero de meses (mínimo 1).',
  },
  en: {
    tituloPagina: 'Student Loan Calculator',
    titulo: 'Student Loan Calculator',
    intro: 'Plan how to finance your studies at Yeshiva University: calculate your installment paying monthly or twice a month, and see how each payment splits between interest and principal. The installment stays fixed for the life of the loan (French amortization system).',
    datosCredito: 'Loan details',
    labelPrecio: 'Tuition cost (US$)',
    labelInicial: 'Down payment (US$)',
    labelTasa: 'Annual interest rate (%)',
    labelPlazo: 'Term in months',
    siMes: 'If you pay monthly',
    siQuincena: 'If you pay twice a month',
    montoFinanciado: 'Amount financed',
    colMensual: 'Monthly',
    colQuincenal: 'Semi-monthly',
    totalPagado: 'Total paid',
    totalIntereses: 'Total interest',
    tituloTabla: 'Amortization schedule',
    notaTabla: 'Watch your debt shrink payment by payment: part of each installment covers interest and the rest reduces the balance. Choose a view:',
    botonMeses: 'Monthly',
    botonQuincenas: 'Semi-monthly',
    colCuota: 'Payment',
    colInteres: 'Interest',
    colCapital: 'Principal',
    colSaldo: 'Balance',
    mes: 'Month',
    quincena: 'Half-month',
    pieAviso: 'Unofficial site — student academic project, not affiliated with Yeshiva University.',
    pieNota: 'Calculated values are for reference only.',
    botonDescargar: 'Download payment plan (Excel)',
    archivoMensual: 'payment-plan-monthly.csv',
    archivoQuincenal: 'payment-plan-semimonthly.csv',
    pagoUno: 'payment in total',
    pagosMuchos: 'payments in total',
    ariaFrecuencia: 'Payment frequency',
    errorCampos: 'Fill in all fields to see the result.',
    errorPrecio: 'The tuition cost must be greater than zero.',
    errorInicialNegativa: 'The down payment cannot be negative.',
    errorInicialMayor: 'The down payment must be less than the tuition cost.',
    errorTasa: 'The interest rate cannot be negative.',
    errorPlazo: 'The term must be a whole number of months (at least 1).',
  },
};

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
const botonIdioma = document.getElementById('boton-idioma');
const botonDescargar = document.getElementById('boton-descargar');
const selectorTabla = document.querySelector('.selector-tabla');
const formulario = document.getElementById('formulario');

// Estado de la página: idioma activo, planes calculados y vista de la tabla
let idioma = 'es';
let planes = null;
let modoTabla = 'mensual';

// Recalcular cada vez que el usuario escribe o cambia cualquier dato
formulario.addEventListener('input', calcular);

// Evitar que la tecla Enter recargue la página
formulario.addEventListener('submit', (evento) => evento.preventDefault());

// Botones que alternan la tabla entre meses y quincenas
botonMensual.addEventListener('click', () => cambiarModo('mensual'));
botonQuincenal.addEventListener('click', () => cambiarModo('quincenal'));

// Botón que cambia el idioma de toda la página
botonIdioma.addEventListener('click', () => {
  idioma = idioma === 'es' ? 'en' : 'es';
  aplicarIdioma();
});

// Botón que descarga el plan visible como archivo para Excel
botonDescargar.addEventListener('click', descargarPlan);

// Primer cálculo al abrir la página, con los valores de ejemplo
calcular();

// Recorre la página y pone cada texto en el idioma activo
function aplicarIdioma() {
  const t = textos[idioma];

  // El atributo lang le dice al navegador (y a los lectores de pantalla)
  // en qué idioma está la página
  document.documentElement.lang = idioma;
  document.title = t.tituloPagina;

  // Cada elemento con data-texto="clave" recibe su texto traducido
  for (const elemento of document.querySelectorAll('[data-texto]')) {
    elemento.textContent = t[elemento.dataset.texto];
  }

  // El botón siempre ofrece el OTRO idioma
  botonIdioma.textContent = idioma === 'es' ? 'English' : 'Español';
  selectorTabla.setAttribute('aria-label', t.ariaFrecuencia);

  // Volver a calcular regenera los textos dinámicos
  // (detalles de pagos, encabezado de la tabla y mensajes de error)
  calcular();
}

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
  const t = textos[idioma];

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
    mostrarError(t.errorCampos);
    return;
  }
  if (precio <= 0) {
    mostrarError(t.errorPrecio);
    return;
  }
  if (inicial < 0) {
    mostrarError(t.errorInicialNegativa);
    return;
  }
  if (inicial >= precio) {
    mostrarError(t.errorInicialMayor);
    return;
  }
  if (tasaAnual < 0) {
    mostrarError(t.errorTasa);
    return;
  }
  if (!Number.isInteger(plazo) || plazo < 1) {
    mostrarError(t.errorPlazo);
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
  detalleMensual.textContent = `${plazo} ${plazo === 1 ? t.pagoUno : t.pagosMuchos}`;
  cuotaQuincenal.textContent = formatoMoneda.format(planes.quincenal.cuota);
  detalleQuincenal.textContent = `${plazo * 2} ${t.pagosMuchos}`;

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

  const t = textos[idioma];
  tituloPeriodo.textContent = modoTabla === 'mensual' ? t.mes : t.quincena;

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

// Arma el contenido del archivo CSV: primero los datos del préstamo,
// luego la tabla completa del plan que se está viendo.
// Los números van sin "$" ni comas de miles para que Excel los
// reconozca como números y se puedan sumar o graficar.
function generarCSV() {
  const t = textos[idioma];
  const plan = planes[modoTabla];
  const frecuencia = modoTabla === 'mensual' ? t.colMensual : t.colQuincenal;
  const precio = Number(campos.precio.value);
  const inicial = Number(campos.inicial.value);

  const lineas = [
    `${t.tituloPagina} (${frecuencia})`,
    '',
    `${t.labelPrecio},${precio}`,
    `${t.labelInicial},${inicial}`,
    `${t.labelTasa},${Number(campos.tasa.value)}`,
    `${t.labelPlazo},${Number(campos.plazo.value)}`,
    `${t.montoFinanciado},${(precio - inicial).toFixed(2)}`,
    `${t.colCuota},${plan.cuota.toFixed(2)}`,
    `${t.totalPagado},${plan.totalPagado.toFixed(2)}`,
    `${t.totalIntereses},${plan.totalIntereses.toFixed(2)}`,
    '',
    [
      modoTabla === 'mensual' ? t.mes : t.quincena,
      t.colCuota, t.colInteres, t.colCapital, t.colSaldo,
    ].join(','),
  ];

  for (const fila of plan.filas) {
    lineas.push([
      fila.numero,
      fila.cuota.toFixed(2),
      fila.interes.toFixed(2),
      fila.capital.toFixed(2),
      fila.saldo.toFixed(2),
    ].join(','));
  }

  return lineas.join('\n');
}

// Crea el archivo en memoria y dispara la descarga en el navegador
function descargarPlan() {
  if (!planes) return; // sin datos válidos no hay nada que descargar

  const t = textos[idioma];

  // El '\uFEFF' del inicio (llamado BOM) es una marca invisible que
  // le avisa a Excel que el archivo usa UTF-8: así lee bien las tildes
  const archivo = new Blob(['\uFEFF' + generarCSV()], {
    type: 'text/csv;charset=utf-8',
  });

  // Truco estándar: un enlace invisible que se "hace clic" solo
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = modoTabla === 'mensual' ? t.archivoMensual : t.archivoQuincenal;
  enlace.click();
  URL.revokeObjectURL(enlace.href); // libera la memoria del archivo temporal
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
  planes = null;
  botonDescargar.disabled = true; // sin cálculo válido no se puede descargar

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
  botonDescargar.disabled = false;
}
