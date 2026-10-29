const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        const [pagos] = await db.query(`
            SELECT
                id,
                pedido_id,
                fecha_pago,
                monto,
                metodo_pago,
                referencia,
                observaciones
            FROM pagos
            ORDER BY id DESC
        `);

        res.json(pagos);
    } catch (error) {
        console.error('Error al consultar pagos:', error);
        res.status(500).json({ error: 'Error al consultar los pagos' });
    }
});

router.get('/pedido/:pedidoId', async (req, res) => {
    try {
        const pedidoId = Number(req.params.pedidoId);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ error: 'El ID del pedido no es válido' });
        }

        const [pagos] = await db.query(
            `SELECT id, pedido_id, fecha_pago, monto, metodo_pago,
                    referencia, observaciones
             FROM pagos
             WHERE pedido_id = ?
             ORDER BY id DESC`,
            [pedidoId]
        );

        res.json(pagos);
    } catch (error) {
        console.error('Error al consultar pagos del pedido:', error);
        res.status(500).json({ error: 'Error al consultar los pagos del pedido' });
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

        const [filas] = await db.query(`
            SELECT
                p.id AS pedido_id,
                p.precio_total AS total_pedido,
                COALESCE(SUM(pg.monto), 0) AS total_pagado,
                GREATEST(
                    p.precio_total - COALESCE(SUM(pg.monto), 0),
                    0
                ) AS saldo_pendiente
            FROM pedidos p
            LEFT JOIN pagos pg ON pg.pedido_id = p.id
            WHERE p.id = ?
            GROUP BY p.id, p.precio_total
        `, [pedidoId]);

        if (filas.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        res.json(filas[0]);
    } catch (error) {
        console.error('Error al consultar el saldo:', error);
        res.status(500).json({
            error: 'Error al consultar el saldo del pedido'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            pedido_id,
            monto,
            metodo_pago,
            referencia,
            observaciones
        } = req.body;

        const pedidoId = Number(pedido_id);
        const cantidad = Number(monto);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ error: 'El ID del pedido no es válido' });
        }

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            return res.status(400).json({ error: 'El monto debe ser mayor que cero' });
        }

         const metodosPermitidos = [
        'efectivo',
        'transferencia',
        'tarjeta',
        'otro'
        ];

        if (!metodosPermitidos.includes(metodo_pago)) {
            return res.status(400).json({
                error: 'Método de pago no válido',
                metodos_permitidos: metodosPermitidos
            });
        }

        const [pedidos] = await db.query(
            'SELECT id FROM pedidos WHERE id = ?',
            [pedidoId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({ error: 'El pedido no existe' });
        }
        const [pagosPrevios] = await db.query(
    `SELECT COALESCE(SUM(monto), 0) AS total_pagado
     FROM pagos
     WHERE pedido_id = ?`,
    [pedidoId]
);

const [datosPedido] = await db.query(
    'SELECT precio_total FROM pedidos WHERE id = ?',
    [pedidoId]
);

const totalPedido = Number(datosPedido[0].precio_total);
const totalPagado = Number(pagosPrevios[0].total_pagado);
const saldoPendiente = totalPedido - totalPagado;

if (cantidad > saldoPendiente) {
    return res.status(409).json({
        error: 'El pago supera el saldo pendiente',
        saldo_pendiente: Math.max(0, saldoPendiente)
    });
}

        const [resultado] = await db.query(
            `INSERT INTO pagos
                (pedido_id, monto, metodo_pago, referencia, observaciones)
             VALUES (?, ?, ?, ?, ?)`,
            [
                pedidoId,
                cantidad,
                metodo_pago,
                referencia || null,
                observaciones || null
            ]
        );

        res.status(201).json({
            mensaje: 'Pago registrado correctamente',
            id: resultado.insertId,
            pedido_id: pedidoId,
            monto: cantidad,
            metodo_pago
        });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ error: 'Error al registrar el pago' });
    }
});

module.exports = router;