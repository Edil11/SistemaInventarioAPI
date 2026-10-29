const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
    try {
        const [pedidos] = await pool.query(`
            SELECT
                p.id,
                p.cliente_id,
                c.nombre AS cliente,
                p.fecha_pedido,
                p.fecha_entrega,
                p.estado,
                p.precio_total,
                p.observaciones
            FROM pedidos p
            INNER JOIN clientes c ON c.id = p.cliente_id
            ORDER BY p.id DESC
        `);

        res.json(pedidos);

    } catch (error) {
        console.error('Error al consultar pedidos:', error.message);

        res.status(500).json({
            error: 'Error al consultar los pedidos'
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

        const [pedidos] = await pool.query(`
            SELECT
                p.id,
                p.cliente_id,
                c.nombre AS cliente,
                p.fecha_pedido,
                p.fecha_entrega,
                p.estado,
                p.precio_total,
                p.observaciones
            FROM pedidos p
            INNER JOIN clientes c ON c.id = p.cliente_id
            WHERE p.id = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        res.json(pedidos[0]);

    } catch (error) {
        console.error('Error al consultar pedido:', error.message);

        res.status(500).json({
            error: 'Error al consultar el pedido'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            cliente_id,
            fecha_entrega,
            observaciones
        } = req.body;

        if (
            !Number.isInteger(Number(cliente_id)) ||
            Number(cliente_id) <= 0
        ) {
            return res.status(400).json({
                error: 'Debes indicar un ID de cliente válido'
            });
        }

        const [clientes] = await pool.query(
            'SELECT id FROM clientes WHERE id = ?',
            [cliente_id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                error: 'El cliente no existe'
            });
        }

        if (fecha_entrega) {
            const fecha = new Date(fecha_entrega);

            if (Number.isNaN(fecha.getTime())) {
                return res.status(400).json({
                    error: 'La fecha de entrega no es válida'
                });
            }
        }

        const [resultado] = await pool.query(
            `INSERT INTO pedidos
                (cliente_id, fecha_entrega, observaciones)
             VALUES (?, ?, ?)`,
            [
                cliente_id,
                fecha_entrega || null,
                observaciones || null
            ]
        );

        res.status(201).json({
            mensaje: 'Pedido registrado correctamente',
            id: resultado.insertId,
            cliente_id: Number(cliente_id),
            estado: 'pendiente'
        });

    } catch (error) {
        console.error('Error al registrar pedido:', error.message);

        res.status(500).json({
            error: 'Error al registrar el pedido'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, fecha_entrega, observaciones } = req.body;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [pedidos] = await pool.query(
            'SELECT id FROM pedidos WHERE id = ?',
            [id]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        const campos = [];
        const valores = [];

        if (estado !== undefined) {
            const estadosPermitidos = [
                'pendiente',
                'confirmado',
                'en_preparacion',
                'listo',
                'entregado',
                'cancelado'
            ];

            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    error: 'El estado indicado no es válido'
                });
            }

            campos.push('estado = ?');
            valores.push(estado);
        }

        if (fecha_entrega !== undefined) {
            const fecha = new Date(fecha_entrega);

            if (Number.isNaN(fecha.getTime())) {
                return res.status(400).json({
                    error: 'La fecha de entrega no es válida'
                });
            }

            campos.push('fecha_entrega = ?');
            valores.push(fecha_entrega);
        }

        if (observaciones !== undefined) {
            campos.push('observaciones = ?');
            valores.push(observaciones);
        }

        if (campos.length === 0) {
            return res.status(400).json({
                error: 'Debes enviar al menos un campo para actualizar'
            });
        }

        valores.push(id);

        await pool.query(
            `UPDATE pedidos SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );

        res.json({
            mensaje: 'Pedido actualizado correctamente',
            id: Number(id)
        });

    } catch (error) {
        console.error('Error al actualizar pedido:', error.message);

        res.status(500).json({
            error: 'Error al actualizar el pedido'
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [pedidos] = await pool.query(
            'SELECT id FROM pedidos WHERE id = ?',
            [id]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        await pool.query(
            'DELETE FROM pedidos WHERE id = ?',
            [id]
        );

        res.json({
            mensaje: 'Pedido eliminado correctamente',
            id: Number(id)
        });

   } catch (error) {
    console.error('Error al eliminar pedido:', error.message);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
            error: 'No se puede eliminar el pedido porque tiene pasteles asociados'
        });
    }

    res.status(500).json({
        error: 'Error al eliminar el pedido'
    });
}
});
module.exports = router;