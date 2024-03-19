class HttpResponse {
    query: any;
    result: any;
    error: any;
   // totalResults: any;
   // pageNo: any;
    message: any;

    constructor(query: any, result: any, message: any, error: any, totalResult: any, pageNo: any) {
        this.query = query;
        this.result = result;
        this.error = error;
       // this.totalResults = totalResult;
       // this.pageNo = pageNo;
        this.message = message;
    }
}
export default HttpResponse;