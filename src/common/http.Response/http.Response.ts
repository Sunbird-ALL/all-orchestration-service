class HttpResponse<Apiversion = any, Query = any, Result = any, Error = any, Message = any> {
    Apiversion?: Apiversion; // Move version to the top
    query: Query;
    result: Result;
    error: Error;
    message: Message;

    constructor(query: Query, result: Result, message: Message, error: Error, Apiversion?: Apiversion) {
        this.Apiversion = Apiversion;
        this.query = query;
        this.result = result;
        this.error = error;
        this.message = message;
    }
}

export default HttpResponse;
