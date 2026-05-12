const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { checkRole, checkOwnership, authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Create product (Admin or Seller)
router.post(
  '/',
  authenticate,
  checkRole(['admin', 'seller']),
  upload.array('images', 5), // max 5 images
  productController.createProduct
);

// // Public GET products
router.get('/',
 productController.getProducts);


// Get Single Product
router.get(
  "/:id",
  productController.getProductById
);

// // Update/Delete product - ownership enforced
router.put('/:id',
  authenticate,
  checkRole(['admin', 'seller']),
  checkOwnership,
  upload.array('images', 5),
  productController.updateProduct // you will create this
);

router.delete('/:id',
  authenticate,
  checkRole(['admin', 'seller']),
  checkOwnership,
  productController.deleteProduct
);


module.exports = router;