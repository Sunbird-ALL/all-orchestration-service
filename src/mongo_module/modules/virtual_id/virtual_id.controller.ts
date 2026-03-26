import { NextFunction, Request, Response } from "express";
import { genarateVirtualIdValidationSchema } from '../../validates/virtual_id.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdService from "./virtual_id.service";
import { logoutValidationSchema } from "../../validates/logoutValidation";
import * as XLSX from 'xlsx';
import multer from 'multer';
import { toHttpException } from "../../../common/middleware/api-error.middleware";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

class virtualIdController {

    static async genarateVirtualId(request: Request, response: Response, next: NextFunction) {
        try {
            const username = request.query.username;

            const { error } = genarateVirtualIdValidationSchema.validate({ ...request.query });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            virtualIdService.generateId(username, (err: any, result: any) => {
                if (err) {
                    return next(new HttpException(400, "Something went wrong", { code: 'VIRTUAL_ID_GENERATE_FAILED' }));
                }
                response.status(200).send(new HttpResponse(null, result, "Token generated", null));
            });
        }
        catch (err) {
            next(toHttpException(err));
        }
    }

    static async processExcelTokens(request: Request, response: Response, next: NextFunction) {
        try {
            upload.single('excelFile')(request, response, async (err) => {
                if (err) {
                    return next(new HttpException(400, err.message, { code: 'EXCEL_UPLOAD_ERROR' }));
                }

                if (!request.file) {
                    return next(new HttpException(400, "No Excel file uploaded", { code: 'EXCEL_MISSING' }));
                }

                try {
                    const workbook = XLSX.read(request.file.buffer, { type: 'buffer' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        return next(new HttpException(400, "Excel file is empty", { code: 'EXCEL_EMPTY' }));
                    }

                    const firstRow = jsonData[0] as any;
                    if (!firstRow.virtualId) {
                        return next(new HttpException(400, "Column 'virtualId' not found in Excel file", { code: 'EXCEL_COLUMN_MISSING' }));
                    }

                    const processedData = [];
                    const errors = [];

                    for (let i = 0; i < jsonData.length; i++) {
                        const row = jsonData[i] as any;
                        const token = row.virtualId;

                        if (!token || typeof token !== 'string') {
                            errors.push({
                                row: i + 1,
                                error: "Invalid or missing token"
                            });
                            continue;
                        }

                        try {
                            const decodedResult = await virtualIdService.decodeToken(token);

                            if (decodedResult.success) {
                                processedData.push({
                                    ...row,
                                    decodedVirtualId: decodedResult.virtual_id
                                });
                            } else {
                                errors.push({
                                    row: i + 1,
                                    error: decodedResult.error || "Failed to decode token"
                                });
                            }
                        } catch (decodeError: any) {
                            errors.push({
                                row: i + 1,
                                error: decodeError.message || "Token decoding failed"
                            });
                        }
                    }

                    const newWorkbook = XLSX.utils.book_new();
                    const newWorksheet = XLSX.utils.json_to_sheet(processedData);
                    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Processed Data");

                    const excelBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

                    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    response.setHeader('Content-Disposition', 'attachment; filename="processed_tokens.xlsx"');
                    response.setHeader('Content-Length', excelBuffer.length);

                    response.status(200).send(excelBuffer);

                } catch (processError: any) {
                    next(new HttpException(500, "Error processing Excel file", {
                        errorType: 'InternalServerError',
                        code: 'EXCEL_PROCESS_FAILED',
                    }));
                }
            });
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async logout(request: Request, response: Response, next: NextFunction) {
        try {
            const { error } = logoutValidationSchema.validate(request.body);
            if (error) {
                return next(HttpException.fromJoi(error));
            }

            const token = request.body.token;
            const result = await virtualIdService.logout(token);

            if (result?.success) {
                return response.status(200).send(new HttpResponse(null, null, 'Logged out successfully', null));
            }
            return next(new HttpException(400, 'Logout failed', { code: 'LOGOUT_FAILED' }));
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async tokenStatus(request: Request, response: Response, next: NextFunction) {
        try {
            const user_id = request.body.user_id;
            const result = await virtualIdService.tokenStatus(user_id);
            if (result) {
                return response.status(200).send(new HttpResponse(null, result, "user status return", null));
            }
            return next(new HttpException(400, 'Unable to load token status', { code: 'TOKEN_STATUS_FAILED' }));
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async deleteByVirtualId(request: Request, response: Response, next: NextFunction) {
        try {
            const virtual_id = request.query.virtual_id || request.body.virtual_id;

            if (!virtual_id) {
                return next(new HttpException(400, "virtual_id is required", {
                    errorType: 'ValidationError',
                    code: 'MISSING_VIRTUAL_ID',
                }));
            }

            const result = await virtualIdService.deleteByVirtualId(virtual_id);

            if (result.success) {
                return response.status(200).send(new HttpResponse(null, result, "User deleted successfully", null));
            }
            return next(new HttpException(404, result.message || "User not found", { code: 'USER_NOT_FOUND' }));
        } catch (err: any) {
            next(toHttpException(err));
        }
    }
}
export default virtualIdController;
