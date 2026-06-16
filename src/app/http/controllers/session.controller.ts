import { Request, Response } from 'express';
import { successResponse, tryCatchAsync } from '@surefy/utils/Controller';
import { HttpStatusCode } from '@surefy/utils/HttpStatusCode';
import { AuthRequest } from '@surefy/middleware/auth.middleware';
import HTTP400Error from '@surefy/exceptions/HTTP400Error';
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import sessionService from '../../services/session.service';

class SessionController{
    /**
     * GET
     * stored_chatbot_session_data
     */
    getStoredSessions = tryCatchAsync(async(req:AuthRequest,res:Response)=>{
        const storedSessions = await sessionService.storedSession(req.companyId!)
        successResponse(req,res,"Stored session retrived succesfully",storedSessions)
    })
}

export default new SessionController();