const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users, errors: null });
});

router.post(
  '/',
  [
    body('password')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[A-Z])(?=.*\d).+$/).withMessage('La contraseña debe contener al menos 1 letra mayúscula y 1 número')
  ],
  async (req, res) => {
    const { name, email, password } = req.body;

    // Verificar los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Los errores de validación están presentes, mostrar mensajes de error en la página
      const errorMessages = errors.array().map(error => error.msg);
      const users = await User.find();
      return res.render('index', { users, errors: errorMessages });
    }

    try {
      // Generar el hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword
      });

      await newUser.save();
      res.redirect('/users');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.redirect('/users');
    }
  }
);

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user, errors: null });
});

router.post(
  '/update/:id',
  [
    body('password')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[A-Z])(?=.*\d).+$/).withMessage('La contraseña debe contener al menos 1 letra mayúscula y 1 número')
  ],
  async (req, res) => {
    const { name, email, password } = req.body;

    // Verificar los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Los errores de validación están presentes, mostrar mensajes de error en la página de edición
      const errorMessages = errors.array().map(error => error.msg);
      const user = await User.findById(req.params.id);
      return res.render('partials/edit', { user, errors: errorMessages });
    }

    try {
      await User.findByIdAndUpdate(req.params.id, req.body);
      res.redirect('/users');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.redirect('/users');
    }
  }
);

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
