class HttpResponse<Query, Result, Error, Message> {
    query: Query;
    result: Result;
    error: Error;
    message: Message;

    constructor(query: Query, result: Result, message: Message, error: Error) {
        this.query = query;
        this.result = result;
        this.error = error;
        this.message = message;
    }
}
export default HttpResponse;