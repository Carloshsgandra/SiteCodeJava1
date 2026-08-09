import { curriculum } from './data.js';

const agentPrompts = {
  mentor: 'Você é um mentor de Java. Explique com clareza, exemplos pequenos e uma pergunta de confirmação.',
  debugger: 'Você é um debugger Java. Identifique causa, linha provável, correção e um teste para confirmar.',
  challenge: 'Você cria desafios Java adaptativos. Não entregue a resposta imediatamente; forneça critérios e testes.',
  reviewer: 'Você revisa código Java com foco em legibilidade, métodos pequenos, encapsulamento e riscos.',
  interview: 'Você é um entrevistador Java. Faça perguntas, avalie a resposta e indique lacunas objetivamente.',
};

const javaTopics = [
  { pattern: /string|texto|equals|concat/i, title: 'Strings', advice: 'Em Java, String é imutável. Compare conteúdo com equals(), use StringBuilder em muitas concatenações e trate null antes de chamar métodos.' },
  { pattern: /arraylist|lista|collection/i, title: 'Coleções', advice: 'Declare pela interface quando possível: List<T>. ArrayList favorece acesso por índice; LinkedList só é útil em cenários específicos de inserção e remoção.' },
  { pattern: /null|optional|nullexception/i, title: 'Null safety', advice: 'Descubra primeiro de onde o null pode nascer. Valide nas fronteiras e use Optional principalmente como retorno, não como campo ou parâmetro.' },
  { pattern: /classe|objeto|oop|encapsula/i, title: 'Orientação a Objetos', advice: 'Agrupe estado e comportamento que mudam juntos. Mantenha campos privados e exponha operações que preservem as regras do objeto.' },
  { pattern: /heran|polimorf|interface|extends|implements/i, title: 'Polimorfismo', advice: 'Prefira depender de abstrações. Herança modela uma relação “é um”; composição costuma ser melhor para reutilizar comportamento.' },
  { pattern: /stream|lambda|map\(|filter\(/i, title: 'Streams', advice: 'Streams descrevem uma transformação: fonte → operações intermediárias → terminal. Evite efeitos colaterais dentro de map e filter.' },
  { pattern: /exception|exce|try|catch/i, title: 'Exceções', advice: 'Capture apenas exceções que você consegue tratar. Preserve a causa original e evite catch(Exception) silencioso.' },
  { pattern: /loop|for|while|repet/i, title: 'Laços', advice: 'Use for-each quando não precisa do índice. Prefira while quando o número de repetições depende de uma condição externa.' },
  { pattern: /m[eé]todo|fun[cç][aã]o|return/i, title: 'Métodos', advice: 'Um método deve ter uma responsabilidade clara, nome com verbo e poucos parâmetros. O retorno deve representar uma única ideia.' },
];

function relevantQuestion(prompt) {
  const terms = prompt.toLocaleLowerCase('pt-BR').split(/\W+/).filter((term) => term.length > 4);
  return curriculum.interviewQuestions
    .map((question) => ({ question, score: terms.filter((term) => `${question.question} ${question.answer}`.toLocaleLowerCase('pt-BR').includes(term)).length }))
    .sort((a, b) => b.score - a.score)[0];
}

function localCoach(agent, prompt) {
  const topic = javaTopics.find((item) => item.pattern.test(prompt));
  const match = relevantQuestion(prompt);
  const codePresent = /class\s+\w+|public\s+static|System\.out|;|\{/.test(prompt);

  if (agent === 'debugger' && codePresent) {
    const findings = [];
    if (!/public\s+static\s+void\s+main/.test(prompt)) findings.push('Verifique se existe um ponto de entrada `public static void main(String[] args)`.');
    if ((prompt.match(/\{/g) || []).length !== (prompt.match(/\}/g) || []).length) findings.push('A quantidade de chaves de abertura e fechamento não coincide.');
    if (/==\s*"|"\s*==/.test(prompt)) findings.push('A comparação de String com `==` compara referências; provavelmente você quer `equals()`.');
    if (/\/\s*0\b/.test(prompt)) findings.push('Há uma divisão por zero detectável no código.');
    if (!findings.length) findings.push('Não encontrei um erro sintático óbvio na inspeção local. Execute um caso mínimo e envie a mensagem completa do compilador para localizar a falha.');
    return `Diagnóstico inicial:\n\n${findings.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\nTeste recomendado: reduza a entrada ao menor caso que ainda reproduz o problema e observe a primeira linha da stack trace.`;
  }

  if (agent === 'challenge') {
    const title = topic?.title ?? 'Fundamentos Java';
    return `Desafio adaptativo — ${title}\n\nCrie um pequeno programa que receba uma coleção de valores, aplique uma regra de validação e devolva um resumo sem alterar a coleção original.\n\nCritérios:\n1. Separe entrada, regra e apresentação em métodos.\n2. Trate entrada vazia.\n3. Escreva pelo menos três casos de teste: comum, limite e inválido.\n\nBônus: explique a complexidade de tempo da solução.`;
  }

  if (agent === 'reviewer' && codePresent) {
    return `Revisão rápida:\n\n• Nomes: confirme se classes são substantivos e métodos começam com verbos.\n• Responsabilidade: quebre métodos que misturam leitura, regra e impressão.\n• Estado: mantenha campos privados e valide mudanças por métodos.\n• Erros: não ignore exceções e evite retornar valores mágicos.\n• Testes: valide caminho feliz, limite e entrada inválida.\n\nPróximo passo: escolha o método mais longo e descreva em uma frase qual deveria ser sua única responsabilidade.`;
  }

  if (agent === 'interview') {
    const question = match?.score ? match.question : curriculum.interviewQuestions[Math.floor(Math.random() * curriculum.interviewQuestions.length)];
    return `Simulação de entrevista (${question.category} · ${question.difficulty})\n\n${question.question}\n\nDica disponível se precisar: ${question.hint}\n\nResponda como se estivesse em uma entrevista: definição, exemplo e principal cuidado.`;
  }

  const answer = topic?.advice ?? (match?.score ? match.question.answer : 'Comece separando o problema em entrada, transformação e saída. Depois identifique qual conceito Java governa cada etapa e valide com um exemplo mínimo.');
  return `${topic ? `${topic.title}\n\n` : ''}${answer}\n\nPara fixar: explique com suas palavras qual regra você aplicaria primeiro e dê um pequeno caso de teste.`;
}

export async function askCoach(agent, prompt) {
  const settings = JSON.parse(localStorage.getItem('javaflow-state-v3') || '{}').settings ?? {};
  const apiKey = sessionStorage.getItem('javaflow-ai-key');
  if (!settings.aiUrl || !apiKey) return { text: localCoach(agent, prompt), local: true };

  const endpoint = settings.aiUrl.replace(/\/$/, '').endsWith('/chat/completions')
    ? settings.aiUrl.replace(/\/$/, '')
    : `${settings.aiUrl.replace(/\/$/, '')}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: settings.aiModel || 'llama-3.3-70b-versatile',
        temperature: 0.5,
        messages: [
          { role: 'system', content: agentPrompts[agent] ?? agentPrompts.mentor },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!response.ok) throw new Error(`A integração respondeu com status ${response.status}`);
    const data = await response.json();
    return { text: data.choices?.[0]?.message?.content || localCoach(agent, prompt), local: false };
  } catch (error) {
    return { text: `${localCoach(agent, prompt)}\n\n(Usei o mentor local porque a integração externa não respondeu: ${error.message}.)`, local: true };
  }
}

function balancedBraces(code) {
  return (code.match(/\{/g) || []).length === (code.match(/\}/g) || []).length;
}

function evaluateSimpleExpression(expression, variables) {
  let candidate = expression.trim();
  for (const [name, value] of Object.entries(variables)) {
    candidate = candidate.replace(new RegExp(`\\b${name}\\b`, 'g'), JSON.stringify(value));
  }
  candidate = candidate.replace(/\.length\(\)/g, '.length');
  if (!/^[\d\s+\-*/%().,!<>=&|?\[\]"'A-Za-zÀ-ÿ:_]+$/.test(candidate)) return expression.trim();
  if (/\b(?:fetch|window|document|globalThis|Function|constructor|eval|import|require)\b/.test(candidate)) return expression.trim();
  try {
    return Function(`"use strict"; return (${candidate});`)();
  } catch {
    return expression.trim().replace(/^"|"$/g, '');
  }
}

function offlineJavaPreview(code, stdin = '') {
  if (!balancedBraces(code)) return { output: 'Erro de compilação: verifique as chaves { }.', preview: true, error: true };
  const variables = {};
  const inputValues = stdin.split(/\r?\n/);
  let inputIndex = 0;

  for (const match of code.matchAll(/(?:int|long|double|float|String|boolean|char|var)\s+(\w+)\s*=\s*([^;]+);/g)) {
    const [, name, raw] = match;
    if (/next(?:Int|Double|Line)\s*\(/.test(raw)) {
      const input = inputValues[inputIndex++] ?? '';
      variables[name] = /next(?:Int|Double)/.test(raw) ? Number(input) : input;
    } else {
      variables[name] = evaluateSimpleExpression(raw.replace(/[fLdD]$/, ''), variables);
    }
  }

  const prints = [...code.matchAll(/System\.out\.(println|print)\s*\((.*?)\)\s*;/gs)];
  if (!prints.length) {
    return { output: 'Prévia local concluída sem saída. Adicione System.out.println() para visualizar um resultado.', preview: true };
  }
  const output = prints.map((match) => {
    const value = evaluateSimpleExpression(match[2], variables);
    return `${value}${match[1] === 'println' ? '\n' : ''}`;
  }).join('');
  return { output, preview: true };
}

async function runJudge0(baseUrl, code, stdin) {
  const url = baseUrl.replace(/\/$/, '');
  const token = sessionStorage.getItem('javaflow-runner-key');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Auth-Token'] = token;

  const languagesResponse = await fetch(`${url}/languages`, { headers });
  if (!languagesResponse.ok) throw new Error('Não foi possível consultar as linguagens do executor.');
  const languages = await languagesResponse.json();
  const java = languages.find((item) => /^Java \(/i.test(item.name)) ?? languages.find((item) => /Java/i.test(item.name));
  if (!java) throw new Error('O executor configurado não oferece Java.');

  const submissionResponse = await fetch(`${url}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ source_code: code, language_id: java.id, stdin }),
  });
  if (!submissionResponse.ok) throw new Error(`Falha ao enviar o código (${submissionResponse.status}).`);
  const submission = await submissionResponse.json();

  for (let attempt = 0; attempt < 14; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt < 3 ? 450 : 850));
    const resultResponse = await fetch(`${url}/submissions/${submission.token}?base64_encoded=false`, { headers });
    if (!resultResponse.ok) throw new Error('Não foi possível obter o resultado.');
    const result = await resultResponse.json();
    if (![1, 2].includes(result.status?.id)) {
      return {
        output: result.stdout || result.compile_output || result.stderr || result.message || result.status?.description || 'Execução encerrada.',
        preview: false,
        error: result.status?.id !== 3,
      };
    }
  }
  throw new Error('O executor demorou além do esperado.');
}

export async function runJava(code, stdin = '') {
  const settings = JSON.parse(localStorage.getItem('javaflow-state-v3') || '{}').settings ?? {};
  if (!settings.runnerUrl) return offlineJavaPreview(code, stdin);
  try {
    return await runJudge0(settings.runnerUrl, code, stdin);
  } catch (error) {
    const preview = offlineJavaPreview(code, stdin);
    return { ...preview, output: `${preview.output}\n\nExecutor remoto indisponível: ${error.message}\nFoi exibida uma prévia local segura.` };
  }
}
