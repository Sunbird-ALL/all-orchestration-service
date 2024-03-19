import { DataSource } from "typeorm"
import * as dotenv from 'dotenv';
dotenv.config();

const SQL_DB_TYPE: any = process.env.SQL_DB_TYPE || 'mysql';
const SQL_PORT: any = process.env.SQL_PORT || 3306;

export const myDataSource = new DataSource({
    type: SQL_DB_TYPE,
    host: process.env.SQL_HOST,
    port: SQL_PORT,
    username: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE_NAME,
    entities: ["src/sql_module/schema/*.ts"],
    logging: false,
    synchronize: true,
});