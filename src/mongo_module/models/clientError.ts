import mongoose from "mongoose";

const clientErrorSchema = new mongoose.Schema({
    type: { type: String, required: false },      // js_error | promise_rejection | react_error | telemetry_failure
    message: { type: String, required: false },
    stack: { type: String, required: false },
    source: { type: String, required: false },     // source file URL
    lineno: { type: Number, required: false },
    colno: { type: Number, required: false },
    componentStack: { type: String, required: false },
    url: { type: String, required: false },        // page URL where error occurred
    ts: { type: Number, required: false },         // client-side timestamp (ms)
    receivedAt: { type: Date, default: Date.now },
}, { strict: false });                             // allow extra fields from future clients

clientErrorSchema.index({ receivedAt: -1 });
clientErrorSchema.index({ type: 1, receivedAt: -1 });

const ClientError = mongoose.model("client_errors", clientErrorSchema);
export default ClientError;
