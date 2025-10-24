import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Funções utilitárias para hash e comparação de senha
export async function hashPassword(plain: string): Promise<string> {
  // Gera hash com sal
  const saltRounds: number = 10;
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  // Compara senha com hash
  return bcrypt.compare(plain, hash);
}

export interface GeneratePasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean; // Excluir caracteres facilmente confundíveis (O/0, I/1, l)
  excludeAmbiguous?: boolean; // Excluir símbolos ambíguos ({ } [ ] ( ) / \ ' " ` ~ , ; : . < >)
  customCharacters?: string; // Caracteres adicionais a incluir
  pattern?: string; // Padrão, ex: 'LLnnSS' (L maiúscula, l minúscula, n número, s símbolo, a qualquer)
}

export function generatePassword(options: GeneratePasswordOptions = {}): string {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true,
    excludeAmbiguous = false,
    customCharacters,
    pattern
  } = options;

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

  const pools: string[] = [];
  const poolByType: Record<'U'|'L'|'N'|'S', string> = {
    U, L, N, S
  };
  if (includeUppercase) pools.push(U);
  if (includeLowercase) pools.push(L);
  if (includeNumbers) pools.push(N);
  if (includeSymbols) pools.push(S);
  if (customCharacters && customCharacters.length > 0) pools.push(customCharacters);

  const unifiedPool = pools.join('');
  if (!unifiedPool) {
    throw new Error('Nenhum conjunto de caracteres selecionado para geração de senha');
  }

  const pick = (chars: string): string => {
    const idx = crypto.randomInt(0, chars.length);
    return chars[idx];
  };

  if (pattern && pattern.length > 0) {
    const out: string[] = [];
    for (const ch of pattern) {
      switch (ch) {
        case 'L': out.push(pick(U)); break;
        case 'l': out.push(pick(L)); break;
        case 'n': out.push(pick(N)); break;
        case 's': out.push(pick(S)); break;
        case 'a': out.push(pick(unifiedPool)); break;
        default: out.push(pick(unifiedPool)); break;
      }
    }
    return out.join('');
  }

  // Garantir ao menos um de cada tipo selecionado
  const required: string[] = [];
  if (includeUppercase) required.push(pick(U));
  if (includeLowercase) required.push(pick(L));
  if (includeNumbers) required.push(pick(N));
  if (includeSymbols) required.push(pick(S));

  const remainingCount = Math.max(length - required.length, 0);
  const rest: string[] = [];
  for (let i = 0; i < remainingCount; i++) {
    rest.push(pick(unifiedPool));
  }

  // Embaralhar usando Fisher-Yates
  const all = [...required, ...rest];
  for (let i = all.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all.join('');
}