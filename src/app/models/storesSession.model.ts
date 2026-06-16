import { BaseModel } from '@surefy/models/base.model';

class storedSessionModel extends BaseModel {
  constructor() {
    super('stored_session_data');
  }

  async findByPhoneNumber(phone_number: any) {
    return await this.query().where({ phone_number: phone_number }).first();
  }

  async getSessionsByCompanyId(company_id:string){
    return await this.query().where({company_id:company_id}).first()
  }

}

export default new storedSessionModel();
