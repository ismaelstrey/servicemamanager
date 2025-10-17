"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Geração e verificação de tokens JWT
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
function signToken(payload, expiresInSeconds = 3600) {
    // Assina token com expiração em segundos
    const options = { expiresIn: expiresInSeconds };
    return jsonwebtoken_1.default.sign(payload, jwtSecret, options);
}
function verifyToken(token) {
    // Verifica token e retorna payload tipado
    return jsonwebtoken_1.default.verify(token, jwtSecret);
}
