# Calculadora de préstamos estudiantiles

Sitio web estático que simula el financiamiento de una matrícula universitaria
con el **sistema de amortización francés** (cuota fija). Proyecto académico
para la clase *AI Assisted Development of Products and Services*.

> **Sitio no oficial** — proyecto de estudiante, sin afiliación con
> Yeshiva University.

## 🌐 Sitio en vivo

**<https://josephbenzaquen.github.io/simulador-credito/>**

## ¿Qué calcula?

A partir del costo de la matrícula, el pago inicial, la tasa de interés anual
y el plazo en meses, la página muestra **al instante** (se recalcula con cada
tecla):

- La cuota fija en dos modalidades a la vez: **mensual** (12 pagos al año) y
  **quincenal** (*semi-monthly*, 24 pagos al año)
- Un resumen comparativo: monto financiado, total pagado y total de intereses
  de cada modalidad
- La **tabla de amortización** completa, pago a pago: cuota, porción de
  interés, porción de capital y saldo restante

Además incluye:

- Botón **English/Español** que traduce toda la página
- Botón para **descargar el plan de pagos** como archivo CSV compatible con
  Excel

## ¿Cómo funciona?

Todo se calcula en el navegador con JavaScript puro — sin backend, sin base de
datos y sin dependencias. No se envía ni se guarda ningún dato.

La fórmula de la cuota fija:

```
cuota = monto × i / (1 − (1 + i)^−n)
```

donde `i` es la tasa del periodo (anual ÷ 12 para mensual, anual ÷ 24 para
quincenal) y `n` la cantidad de pagos.

## Archivos

| Archivo      | Qué contiene                                      |
| ------------ | ------------------------------------------------- |
| `index.html` | La estructura de la página                        |
| `styles.css` | El diseño (responsive, paleta azul institucional) |
| `script.js`  | Cálculos, traducción y descarga CSV               |
| `yu-logo.svg`| Escudo usado en el encabezado                     |

## Ejecutar localmente

No requiere instalación: clona el repositorio (o descárgalo) y abre
`index.html` con doble clic en cualquier navegador.

```bash
git clone https://github.com/JosephBenzaquen/simulador-credito.git
```

---

Los valores calculados son referenciales y no constituyen una oferta de
crédito.
