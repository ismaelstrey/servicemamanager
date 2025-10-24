"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = require("jsonwebtoken");
// Geração e verificação de tokens JWT
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
function signToken(payload, expiresInSeconds = 3600) {
    // Assina token com expiração em segundos
    const options = { expiresIn: expiresInSeconds };
    return (0, jsonwebtoken_1.sign)(payload, jwtSecret, options);
}
function verifyToken(token) {
    // Verifica token e retorna payload tipado
    return (0, jsonwebtoken_1.verify)(token, jwtSecret);
}
