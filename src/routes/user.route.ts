import { Router } from "express";
import{registerUser,loginUser,logoutUser} from '../controllers/user.controller';
import{USER_ROUTES}from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware'


const router = Router();
router.post( USER_ROUTES.REGISTER,registerUser);
router.post(USER_ROUTES.LOGIN,loginUser);
router.post(USER_ROUTES.LOGOUT,verifyToken,logoutUser);

export default router;