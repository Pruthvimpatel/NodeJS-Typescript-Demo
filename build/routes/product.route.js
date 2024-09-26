"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const routes_constants_1 = require("../constants/routes.constants");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post(routes_constants_1.PRODUCT_ROUTES.CREATE, auth_middleware_1.verifyToken, product_controller_1.createProduct);
router.get(routes_constants_1.PRODUCT_ROUTES.GET, auth_middleware_1.verifyToken, product_controller_1.getProducts);
router.put(routes_constants_1.PRODUCT_ROUTES.UPDATE, auth_middleware_1.verifyToken, product_controller_1.updateProducts);
router.delete(routes_constants_1.PRODUCT_ROUTES.DELETE, auth_middleware_1.verifyToken, product_controller_1.deleteProduct);
exports.default = router;
