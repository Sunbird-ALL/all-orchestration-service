import { Request, Response } from "express";
import { uploadTypeValidationSchema, studentsValidationSchema } from '../../validates/student.validate';
import HttpException from "../../../common/http.Exception/http.Exception";
import HttpResponse from "../../../common/http.Response/http.Response";
import studentService from "./student.service";
import multer from 'multer';
import csv from "csv-parser";
import { Readable } from "stream";

// Configure multer for file upload
const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv") {
            cb(null, true);
        } else {
            cb(new Error('Only csv files are allowed'));
        }
    }
});

class studentController {

    static async uploadStudents(request: Request, response: Response, next: CallableFunction) {
        try {
            const uploadType = request.query.type;

            const { error } = uploadTypeValidationSchema.validate({ ...request.query });
            if (error) {
                response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
            }

            if (uploadType == "bulk") {
                fileUpload.single('csvFile')(request, response, async (err) => {
                    if (err) {
                        return response.status(400).send(new HttpException(400, err.message));
                    }

                    if (!request.file) {
                        return response.status(400).send(new HttpException(400, "No csv file uploaded"));
                    }

                    const results: { username: string }[] = [];
                    const bufferStream = new Readable();
                    bufferStream.push(request.file.buffer);
                    bufferStream.push(null);

                    bufferStream
                        .pipe(csv())
                        .on("data", (row) => results.push(row))
                        .on("end", async () => {
                            if (results.length == 0) {
                                response.status(400).send(new HttpResponse(null, null, "csv file is empty", null));
                            } else {
                                results.map((data, index) => {
                                    const { error } = studentsValidationSchema.validate(data);
                                    if (error) {
                                        response.status(400).send(new HttpResponse(null, null, `Required fields are missing in line no ${index + 1}`, null));
                                    }
                                })

                                results.map((data) => {
                                    const userName = data.username;
                                    studentService.create(userName, (err: any) => {
                                        if (err) {
                                            response.status(400).send(new HttpException(400, "Something went wrong"));
                                        }
                                    });
                                })

                                response.status(200).send(new HttpResponse(null, results, "Registered successfully", null));
                            }
                        });
                })
            } else if (uploadType == "single") {
                const userName = request.body.username;

                const { error } = studentsValidationSchema.validate({ ...request.body });
                if (error) {
                    response.status(400).send(new HttpResponse(null, null, "Required fields are missing", null));
                } else {
                    studentService.create(userName, (err: any, result: any) => {
                        if (err) {
                            console.log(err);
                            
                            response.status(400).send(new HttpException(400, "Something went wrong"));
                        }
                        response.status(200).send(new HttpResponse(null, result, "Registered successfully", null));
                    });
                }
            }
        }
        catch (err) {
            response.status(400).send(new HttpException(400, "Something went wrong"));
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
                        response.status(200).send(new HttpResponse(null, result, "Registered successfully", null));
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