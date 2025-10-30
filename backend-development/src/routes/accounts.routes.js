// src/routes/accounts.routes.js
const express = require('express');
const router = express.Router();
const accounts = require('../controllers/accounts.controller');

// List & detail
router.get('/', accounts.list);          // GET /api/v1/accounts
router.get('/:id', accounts.detail);     // GET /api/v1/accounts/:id

// Create & update
router.post('/', accounts.create);       // POST /api/v1/accounts
router.put('/:id', accounts.update);     // PUT /api/v1/accounts/:id

// Set roles (replace)
router.put('/:id/roles', accounts.setRoles); // PUT /api/v1/accounts/:id/roles

// Delete
router.delete('/:id', accounts.remove);  // DELETE /api/v1/accounts/:id

module.exports = router;
