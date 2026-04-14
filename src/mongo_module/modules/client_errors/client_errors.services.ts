import ClientError from "../../models/clientError";

class ClientErrorsService {
    static async recordClientError(payload: Record<string, unknown>) {
        return ClientError.create(payload);
    }
}

export default ClientErrorsService;
