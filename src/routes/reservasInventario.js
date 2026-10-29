const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT
                ri.id,
                ri.detalle_pedido_id,
                ri.materia_prima_id,
                mp.nombre AS materia_prima,
                ri.cantidad,
                ri.estado,
                ri.fecha_creacion
            FROM reservas_inventario ri
            INNER JOIN materias_primas mp
                ON mp.id = ri.materia_prima_id
            ORDER BY ri.id DESC
        `);

        res.json(reservas);
    } catch (error) {
        console.error('Error al consultar reservas:', error);
        res.status(500).json({
            error: 'Error al consultar las reservas'
        });
    }
});

router.get('/detalle/:detallePedidoId', async (req, res) => {
    try {
        const detallePedidoId = Number(req.params.detallePedidoId);

        if (!Number.isInteger(detallePedidoId) || detallePedidoId <= 0) {
            return res.status(400).json({
                error: 'El ID del detalle del pedido no es válido'
            });
        }

        const [reservas] = await db.query(`
            SELECT
                ri.id,
                ri.detalle_pedido_id,
                ri.materia_prima_id,
                mp.nombre AS materia_prima,
                ri.cantidad,
                ri.estado,
                ri.fecha_creacion
            FROM reservas_inventario ri
            INNER JOIN materias_primas mp
                ON mp.id = ri.materia_prima_id
            WHERE ri.detalle_pedido_id = ?
            ORDER BY ri.id DESC
        `, [detallePedidoId]);

        res.json(reservas);
    } catch (error) {
        console.error('Error al consultar reservas del detalle:', error);
        res.status(500).json({
            error: 'Error al consultar las reservas del detalle'
        });
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
            `SELECT COALESCE(SUM(monto), 0) AS total_pagado
             FROM pagos
             WHERE pedido_id = ?`,
            [pedidoId]
        );

        const totalPedido = Number(pedidos[0].precio_total);
        const totalPagado = Number(pagos[0].total_pagado);

        res.json({
            pedido_id: pedidoId,
            total_pedido: totalPedido.toFixed(2),
            total_pagado: totalPagado.toFixed(2),
            saldo_pendiente: Math.max(
                0,
                totalPedido - totalPagado
            ).toFixed(2)
        });
    } catch (error) {
        console.error('Error al consultar saldo:', error);
        res.status(500).json({
            error: 'Error al consultar el saldo del pedido'
        });
    }
});
 
router.post('/', async (req, res) => {
    const detalleId = Number(req.body.detalle_pedido_id);
    const materiaId = Number(req.body.materia_prima_id);
    const cantidadReserva = Number(req.body.cantidad);

    if (
        !Number.isInteger(detalleId) || detalleId <= 0 ||
        !Number.isInteger(materiaId) || materiaId <= 0 ||
        !Number.isFinite(cantidadReserva) || cantidadReserva <= 0
    ) {
        return res.status(400).json({
            error: 'Debes enviar un detalle de pedido, una materia prima y una cantidad válida'
        });
    }

    let conexion;

    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [detalles] = await conexion.query(
            'SELECT id FROM detalle_pedido WHERE id = ? FOR UPDATE',
            [detalleId]
        );

        if (detalles.length === 0) {
            await conexion.rollback();
            return res.status(404).json({
                error: 'El detalle del pedido no existe'
            });
        }

        const [materias] = await conexion.query(
            'SELECT id, stock_actual FROM materias_primas WHERE id = ? FOR UPDATE',
            [materiaId]
        );

        if (materias.length === 0) {
            await conexion.rollback();
            return res.status(404).json({
                error: 'La materia prima no existe'
            });
        }

        const [existentes] = await conexion.query(
            `SELECT id, cantidad
             FROM reservas_inventario
             WHERE detalle_pedido_id = ?
               AND materia_prima_id = ?
               AND estado = 'reservada'
             FOR UPDATE`,
            [detalleId, materiaId]
        );

        const idExistente = existentes.length > 0
            ? existentes[0].id
            : null;

        const [reservasActivas] = await conexion.query(
            `SELECT COALESCE(SUM(cantidad), 0) AS total
             FROM reservas_inventario
             WHERE materia_prima_id = ?
               AND estado = 'reservada'
               AND (? IS NULL OR id <> ?)`,
            [materiaId, idExistente, idExistente]
        );

        const stockDisponible =
            Number(materias[0].stock_actual) -
            Number(reservasActivas[0].total);

        if (cantidadReserva > stockDisponible) {
            await conexion.rollback();
            return res.status(409).json({
                error: 'No hay suficiente inventario disponible',
                stock_disponible: Math.max(0, stockDisponible)
            });
        }

        let reservaId;
        let mensaje;

        if (existentes.length > 0) {
            // Actualizar la reserva existente en vez de duplicarla
            reservaId = existentes[0].id;

            await conexion.query(
                `UPDATE reservas_inventario
                 SET cantidad = ?
                 WHERE id = ?`,
                [cantidadReserva, reservaId]
            );

            mensaje = 'Reserva actualizada correctamente';
        } else {
            // Registrar una nueva reserva
            const [resultado] = await conexion.query(
                `INSERT INTO reservas_inventario
                    (detalle_pedido_id, materia_prima_id, cantidad, estado)
                 VALUES (?, ?, ?, 'reservada')`,
                [detalleId, materiaId, cantidadReserva]
            );

            reservaId = resultado.insertId;
            mensaje = 'Reserva registrada correctamente';
        }

        await conexion.commit();

        return res.status(200).json({
            mensaje,
            id: reservaId,
            detalle_pedido_id: detalleId,
            materia_prima_id: materiaId,
            cantidad: cantidadReserva,
            estado: 'reservada'
        });
    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error('Error al registrar o actualizar reserva:', error);

        return res.status(500).json({
            error: 'Error al registrar o actualizar la reserva'
        });
    } finally {
        if (conexion) {
            conexion.release();
        }
    }
});
router.patch('/:id/estado', async (req, res) => {
    const reservaId = Number(req.params.id);
    const { estado } = req.body;

    if (!Number.isInteger(reservaId) || reservaId <= 0) {
        return res.status(400).json({
            mensaje: 'ID de reserva no válido'
        });
    }

    if (!['consumida', 'liberada'].includes(estado)) {
        return res.status(400).json({
            mensaje: 'El estado debe ser consumida o liberada'
        });
    }

    let conexion;

    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [reservas] = await conexion.query(
            `SELECT id, detalle_pedido_id, materia_prima_id, cantidad, estado
             FROM reservas_inventario
             WHERE id = ?
             FOR UPDATE`,
            [reservaId]
        );

        if (reservas.length === 0) {
            await conexion.rollback();
            return res.status(404).json({
                mensaje: 'Reserva no encontrada'
            });
        }

        const reserva = reservas[0];

        if (reserva.estado !== 'reservada') {
            await conexion.rollback();
            return res.status(409).json({
                mensaje: `La reserva ya está ${reserva.estado}`
            });
        }

        if (estado === 'consumida') {
            const [materias] = await conexion.query(
                `SELECT id, stock_actual
                 FROM materias_primas
                 WHERE id = ?
                 FOR UPDATE`,
                [reserva.materia_prima_id]
            );

            if (materias.length === 0) {
                await conexion.rollback();
                return res.status(404).json({
                    mensaje: 'Materia prima no encontrada'
                });
            }

            const cantidad = Number(reserva.cantidad);
            const stock = Number(materias[0].stock_actual);

            if (stock < cantidad) {
                await conexion.rollback();
                return res.status(409).json({
                    mensaje: 'Stock insuficiente para consumir la reserva',
                    stock_actual: stock,
                    cantidad_requerida: cantidad
                });
            }

            await conexion.query(
                `UPDATE materias_primas
                 SET stock_actual = stock_actual - ?
                 WHERE id = ?`,
                [cantidad, reserva.materia_prima_id]
            );

            await conexion.query(
                `INSERT INTO movimientos_inventario
                (materia_prima_id, tipo_movimiento, cantidad,
                 detalle_pedido_id, observaciones)
                VALUES (?, 'consumo', ?, ?, ?)`,
                [
                    reserva.materia_prima_id,
                    cantidad,
                    reserva.detalle_pedido_id,
                    `Consumo de reserva ${reserva.id}`
                ]
            );
        }

        await conexion.query(
            `UPDATE reservas_inventario
             SET estado = ?
             WHERE id = ?`,
            [estado, reservaId]
        );

        await conexion.commit();

        return res.json({
            mensaje: estado === 'consumida'
                ? 'Reserva consumida y stock actualizado correctamente'
                : 'Reserva liberada correctamente',
            id: reservaId,
            estado: estado
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error('Error al actualizar reserva:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar la reserva'
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
});
module.exports = router;