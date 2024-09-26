import { Request,Response,NextFunction } from "express";
import bcrypt from 'bcrypt';
import ApiError from "../utils/api-error";
import ApiResponse from "../utils/api-response";
import asyncHandler from "../utils/async-handler";
import db from "../sequelize-client";
import {generateAccessToken,generateRefreshToken} from "../utils/jwt.token";
import encryption from "../utils/encryption";
import User from "../models/user.model";
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from '../constants/messages'

interface MyUserRequest extends Request{
    token?: string;
    user?: User;
  }

 export const registerUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const{email,password,firstName,lastName} = req.body;

    if(!email || !password || !firstName || !lastName) {
        return next(new ApiError(400,ERROR_MESSAGES.REQUIRED_FIELDS));
    }

    try {
   const newUser = await db.User.create({email,password,firstName,lastName});
   console.log("newUser",newUser);
   const response = new ApiResponse(201,newUser,SUCCESS_MESSAGES.USER_CREATED);
   console.log("response",response);
   res.status(201).json(response);
    } catch(error) {
        console.error(ERROR_MESSAGES.SOMETHING_ERROR,error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
 })


 export const loginUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
  const {email,password} = req.body;

  if (!email || !password) {
    return next(new ApiError(400, ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED));
  }

  try {
    const user = await db.User.findOne({where: {email}});
    if(!user)
    {
        return next(new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND)); 
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if (!isMatch) {
        return next(new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS));
      };
    const accessToken = generateAccessToken({userId:user.id,email:user.email});
    const refreshToken = generateRefreshToken({ userId: user.id });

    const encryptedAccessToken = encryption.encryptWithAES(accessToken);
    const encryptedRefreshToken = encryption.encryptWithAES(refreshToken);

    await db.AccessToken.bulkCreate([
        {
            tokenType: 'ACCESS',
            token: encryptedAccessToken,
            userId: user.id,
            expiredAt: new Date(Date.now() + 60 * 60 * 1000),
          },
          {
            tokenType: 'REFRESH',
            token: encryptedRefreshToken,
            userId: user.id,
            expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
    ]);
    const response = new ApiResponse(201,{accessToken,refreshToken,user},SUCCESS_MESSAGES.LOGIN_SUCCESS);
    res.status(200).send(response);
  } catch(error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
 })


export const logoutUser = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
const token = req.token;
console.log(token);
if(!token) {
    return next(new ApiError(401,ERROR_MESSAGES.TOKEN_NOT_FOUND));
}    

try {
    const deletedToken = await db.AccessToken.destroy({
        where:{
            token,tokenType: 'ACCESS'
        }
    });

    if(deletedToken == 0) {
        return next(new ApiError(401,ERROR_MESSAGES.TOKEN_NOT_FOUND));
    }

    await db.AccessToken.destroy({
        where:{userId:req.user?.id,tokenType:'REFRESH'}
    });

    const response = new ApiResponse(200,null,SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    res.status(200).json(response);
}  catch(error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR,error)
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
}

})