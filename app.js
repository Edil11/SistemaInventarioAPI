const express = require('express');

const app = express();
const PORT = 3000;

const clientesRoutes = require('./src/routes/clientes');
const materiasPrimasRoutes = require('./src/routes/materiasPrimas');
const movimientosInventarioRoutes = require('./src/routes/movimientosInventario');
const recetasRoutes = require('./src/routes/recetas');
const pedidosRoutes = require('./src/routes/pedidos');
const detallePedidoRoutes = require('./src/routes/detallePedido');
const pagosRoutes = require ('./src/routes/pagos');
const reservasInventarioRoutes = require ('./src/routes/reservasInventario');

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API del sistema de inventario funcionando correctamente'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        estado: 'activo'
    });
});

app.use('/api/clientes', clientesRoutes);
app.use('/api/materias-primas',materiasPrimasRoutes);
app.use('/api/movimientos-inventario',movimientosInventarioRoutes);
app.use('/api/recetas',recetasRoutes);
app.use('/api/pedidos',pedidosRoutes);
app.use('/api/detalle-pedido', detallePedidoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/reservas-inventario',reservasInventarioRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});