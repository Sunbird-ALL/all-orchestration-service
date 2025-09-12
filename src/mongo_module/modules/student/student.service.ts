import student from "../../models/student";

class studentService {

    static async create(userName: any, next: CallableFunction) {
        try {
            const existingUser = await student.findOne({ userName: userName });
            if (existingUser) { return existingUser };

            return await student.create({ userName: userName });
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }

    static async findUser(userName: any, next: CallableFunction) {
        try {
            const result = await student.findOne({ userName: userName });
            return next(null, result);
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }
}
export default studentService;
