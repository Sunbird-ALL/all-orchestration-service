import express from "express";
import cors from "cors"
import * as dotenv from 'dotenv';
dotenv.config();
import sqlRouter, { sqlDatabaseConnection } from "./src/sql_module";

import mongoDbRouter, { mongodbConnection } from "./src/mongo_module/modules";
export const app = express();

const PORT: number = parseInt(process.env.PORT || '3009');
const dataBaseType: string = process.env.DATABASE_TYPE || ""

// parsing the request data
app.use(express.json());
app.use(cors());

if (dataBaseType.toLowerCase() === "mysql") {
  sqlDatabaseConnection()
  app.use("/api", sqlRouter);
} else {
  mongodbConnection();
  app.use("/api", mongoDbRouter);
}

// App testing
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: true,
    message: "App is working",
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});