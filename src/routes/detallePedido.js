const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        const [filas] = await db.query(`
            SELECT
                dp.id,
                dp.pedido_id,
                dp.receta_id,
                dp.nombre_pastel,
                dp.version_receta,
                dp.libras,
                dp.precio_por_libra,
                dp.subtotal
            FROM detalle_pedido dp
            ORDER BY dp.id DESC
        `);

        res.json(filas);
    } catch (error) {
        console.error('Error al consultar detalles:', error);
        res.status(500).json({ error: 'Error al consultar los detalles de los pedidos' });
    }
});

router.get('/pedido/:pedidoId', async (req, res) => {
    try {
        const pedidoId = Number(req.params.pedidoId);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ error: 'El ID del pedido no es válido' });
        }

        const [filas] = await db.query(`
            SELECT
                dp.id,
                dp.pedido_id,
                dp.receta_id,
                dp.nombre_pastel,
                dp.version_receta,
                dp.libras,
                dp.precio_por_libra,
                dp.subtotal
            FROM detalle_pedido dp
            WHERE dp.pedido_id = ?
            ORDER BY dp.id
        `, [pedidoId]);

        res.json(filas);
    } catch (error) {
        console.error('Error al consultar el pedido:', error);
        res.status(500).json({ error: 'Error al consultar los detalles del pedido' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            pedido_id,
            receta_id,
            nombre_pastel,
            version_receta,
            libras,
            precio_por_libra
        } = req.body;

        if (
            !Number.isInteger(Number(pedido_id)) || Number(pedido_id) <= 0 ||
            !Number.isInteger(Number(receta_id)) || Number(receta_id) <= 0 ||
            !nombre_pastel ||
            !Number.isInteger(Number(version_receta)) || Number(version_receta) <= 0 ||
            !Number.isFinite(Number(libras)) || Number(libras) <= 0 ||
            !Number.isFinite(Number(precio_por_libra)) || Number(precio_por_libra) < 0
        ) {
            return res.status(400).json({
                error: 'Verifica pedido_id, receta_id, nombre_pastel, version_receta, libras y precio_por_libra'
            });
        }

        const [pedidos] = await db.query(
            'SELECT id FROM pedidos WHERE id = ?',
            [Number(pedido_id)]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({ error: 'El pedido no existe' });
        }

        const [recetas] = await db.query(
            'SELECT nombre, version FROM recetas WHERE id = ? AND version = ?',
            [Number(receta_id), Number(version_receta)]
        );

        if (recetas.length === 0) {
            return res.status(404).json({
                error: 'La receta o su versión no existen'
            });
        }

        const nombreFinal = recetas[0].nombre;

        const precio = Number(precio_por_libra);
        const cantidad = Number(libras);
        const subtotal = Number((cantidad * precio).toFixed(2));

        const [resultado] = await db.query(`
            INSERT INTO detalle_pedido
                (pedido_id, receta_id, nombre_pastel, version_receta,
                 libras, precio_por_libra, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            Number(pedido_id),
            Number(receta_id),
            nombreFinal,
            Number(version_receta),
            cantidad,
            precio,
            subtotal
        ]);
        await db.query(
    `UPDATE pedidos
     SET precio_total = (
         SELECT COALESCE(SUM(subtotal), 0)
         FROM detalle_pedido
         WHERE pedido_id = ?
     )
     WHERE id = ?`,
    [Number(pedido_id), Number(pedido_id)]
);

        res.status(201).json({
            mensaje: 'Pastel agregado al pedido correctamente',
            id: resultado.insertId,
            pedido_id: Number(pedido_id),
            receta_id: Number(receta_id),
            nombre_pastel: nombreFinal,
            libras: cantidad,
            precio_por_libra: precio,
            subtotal
        });
    } catch (error) {
        console.error('Error al registrar el detalle:', error);
        res.status(500).json({
            error: 'Error al registrar el pastel en el pedido'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID del detalle no es válido'
            });
        }

        const [detalles] = await db.query(
            `SELECT
                id,
                pedido_id,
                receta_id,
                nombre_pastel,
                version_receta,
                libras,
                precio_por_libra,
                subtotal
             FROM detalle_pedido
             WHERE id = ?`,
            [id]
        );

        if (detalles.length === 0) {
            return res.status(404).json({
                error: 'Detalle de pedido no encontrado'
            });
        }

        res.json(detalles[0]);

    } catch (error) {
        console.error('Error al consultar el detalle:', error);
        res.status(500).json({
            error: 'Error al consultar el detalle del pedido'
        });
    }
});
module.exports = router;