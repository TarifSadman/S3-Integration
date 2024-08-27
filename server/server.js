import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import pkg from 'pg';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "students",
    port: 5432,
});

app.post("/upload", upload.single('image'), async (req, res) => {
    const { name, email } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ Status: "Error", Message: "No file uploaded" });
    }

    console.log("File to upload:", file);

    const uploadParams = {
        Bucket: process.env.BUCKET,
        Key: `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        // console.log("S3 upload success:", data);

        const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.REGION}.amazonaws.com/${uploadParams.Key}`;

        const sql = "INSERT INTO users (name, email, image) VALUES ($1, $2, $3)";
        pool.query(sql, [name, email, imageUrl], (err, result) => {
            if (err) {
                // console.error("Error inserting data:", err);
                return res.json({ Status: "Error", Message: "Error inserting data" });
            }
            return res.json({ Status: "Success", ImageUrl: imageUrl });
        });
    } catch (err) {
        console.error("Error uploading to S3:", err);
        return res.status(500).json({ 
            Status: "Error", 
            Message: "Error uploading to S3", 
            Error: err.message
        });
    }

    console.log(req.file);
});


app.get('/', (req, res) => {
    const sql = "SELECT * FROM users";
    pool.query(sql, (err, result) => {
        if (err) return res.json("Error");
        return res.json(result.rows);
    });
});

app.listen(8081, () => {
    console.log("Server is running on port 8081");
});
