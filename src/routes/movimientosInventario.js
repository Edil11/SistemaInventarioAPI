const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
    try {
        const [movimientos] = await pool.query(`
            SELECT
                mi.id,
                mi.materia_prima_id,
                mp.nombre AS materia_prima,
                mi.tipo_movimiento,
                mi.cantidad,
                mi.fecha,
                mi.detalle_pedido_id,
                mi.observaciones
            FROM movimientos_inventario mi
            INNER JOIN materias_primas mp
                ON mi.materia_prima_id = mp.id
            ORDER BY mi.fecha DESC
        `);

        res.json(movimientos);

    } catch (error) {
        console.error('Error al consultar movimientos:', error.message);

        res.status(500).json({
            error: 'Error al consultar los movimientos de inventario'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [movimientos] = await pool.query(`
            SELECT
                mi.id,
                mi.materia_prima_id,
                mp.nombre AS materia_prima,
                mi.tipo_movimiento,
                mi.cantidad,
                mi.fecha,
                mi.detalle_pedido_id,
                mi.observaciones
            FROM movimientos_inventario mi
            INNER JOIN materias_primas mp
                ON mi.materia_prima_id = mp.id
            WHERE mi.id = ?
        `, [id]);

        if (movimientos.length === 0) {
            return res.status(404).json({
                error: 'Movimiento de inventario no encontrado'
            });
        }

        res.json(movimientos[0]);

    } catch (error) {
        console.error('Error al consultar movimiento:', error.message);

        res.status(500).json({
            error: 'Error al consultar el movimiento de inventario'
        });
    }
});

router.post('/', async (req, res) => {
    const {
        materia_prima_id,
        tipo_movimiento,
        cantidad,
        detalle_pedido_id,
        observaciones
    } = req.body;

    const tiposPermitidos = [
        'entrada',
        'consumo',
        'desperdicio',
        'ajuste_positivo',
        'ajuste_negativo',
        'reversion_consumo'
    ];

    
    if (
        materia_prima_id === undefined ||
        !Number.isSafeInteger(Number(materia_prima_id)) ||
        Number(materia_prima_id) <= 0
    ) {
        return res.status(400).json({
            error: 'Debes proporcionar un ID de materia prima válido'
        });
    }

    if (!tiposPermitidos.includes(tipo_movimiento)) {
        return res.status(400).json({
            error: 'El tipo de movimiento no es válido'
        });
    }

    const cantidadNumerica = Number(cantidad);

    if (
        cantidad === undefined ||
        cantidad === null ||
        cantidad === '' ||
        !Number.isFinite(cantidadNumerica) ||
        cantidadNumerica <= 0 ||
        Math.round(cantidadNumerica * 1000) / 1000 !== cantidadNumerica
    ) {
        return res.status(400).json({
            error: 'La cantidad debe ser mayor que cero y tener como máximo tres decimales'
        });
    }

    if (
        detalle_pedido_id !== undefined &&
        detalle_pedido_id !== null &&
        (
            !Number.isSafeInteger(Number(detalle_pedido_id)) ||
            Number(detalle_pedido_id) <= 0
        )
    ) {
        return res.status(400).json({
            error: 'El ID del detalle del pedido no es válido'
        });
    }

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        
        const [materias] = await conexion.query(
            `SELECT id, stock_actual
             FROM materias_primas
             WHERE id = ? AND activo = 1
             FOR UPDATE`,
            [materia_prima_id]
        );

        if (materias.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                error: 'La materia prima no existe o está inactiva'
            });
        }

        const stockActual = Number(materias[0].stock_actual);
        let nuevoStock = stockActual;

        
        switch (tipo_movimiento) {
            case 'entrada':
            case 'ajuste_positivo':
            case 'reversion_consumo':
                nuevoStock += cantidadNumerica;
                break;

            case 'consumo':
            case 'desperdicio':
            case 'ajuste_negativo':
                nuevoStock -= cantidadNumerica;
                break;
        }

        if (nuevoStock < 0) {
            await conexion.rollback();

            return res.status(409).json({
                error: 'No hay existencias suficientes para este movimiento',
                stock_actual: stockActual,
                cantidad_solicitada: cantidadNumerica
            });
        }

        
        const [resultado] = await conexion.query(
            `INSERT INTO movimientos_inventario
                (materia_prima_id, tipo_movimiento, cantidad,
                 detalle_pedido_id, observaciones)
             VALUES (?, ?, ?, ?, ?)`,
            [
                materia_prima_id,
                tipo_movimiento,
                cantidadNumerica,
                detalle_pedido_id ?? null,
                observaciones ?? null
            ]
        );

        
        await conexion.query(
            `UPDATE materias_primas
             SET stock_actual = ?
             WHERE id = ?`,
            [nuevoStock, materia_prima_id]
        );

        await conexion.commit();

        return res.status(201).json({
            mensaje: 'Movimiento de inventario registrado correctamente',
            id: resultado.insertId,
            materia_prima_id: Number(materia_prima_id),
            tipo_movimiento,
            cantidad: cantidadNumerica,
            stock_anterior: stockActual,
            stock_nuevo: nuevoStock
        });

    } catch (error) {
        await conexion.rollback();

        console.error(
            'Error al registrar movimiento de inventario:',
            error.message
        );

        return res.status(500).json({
            error: 'Error al registrar el movimiento de inventario'
        });

    } finally {
        conexion.release();
    }
});
router.get('/saldo/:pedidoId', async (req, res) => {
    try {
        const pedidoId = Number(req.params.pedidoId);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({
                error: 'El ID del pedido no es válido'
            });
        }

        const [pedidos] = await db.query(
            'SELECT id, precio_total FROM pedidos WHERE id = ?',
            [pedidoId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        const [pagos] = await db.query(
            'SELECT COALESCE(SUM(monto), 0) AS total_pagado FROM pagos WHERE pedido_id = ?',
            [pedidoId]
        );

        const totalPedido = Number(pedidos[0].precio_total);
        const totalPagado = Number(pagos[0].total_pagado);

        res.json({
            pedido_id: pedidoId,
            total_pedido: totalPedido.toFixed(2),
            total_pagado: totalPagado.toFixed(2),
            saldo_pendiente: Math.max(0, totalPedido - totalPagado).toFixed(2)
        });
    } catch (error) {
        console.error('Error al consultar saldo:', error);
        res.status(500).json({
            error: 'Error al consultar el saldo del pedido'
        });
    }
});
module.exports = router;