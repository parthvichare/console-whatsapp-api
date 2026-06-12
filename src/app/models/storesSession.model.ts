import { BaseModel } from '@surefy/models/base.model';

class storedSessionModel extends BaseModel {
  constructor() {
    super('stored_session_data');
  }

  async findByPhoneNumber(phone_number: any) {
    return this.query().where({ phone_number: phone_number }).first();
  }

}

export default new storedSessionModel();
