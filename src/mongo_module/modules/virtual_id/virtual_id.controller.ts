import { Request, Response } from "express";
import { genarateVirtualIdValidationSchema } from '../../validates/virtual_id.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import virtualIdService from "./virtual_id.service";
import { logoutValidationSchema } from "../../validates/logoutValidation";
import * as XLSX from 'xlsx';
import multer from 'multer';

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
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

    static async genarateVirtualId(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.query.username;

            const { error } = genarateVirtualIdValidationSchema.validate({ ...request.query });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            } else {
                virtualIdService.generateId(username, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Token generated", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    // New API to process Excel file with tokens
    static async processExcelTokens(request: Request, response: Response, next: CallableFunction) {
        try {
            // Use multer middleware to handle file upload
            upload.single('excelFile')(request, response, async (err) => {
                if (err) {
                    return response.status(400).send(new HttpException(400, err.message));
                }

                if (!request.file) {
                    return response.status(400).send(new HttpException(400, "No Excel file uploaded"));
                }

                try {
                    // Read the Excel file
                    const workbook = XLSX.read(request.file.buffer, { type: 'buffer' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    if (jsonData.length === 0) {
                        return response.status(400).send(new HttpException(400, "Excel file is empty"));
                    }

                    // Check if virtualId column exists
                    const firstRow = jsonData[0] as any;
                    if (!firstRow.virtualId) {
                        return response.status(400).send(new HttpException(400, "Column 'virtualId' not found in Excel file"));
                    }

                    // Process each row
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
                            // Decode the token
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

                    // Create new workbook with processed data
                    const newWorkbook = XLSX.utils.book_new();
                    const newWorksheet = XLSX.utils.json_to_sheet(processedData);
                    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Processed Data");

                    // Convert to buffer
                    const excelBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

                    // Set response headers for file download
                    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    response.setHeader('Content-Disposition', 'attachment; filename="processed_tokens.xlsx"');
                    response.setHeader('Content-Length', excelBuffer.length);

                    // Send the processed Excel file
                    response.status(200).send(excelBuffer);

                } catch (processError: any) {
                    console.error('Excel processing error:', processError);
                    response.status(500).send(new HttpException(500, "Error processing Excel file"));
                }
            });
        } catch (err) {
            response.status(500).send(new HttpException(500, "Something went wrong"));
        }
    }



    static async logout(request: Request, response: Response, next: CallableFunction) {
        try {
            const { error } = logoutValidationSchema.validate(request.body);
            if (error) {
                return response.status(400).send(new HttpResponse(null, null, 'Token is required', null));
            }

            const token = request.body.token;
            const result = await virtualIdService.logout(token);

            if (result?.success) {
                return response.status(200).send(new HttpResponse(null, null, 'Logged out successfully', null));
            } else {
                return response.status(400).send(new HttpException(400, ""));
            }
        } catch (err) {
            return response.status(400).send(new HttpException(400, 'Something went wrong'));
        }
    }

    // Internally calling
    static async tokenStatus(request: Request, response: Response, next: CallableFunction) {
        try { 
            const user_id = request.body.user_id;
            const result = await virtualIdService.tokenStatus(user_id);
            if (result) {
                return response.status(200).send(new HttpResponse(null, result, "user status return", null));
            } else {
                return response.status(400).send(new HttpException(400, ""));
            }
        } catch (err) {
            return response.status(400).send(new HttpException(400, 'Something went wrong'));
        }
    }

    static async deleteByUserName(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.query.username || request.body.username;
            
            if (!username) {
                return response.status(400).send(new HttpResponse(null, null, "Username is required", null));
            }

            const result = await virtualIdService.deleteByUserName(username);
            
            if (result.success) {
                return response.status(200).send(new HttpResponse(null, result, "User deleted successfully", null));
            } else {
                return response.status(404).send(new HttpException(404, result.message || "User not found"));
            }
        } catch (err: any) {
            return response.status(400).send(new HttpException(400, err?.message || 'Something went wrong'));
        }
    }
}
export default virtualIdController;