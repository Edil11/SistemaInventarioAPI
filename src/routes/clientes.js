const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
    try {
        const [clientes] = await pool.query(
            'SELECT * FROM clientes'
        );

        res.json(clientes);
    } catch (error) {
        console.error('Error al consultar clientes:', error.message);
        res.status(500).json({
            error: 'Error al consultar los clientes'
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

        const [clientes] = await pool.query(
            'SELECT * FROM clientes WHERE id = ?',
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        res.json(clientes[0]);

    } catch (error) {
        console.error('Error al consultar cliente:', error.message);

        res.status(500).json({
            error: 'Error al consultar el cliente'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { nombre, telefono, observaciones } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'El nombre del cliente es obligatorio'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO clientes (nombre, telefono, observaciones)
             VALUES (?, ?, ?)`,
            [
                nombre.trim(),
                telefono || null,
                observaciones || null
            ]
        );

        res.status(201).json({
            mensaje: 'Cliente registrado correctamente',
            id: resultado.insertId,
            nombre: nombre.trim(),
            telefono: telefono || null,
            observaciones: observaciones || null
        });

    } catch (error) {
        console.error('Error al registrar cliente:', error.message);

        res.status(500).json({
            error: 'Error al registrar el cliente'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, observaciones } = req.body;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'El nombre es obligatorio'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE clientes
             SET nombre = ?, telefono = ?, observaciones = ?
             WHERE id = ?`,
            [
                nombre.trim(),
                telefono || null,
                observaciones || null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            const [clientes] = await pool.query(
                'SELECT id FROM clientes WHERE id = ?',
                [id]
            );

            if (clientes.length === 0) {
                return res.status(404).json({
                    error: 'Cliente no encontrado'
                });
            }
        }

        res.json({
            mensaje: 'Cliente actualizado correctamente',
            id: Number(id)
        });

            } catch (error) {
        console.error('Error al actualizar cliente:', error.message);

        res.status(500).json({
            error: 'Error al actualizar el cliente'
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

        const [resultado] = await pool.query(
            'DELETE FROM clientes WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        res.json({
            mensaje: 'Cliente eliminado correctamente',
            id: Number(id)
        });

    } catch (error) {
        console.error(
            'Error al eliminar cliente:',
            error.message
        );

        res.status(500).json({
            error: 'Error al eliminar el cliente'
        });
    }
});
module.exports = router;