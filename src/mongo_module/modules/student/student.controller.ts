import { NextFunction, Request, Response } from "express";
import { uploadTypeValidationSchema, studentsValidationSchema } from "../../validates/student.validate";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import studentService from "./student.service";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { toHttpException } from "../../../common/middleware/api-error.middleware";

const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv") cb(null, true);
        else cb(new Error("Only csv files are allowed"));
    },
});

class studentController {
    static parseCsv(buffer: Buffer): Promise<{ username: string }[]> {
        return new Promise((resolve, reject) => {
            const results: { username: string }[] = [];
            Readable.from(buffer)
                .pipe(csv())
                .on("data", (row) => results.push(row))
                .on("end", () => resolve(results))
                .on("error", reject);
        });
    }

    static async handleBulkUpload(request: Request, response: Response, next: NextFunction) {
        try {
            await new Promise<void>((resolve, reject) => {
                fileUpload.single("csvFile")(request, response, (err: any) => {
                    if (err) return reject(new HttpException(400, err.message, { code: 'CSV_UPLOAD_ERROR' }));
                    if (!request.file) return reject(new HttpException(400, "No csv file uploaded", { code: 'CSV_MISSING' }));
                    resolve();
                });
            });

            const results = await studentController.parseCsv(request.file!.buffer);
            if (results.length === 0) {
                return next(new HttpException(400, "csv file is empty", { code: 'CSV_EMPTY' }));
            }

            for (let i = 0; i < results.length; i++) {
                const { error } = studentsValidationSchema.validate(results[i]);
                if (error) {
                    return next(new HttpException(400, `Required fields are missing in line no ${i + 1}`, {
                        errorType: 'ValidationError',
                        code: 'CSV_ROW_VALIDATION',
                        errors: error.details.map((d) => ({
                            field: d.path.join('.') || `row_${i + 1}`,
                            message: d.message,
                            code: d.type,
                        })),
                    }));
                }
            }

            const createdStudents: any[] = [];
            for (const row of results) {
                await new Promise<void>((resolve, reject) => {
                    studentService.create(row.username, (err: any, result: any) => {
                        if (err) return reject(new HttpException(400, "Something went wrong", { code: 'STUDENT_CREATE_FAILED' }));
                        createdStudents.push(result);
                        resolve();
                    });
                });
            }

            return response.status(200).send(new HttpResponse(null, createdStudents, "Registered successfully", null));
        } catch (err) {
            next(err instanceof HttpException ? err : toHttpException(err));
        }
    }

    static async handleSingleUpload(request: Request, response: Response, next: NextFunction) {
        const { error } = studentsValidationSchema.validate({ ...request.body });
        if (error) {
            return next(HttpException.fromJoi(error));
        }

        const userName = request.body.username;

        studentService.create(userName, (err: any, result: any) => {
            if (err) {
                return next(new HttpException(400, "Something went wrong", { code: 'STUDENT_CREATE_FAILED' }));
            }
            return response.status(200).send(new HttpResponse(null, result, "Registered successfully", null));
        });
    }

    static async uploadStudents(request: Request, response: Response, next: NextFunction) {
        try {
            const uploadType = request.query.type;

            const { error } = uploadTypeValidationSchema.validate({ ...request.query });
            if (error) {
                return next(HttpException.fromJoi(error));
            }

            if (uploadType === "bulk") {
                return await studentController.handleBulkUpload(request, response, next);
            }
            if (uploadType === "single") {
                return await studentController.handleSingleUpload(request, response, next);
            }
            return next(new HttpException(400, "Invalid upload type", { code: 'INVALID_UPLOAD_TYPE' }));
        } catch (err) {
            next(toHttpException(err));
        }
    }

    static async login(request: Request, response: Response, next: NextFunction) {
        try {
            const username = request.body.username;
            const isTeacher = username?.startsWith("GT") || false;

            const { error } = studentsValidationSchema.validate({ ...request.body });
            if (error) {
                return next(HttpException.fromJoi(error));
            }
            if (isTeacher) {
                studentService.findUser(username, (err: any, result: any) => {
                    if (err) {
                        return next(new HttpException(400, "Something went wrong", { code: 'STUDENT_LOOKUP_FAILED' }));
                    }
                    if (!result) {
                        studentService.create(username, (err2: any, result2: any) => {
                            if (err2) {
                                return next(new HttpException(400, "Something went wrong", { code: 'STUDENT_CREATE_FAILED' }));
                            }
                            response.status(200).send(new HttpResponse(null, result2, "Registered successfully", null));
                        });
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Login successful", null));
                    }
                });
            } else {
                studentService.findUser(username, (err: any, result: any) => {
                    if (err) {
                        return next(new HttpException(400, "Something went wrong", { code: 'STUDENT_LOOKUP_FAILED' }));
                    }
                    if (!result) {
                        return next(new HttpException(401, "Unauthorized access", { code: 'LOGIN_UNAUTHORIZED' }));
                    }
                    response.status(200).send(new HttpResponse(null, result, "Login successful", null));
                });
            }
        }
        catch (err) {
            next(toHttpException(err));
        }
    }
}
export default studentController;
