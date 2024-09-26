import { Router } from "express";

import {createProduct,getProducts,updateProducts,deleteProduct} from '../controllers/product.controller';

import {PRODUCT_ROUTES} from '../constants/routes.constants';

import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post(PRODUCT_ROUTES.CREATE,verifyToken,createProduct);

router.get(PRODUCT_ROUTES.GET,verifyToken,getProducts);

router.put(PRODUCT_ROUTES.UPDATE,verifyToken,updateProducts);

router.delete(PRODUCT_ROUTES.DELETE,verifyToken,deleteProduct);


export default router;