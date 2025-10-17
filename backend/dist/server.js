"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Configura variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 4000;
// Middlewares globais
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
// Rota de saúde
app.get('/health', (_req, res) => {
    // Retorna status do servidor
    res.json({ status: 'ok' });
});
// TODO: Registrar rotas em src/routes
app.listen(port, () => {
    // Log do servidor iniciado
    console.log(`Servidor iniciado na porta ${port}`);
});
