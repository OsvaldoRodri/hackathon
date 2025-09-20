/*****
 Contributors

 * Interledger Foundation
 - Pedro Sousa Barreto <pedrosousabarreto@gmail.com>

 --------------
 ******/

"use strict";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const LISTEN_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "http://localhost:5173";

const app = express();

// Enable CORS for specific origins (más seguro que CORS para todos)
app.use(cors({ 
    origin: ALLOWED_ORIGINS.split(','),
    credentials: true
}));

// Enable unpacking of json body in POST requests
// NOTE: requests must have a "content-type" header with value "application/json"
app.use(express.json());

// HANDLE THE REQUESTS

// Example of get request without parameters
// call like: GET http://localhost:3000/
app.get("/", (req: express.Request, res: express.Response) => {
    res.json({
        message: "Backend is running successfully!",
        timestamp: new Date().toISOString(),
        port: LISTEN_PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Example of get request with parameters
// call like: GET http://localhost:3000/example_params?name=pedro
app.get("/example_params", (req: express.Request, res: express.Response) => {
    // extract and validate query parameter
    const inputParam = req.query["name"] as string || undefined;
    
    if (!inputParam) {
        return res.status(400).json({
            error: "Please pass a name parameter",
            example: "/example_params?name=yourname"
        });
    }
    
    res.json({
        message: `Hello ${inputParam}!`,
        timestamp: new Date().toISOString()
    });
});

// Example of POST request
// call like: POST http://localhost:3000/example_post
// a body object must be included and a "content-type" header with value "application/json" included
app.post("/example_post", (req: express.Request, res: express.Response) => {
    //extract body object
    const inputBodyObj = req.body;
    
    if (!inputBodyObj || Object.keys(inputBodyObj).length === 0) {
        return res.status(400).json({
            error: "Please include a non-empty object in the post request",
            example: { "key": "value" }
        });
    }
    
    res.json({
        message: "Data received successfully",
        receivedData: inputBodyObj,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get("/health", (req: express.Request, res: express.Response) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Not found handler, this will catch requests that are not caught
// by other routes - should be at the end
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        error: "Not Found",
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Start the server listening on TCP port defined by LISTEN_PORT
app.listen(LISTEN_PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${LISTEN_PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${ALLOWED_ORIGINS}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
