import { Router } from 'express';
import { uploadMediaMiddleware } from '@surefy/middleware/upload.middleware';


const catalogRoute = Router()

catalogRoute.get('/groups')
catalogRoute.post('/groups')
catalogRoute.post('groups/:groupId/variants',uploadMediaMiddleware)
