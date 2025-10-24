"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generatePassword = generatePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
// Funções utilitárias para hash e comparação de senha
async function hashPassword(plain) {
    // Gera hash com sal
    const saltRounds = 10;
    return bcrypt_1.default.hash(plain, saltRounds);
}
async function comparePassword(plain, hash) {
    // Compara senha com hash
    return bcrypt_1.default.compare(plain, hash);
}
function generatePassword(options = {}) {
    const { length = 16, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true, excludeSimilar = true, excludeAmbiguous = false, customCharacters, pattern } = options;
    const similarUpper = 'IO';
    const similarLower = 'lo';
    const similarNumbers = '01';
    let U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let L = 'abcdefghijklmnopqrstuvwxyz';
    let N = '0123456789';
    let S = '!@#$%^&*()-_=+{}[];:,<.>/?';
    if (excludeSimilar) {
        U = U.split('').filter(c => !similarUpper.includes(c)).join('');
        L = L.split('').filter(c => !similarLower.includes(c)).join('');
        N = N.split('').filter(c => !similarNumbers.includes(c)).join('');
    }
    if (excludeAmbiguous) {
        // Um subconjunto de símbolos menos ambíguos
        S = '!@#$%^&*+-_=?';
    }
    const pools = [];
    const poolByType = {
        U, L, N, S
    };
    if (includeUppercase)
        pools.push(U);
    if (includeLowercase)
        pools.push(L);
    if (includeNumbers)
        pools.push(N);
    if (includeSymbols)
        pools.push(S);
    if (customCharacters && customCharacters.length > 0)
        pools.push(customCharacters);
    const unifiedPool = pools.join('');
    if (!unifiedPool) {
        throw new Error('Nenhum conjunto de caracteres selecionado para geração de senha');
    }
    const pick = (chars) => {
        const idx = crypto_1.default.randomInt(0, chars.length);
        return chars[idx];
    };
    if (pattern && pattern.length > 0) {
        const out = [];
        for (const ch of pattern) {
            switch (ch) {
                case 'L':
                    out.push(pick(U));
                    break;
                case 'l':
                    out.push(pick(L));
                    break;
                case 'n':
                    out.push(pick(N));
                    break;
                case 's':
                    out.push(pick(S));
                    break;
                case 'a':
                    out.push(pick(unifiedPool));
                    break;
                default:
                    out.push(pick(unifiedPool));
                    break;
            }
        }
        return out.join('');
    }
    // Garantir ao menos um de cada tipo selecionado
    const required = [];
    if (includeUppercase)
        required.push(pick(U));
    if (includeLowercase)
        required.push(pick(L));
    if (includeNumbers)
        required.push(pick(N));
    if (includeSymbols)
        required.push(pick(S));
    const remainingCount = Math.max(length - required.length, 0);
    const rest = [];
    for (let i = 0; i < remainingCount; i++) {
        rest.push(pick(unifiedPool));
    }
    // Embaralhar usando Fisher-Yates
    const all = [...required, ...rest];
    for (let i = all.length - 1; i > 0; i--) {
        const j = crypto_1.default.randomInt(0, i + 1);
        [all[i], all[j]] = [all[j], all[i]];
    }
    return all.join('');
}
