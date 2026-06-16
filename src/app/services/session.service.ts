import HTTP404Error from '@surefy/exceptions/HTTP404Error';
import HTTP400Error from '@surefy/exceptions/HTTP400Error';
import storesSessionModel from '../models/storesSession.model';

class SessionService{
    async storedSession(company_id:string){
        const session_data = await storesSessionModel.getSessionsByCompanyId(company_id)
        return session_data
    }
}

export default new SessionService()