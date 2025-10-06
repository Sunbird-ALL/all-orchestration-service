import { Request, Response } from "express";
import { uploadTypeValidationSchema, studentsValidationSchema } from "../../validates/student.validate";
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import studentService from "./student.service";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

// Configure multer for file upload
const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

    static async handleBulkUpload(request: Request, response: Response) {
        try {
            await new Promise<void>((resolve, reject) => {
                fileUpload.single("csvFile")(request, response, (err: any) => {
                    if (err) return reject(new HttpException(400, err.message));
                    if (!request.file) return reject(new HttpException(400, "No csv file uploaded"));
                    resolve();
                });
            });

            const results = await studentController.parseCsv(request.file!.buffer);
            if (results.length === 0) {
                return response.status(400).send(new HttpException(400, "csv file is empty"));
            }

            for (let i = 0; i < results.length; i++) {
                const { error } = studentsValidationSchema.validate(results[i]);
                if (error) {
                    return response.status(400).send(new HttpResponse(null, null, `Required fields are missing in line no ${i + 1}`, null));
                }
            }

            const createdStudents: any[] = [];
            for (const row of results) {
                await new Promise<void>((resolve, reject) => {
                    studentService.create(row.username, (err: any, result: any) => {
                        if (err) return reject(new HttpException(400, "Something went wrong"));
                        createdStudents.push(result);
                        resolve();
                    });
                });
            }

            return response.status(200).send(new HttpResponse(null, createdStudents, "Registered successfully", null));
        } catch (err) {
            return response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async handleSingleUpload(request: Request, response: Response) {
        const { error } = studentsValidationSchema.validate({ ...request.body });
        if (error) {
            return response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
        }

        const userName = request.body.username;

        studentService.create(userName, (err: any, result: any) => {
            if (err) {
                return response.status(400).send(new HttpException(400, "Something went wrong"));
            }
            return response.status(200).send(new HttpResponse(null, result, "Registered successfully", null));
        });
    }

    static async uploadStudents(request: Request, response: Response) {
        try {
            const uploadType = request.query.type;

            const { error } = uploadTypeValidationSchema.validate({ ...request.query });
            if (error) {
                return response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            }

            if (uploadType === "bulk") {
                return await studentController.handleBulkUpload(request, response);
            }
            if (uploadType === "single") {
                return await studentController.handleSingleUpload(request, response);
            }
        } catch (err) {
            return response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }

    static async login(request: Request, response: Response, next: CallableFunction) {
        try {
            const username = request.body.username;
            const isTeacher = username?.startsWith("GT") || false;

            const { error } = studentsValidationSchema.validate({ ...request.body });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            } else if (isTeacher) {
                studentService.findUser(username, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else if (!result) {
                        studentService.create(username, (err: any, result: any) => {
                            if (err) {
                                response.status(400).send(new HttpException(400, "Something went wrong"));
                            } else {
                                response.status(200).send(new HttpResponse(null, result, "Registered successfully", null));
                            }
                        });
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Login successful", null));
                    }
                });
            } else {
                studentService.findUser(username, (err: any, result: any) => {
                    if (err) {
                        response.status(400).send(new HttpException(400, "Something went wrong"));
                    } else if (!result) {
                        response.status(401).send(new HttpException(401, "Unauthorized access"));
                    } else {
                        response.status(200).send(new HttpResponse(null, result, "Login successful", null));
                    }
                });
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
        }
    }
}
export default studentController;