const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/AssetController');
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', UserController.login);

router.get('/user', authenticateToken, UserController.getCurrentUser);
router.put('/user/password', authenticateToken, UserController.changePassword);
router.get('/users', authenticateToken, UserController.getAllUsers);
router.post('/users', authenticateToken, UserController.createUser);
router.put('/users/:id', authenticateToken, UserController.updateUser);
router.delete('/users/:id', authenticateToken, UserController.deleteUser);

router.get('/assets', authenticateToken, AssetController.getAllAssets);
router.get('/assets/export/excel', authenticateToken, AssetController.exportAssetsExcel);
router.get('/assets/:id', authenticateToken, AssetController.getAssetById);
router.post('/assets', authenticateToken, AssetController.createAsset);
router.put('/assets/:id', authenticateToken, AssetController.updateAsset);
router.delete('/assets/:id', authenticateToken, AssetController.deleteAsset);

module.exports = router;
