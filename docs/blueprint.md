# **App Name**: VenPOS Corporativo

## Core Features:

- Módulo de Punto de Venta (POS): Carrito de compras funcional con búsqueda de productos, filtrado por categorías, cálculo de IVA y aplicación automática de IGTF según método de pago.
- Gestión Multimoneda e Impuestos: Cálculo dinámico entre Bolívares (VES) y Dólares (USD) basado en tasas de cambio configurables, incluyendo desglose de impuestos locales.
- Dashboard Administrativo en Tiempo Real: Visualización de estadísticas de ventas diarias, ingresos totales, alertas de stock bajo y tabla de transacciones recientes.
- Analista de Ventas Generativo (IA): Herramienta integrada para generar un resumen inteligente sobre las tendencias de ventas y recomendaciones de inventario basadas en el historial guardado.
- CRUD de Inventario y Clientes: Sistemas completos para la creación, lectura, actualización y eliminación de productos, categorías, clientes y usuarios con persistencia local.
- Sistema de Pago y Tickets: Procesamiento de pagos (Efectivo, Transferencia, Pago Móvil, Biopago, Mixto) con generación de ticket de venta imprimible en formato térmico.
- Respaldo y Restauración de Datos: Capacidad de exportar e importar toda la base de datos del sistema en formato JSON para copias de seguridad locales.

## Style Guidelines:

- Color primario: Navy Corporativo (#0a1628) para evocar confianza, autoridad y profesionalismo.
- Color de fondo: Gris claro de interfaz (#f0f2f5) que permite resaltar las tarjetas de contenido y componentes.
- Acento: Dorado Institucional (#c9a227) utilizado en botones críticos, insignias y estados activos para denotar calidad y distinción.
- Tipografía 'Inter' como fuente única para el sistema: limpia, moderna y altamente legible en contextos de gestión de datos. Nota: actualmente solo Google Fonts son soportados.
- Diseño modular de App Router con Sidebar fijo a la izquierda en pantallas grandes y colapsable en móviles para una navegación fluida.
- Uso de FontAwesome para iconografía técnica: cajeros, carritos, herramientas y gráficas de reporte para facilitar el reconocimiento visual de módulos.
- Transiciones sutiles de opacidad (0.3s) al cambiar de módulos y escalado controlado (modalUp) para la apertura de ventanas de diálogo y formularios.