const express = require('express');
const router = express.Router();
const pool = require('../database');

// Consultar todas las materias primas
router.get('/', async (req, res) => {
    try {
        const [materiasPrimas] = await pool.query(
            'SELECT * FROM materias_primas'
        );

        res.json(materiasPrimas);
    } catch (error) {
        console.error('Error al consultar materias primas:', error.message);
        res.status(500).json({
            error: 'Error al consultar las materias primas'
        });
    }
});

// Consultar una materia prima por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [materiasPrimas] = await pool.query(
            'SELECT * FROM materias_primas WHERE id = ?',
            [id]
        );

        if (materiasPrimas.length === 0) {
            return res.status(404).json({
                error: 'Materia prima no encontrada'
            });
        }

        res.json(materiasPrimas[0]);
    } catch (error) {
        console.error('Error al consultar materia prima:', error.message);
        res.status(500).json({
            error: 'Error al consultar la materia prima'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            unidad_base,
            stock_actual,
            stock_minimo,
            costo_unitario
        } = req.body;

        if (!nombre || !unidad_base) {
            return res.status(400).json({
                error: 'El nombre y la unidad base son obligatorios'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO materias_primas
            (nombre, unidad_base, stock_actual, stock_minimo, costo_unitario)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nombre,
                unidad_base,
                stock_actual ?? 0,
                stock_minimo ?? 0,
                costo_unitario ?? 0
            ]
        );

        res.status(201).json({
            mensaje: 'Materia prima registrada correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        console.error('Error al registrar materia prima:', error.message);
            console.error(error)
        res.status(500).json({
            error: 'Error al registrar la materia prima'
        });
    }
});
// Actualizar una materia prima
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            unidad_base,
            stock_actual,
            stock_minimo,
            costo_unitario
        } = req.body;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        if (
            !nombre ||
            !unidad_base ||
            stock_actual === undefined ||
            stock_minimo === undefined ||
            costo_unitario === undefined
        ) {
            return res.status(400).json({
                error: 'Debes proporcionar todos los datos de la materia prima'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE materias_primas
             SET nombre = ?,
                 unidad_base = ?,
                 stock_actual = ?,
                 stock_minimo = ?,
                 costo_unitario = ?
             WHERE id = ?`,
            [
                nombre,
                unidad_base,
                stock_actual,
                stock_minimo,
                costo_unitario,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Materia prima no encontrada'
            });
        }

        res.json({
            mensaje: 'Materia prima actualizada correctamente',
            id: Number(id)
        });

    } catch (error) {
        console.error('Error al actualizar materia prima:', error.message);

        res.status(500).json({
            error: 'Error al actualizar la materia prima'
        });
    }
});
// Eliminar una materia prima
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [resultado] = await pool.query(
            'DELETE FROM materias_primas WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Materia prima no encontrada'
            });
        }

        res.json({
            mensaje: 'Materia prima eliminada correctamente',
            id: Number(id)
        });

    } catch (error) {
        console.error('Error al eliminar materia prima:', error.message);

        res.status(500).json({
            error: 'Error al eliminar la materia prima'
        });
    }
});
module.exports = router; 