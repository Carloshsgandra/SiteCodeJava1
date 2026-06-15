-- ============================================================
-- GUIDED PROJECTS
-- ============================================================

INSERT INTO guided_projects (id, title, description, difficulty, icon, tech_topics, estimated_hours, xp_reward, order_index, learning_goals) VALUES
(1, 'Calculadora Java',
 'Crie uma calculadora de linha de comando que realiza as 4 operações básicas. Seu primeiro projeto real em Java!',
 'INICIANTE', '🔢', 'Java, Scanner, Métodos, switch', 1, 120, 1,
 'Usar Scanner para ler entrada do usuário, criar métodos para cada operação, usar switch/case, tratar divisão por zero'),

(2, 'Jogo de Adivinhar o Número',
 'O computador sorteia um número e você tenta adivinhar! Com dicas de quente/frio e contagem de tentativas.',
 'INICIANTE', '🎲', 'Java, Random, Scanner, Loops, Condicionais', 2, 150, 2,
 'Usar Random para gerar números, criar loops de repetição, dar feedback ao usuário, contar tentativas'),

(3, 'Agenda de Contatos',
 'Um sistema CRUD completo de contatos via terminal. Adicione, liste, busque e remova contatos.',
 'INTERMEDIARIO', '📒', 'Java, ArrayList, Classes, OOP, Scanner', 3, 200, 3,
 'Criar classes Java, usar ArrayList, implementar CRUD completo, separar responsabilidades entre classes'),

(4, 'Jogo de Quiz',
 'Quiz interativo com perguntas de Java, pontuação e nível de dificuldade. Teste seu conhecimento!',
 'INTERMEDIARIO', '🧠', 'Java, Arrays, OOP, Enums, Scanner', 3, 200, 4,
 'Trabalhar com arrays de objetos, usar enums, calcular pontuação, criar menu interativo'),

(5, 'Mini Sistema Bancário',
 'Sistema bancário com contas, depósito, saque e extrato. Aplique OOP de verdade neste projeto completo.',
 'INTERMEDIARIO', '🏦', 'Java, OOP, ArrayList, Encapsulamento, Herança', 4, 250, 5,
 'Aplicar herança e polimorfismo, encapsular dados com getters/setters, lançar exceções customizadas, criar menus complexos');

-- ============================================================
-- PROJECT STEPS — CALCULADORA
-- ============================================================
INSERT INTO project_steps (id, project_id, step_number, title, description, code_template, hint, expected_output) VALUES
(1, 1, 1, 'Criar a classe Main',
 'Crie uma classe chamada Calculadora com o método main. Imprima uma mensagem de boas-vindas para o usuário.',
 'public class Calculadora {\n    public static void main(String[] args) {\n        // TODO: imprimir boas-vindas\n    }\n}',
 'Use System.out.println() para imprimir texto no terminal.',
 '=== CALCULADORA JAVA ==='),

(2, 1, 2, 'Ler dois números do usuário',
 'Use a classe Scanner para ler dois números do usuário. Lembre-se de importar java.util.Scanner e fechar o scanner ao final.',
 'import java.util.Scanner;\n\npublic class Calculadora {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Digite o primeiro número: ");\n        double num1 = sc.nextDouble();\n        // TODO: ler o segundo número\n    }\n}',
 'Use sc.nextDouble() para ler números decimais. Não esqueça de fechar o Scanner com sc.close() no final.',
 'Digite o primeiro número: 10\nDigite o segundo número: 5'),

(3, 1, 3, 'Criar métodos para cada operação',
 'Crie 4 métodos estáticos: somar, subtrair, multiplicar e dividir. Cada um recebe dois doubles e retorna um double.',
 'public static double somar(double a, double b) {\n    return a + b;\n}\n\npublic static double subtrair(double a, double b) {\n    return a - b;\n}\n\n// TODO: criar multiplicar e dividir',
 'Métodos estáticos podem ser chamados direto pela classe sem criar um objeto. Ex: Calculadora.somar(10, 5)',
 NULL),

(4, 1, 4, 'Tratar divisão por zero',
 'No método dividir, verifique se o divisor é zero. Se for, mostre uma mensagem de erro em vez de causar uma exceção.',
 'public static double dividir(double a, double b) {\n    if (b == 0) {\n        System.out.println("Erro: divisão por zero!");\n        return 0;\n    }\n    return a / b;\n}',
 'Sempre valide entradas do usuário antes de calcular. Divisão por zero em Java lança ArithmeticException para inteiros.',
 'Erro: divisão por zero!'),

(5, 1, 5, 'Criar menu com switch',
 'Crie um menu que mostra as operações disponíveis, lê a escolha do usuário com switch e chama o método correto.',
 'System.out.println("Escolha a operação:");\nSystem.out.println("1 - Somar");\nSystem.out.println("2 - Subtrair");\nSystem.out.println("3 - Multiplicar");\nSystem.out.println("4 - Dividir");\nint op = sc.nextInt();\n\nswitch (op) {\n    case 1 -> System.out.println("Resultado: " + somar(num1, num2));\n    // TODO: casos 2, 3, 4\n    default -> System.out.println("Opção inválida!");\n}',
 'O switch expression com -> é mais limpo que o switch tradicional (Java 14+). Use o scanner para ler int com sc.nextInt().',
 'Escolha a operação:\n1 - Somar\n2 - Subtrair\n3 - Multiplicar\n4 - Dividir\nResultado: 15.0');

-- ============================================================
-- PROJECT STEPS — JOGO ADIVINHAR
-- ============================================================
INSERT INTO project_steps (id, project_id, step_number, title, description, code_template, hint, expected_output) VALUES
(6, 2, 1, 'Sortear o número secreto',
 'Use a classe Random para sortear um número entre 1 e 100 (inclusive). Armazene em uma variável.',
 'import java.util.Random;\nimport java.util.Scanner;\n\npublic class JogoAdivinhacao {\n    public static void main(String[] args) {\n        Random random = new Random();\n        int numeroSecreto = random.nextInt(100) + 1; // entre 1 e 100\n        // TODO: continuar\n    }\n}',
 'random.nextInt(100) gera de 0 a 99. Adicionando + 1, fica de 1 a 100.',
 NULL),

(7, 2, 2, 'Criar o loop de tentativas',
 'Use um loop while para permitir que o usuário tente adivinhar até acertar. Leia o palpite com Scanner.',
 'Scanner sc = new Scanner(System.in);\nint palpite = 0;\nint tentativas = 0;\n\nSystem.out.println("=== ADIVINHE O NÚMERO (1-100) ===");\n\nwhile (palpite != numeroSecreto) {\n    System.out.print("Seu palpite: ");\n    palpite = sc.nextInt();\n    tentativas++;\n    // TODO: dar dica\n}',
 'O loop while continua enquanto a condição for verdadeira. Incremente tentativas++ a cada palpite.',
 NULL),

(8, 2, 3, 'Adicionar dicas quente/frio',
 'Dentro do loop, diga se o palpite é maior ou menor que o número secreto. Use if/else para as dicas.',
 'if (palpite < numeroSecreto) {\n    System.out.println("📈 Maior! Tente um número maior.");\n} else if (palpite > numeroSecreto) {\n    System.out.println("📉 Menor! Tente um número menor.");\n}',
 'Só mostre a mensagem de erro se palpite != numeroSecreto, caso contrário o loop já terá parado.',
 'Seu palpite: 50\n📈 Maior! Tente um número maior.'),

(9, 2, 4, 'Mostrar resultado final',
 'Quando o usuário acertar, mostre uma mensagem de parabéns com o número de tentativas usadas.',
 '// Após o while:\nSystem.out.println("\\n🎉 PARABÉNS! Você acertou!");\nSystem.out.println("O número era: " + numeroSecreto);\nSystem.out.println("Tentativas: " + tentativas);\nsc.close();',
 'A mensagem fica fora do loop while — ela só é exibida quando o jogador acerta.',
 '🎉 PARABÉNS! Você acertou!\nO número era: 42\nTentativas: 7');

-- ============================================================
-- PROJECT STEPS — AGENDA DE CONTATOS
-- ============================================================
INSERT INTO project_steps (id, project_id, step_number, title, description, code_template, hint, expected_output) VALUES
(10, 3, 1, 'Criar a classe Contato',
 'Crie uma classe Contato com os campos nome, telefone e email. Adicione construtor, getters e método toString().',
 'public class Contato {\n    private String nome;\n    private String telefone;\n    private String email;\n\n    public Contato(String nome, String telefone, String email) {\n        this.nome = nome;\n        this.telefone = telefone;\n        this.email = email;\n    }\n\n    // TODO: getters e toString()\n\n    @Override\n    public String toString() {\n        return nome + " | " + telefone + " | " + email;\n    }\n}',
 'toString() define como o objeto aparece quando impresso. O @Override indica que estamos sobrescrevendo um método da classe Object.',
 NULL),

(11, 3, 2, 'Criar a agenda com ArrayList',
 'Na classe principal, crie um ArrayList<Contato> para armazenar os contatos. Implemente o método de adicionar.',
 'import java.util.ArrayList;\nimport java.util.Scanner;\n\npublic class Agenda {\n    private ArrayList<Contato> contatos = new ArrayList<>();\n    private Scanner sc = new Scanner(System.in);\n\n    public void adicionarContato() {\n        System.out.print("Nome: ");\n        String nome = sc.nextLine();\n        System.out.print("Telefone: ");\n        String telefone = sc.nextLine();\n        System.out.print("Email: ");\n        String email = sc.nextLine();\n        contatos.add(new Contato(nome, telefone, email));\n        System.out.println("✅ Contato adicionado!");\n    }\n}',
 'ArrayList<Contato> é uma lista genérica que só aceita objetos do tipo Contato. contatos.add() adiciona ao final.',
 NULL),

(12, 3, 3, 'Listar e buscar contatos',
 'Crie métodos para listar todos os contatos e buscar por nome usando um loop for-each.',
 'public void listarContatos() {\n    if (contatos.isEmpty()) {\n        System.out.println("Agenda vazia!");\n        return;\n    }\n    System.out.println("\\n=== CONTATOS ===");\n    for (int i = 0; i < contatos.size(); i++) {\n        System.out.println((i+1) + ". " + contatos.get(i));\n    }\n}\n\npublic void buscarContato(String nome) {\n    for (Contato c : contatos) {\n        if (c.getNome().equalsIgnoreCase(nome)) {\n            System.out.println("Encontrado: " + c);\n            return;\n        }\n    }\n    System.out.println("Contato não encontrado.");\n}',
 'equalsIgnoreCase() compara strings ignorando maiúsculas/minúsculas. Sempre use equals() (não ==) para comparar Strings.',
 NULL),

(13, 3, 4, 'Remover contato',
 'Implemente a remoção de contato por número (índice na lista). Cuidado com índices inválidos.',
 'public void removerContato(int posicao) {\n    if (posicao < 1 || posicao > contatos.size()) {\n        System.out.println("Posição inválida!");\n        return;\n    }\n    Contato removido = contatos.remove(posicao - 1);\n    System.out.println("Removido: " + removido.getNome());\n}',
 'contatos.remove(index) remove pelo índice (começa em 0). Por isso subtraímos 1 da posição digitada pelo usuário.',
 NULL),

(14, 3, 5, 'Menu principal',
 'Crie o menu principal com loop do-while que exibe as opções e chama os métodos correspondentes.',
 'public void executar() {\n    int opcao;\n    do {\n        System.out.println("\\n=== AGENDA ===");\n        System.out.println("1 - Adicionar Contato");\n        System.out.println("2 - Listar Contatos");\n        System.out.println("3 - Buscar Contato");\n        System.out.println("4 - Remover Contato");\n        System.out.println("0 - Sair");\n        System.out.print("Opção: ");\n        opcao = sc.nextInt();\n        sc.nextLine(); // consumir newline\n        switch (opcao) {\n            case 1 -> adicionarContato();\n            case 2 -> listarContatos();\n            // TODO: casos 3 e 4\n        }\n    } while (opcao != 0);\n    System.out.println("Até logo!");\n}',
 'O do-while executa pelo menos uma vez, ideal para menus. Após sc.nextInt(), sempre chame sc.nextLine() para consumir o \n.',
 '=== AGENDA ===\n1 - Adicionar Contato\n2 - Listar Contatos\n...');

-- ============================================================
-- PROJECT STEPS — JOGO DE QUIZ
-- ============================================================
INSERT INTO project_steps (id, project_id, step_number, title, description, code_template, hint, expected_output) VALUES
(15, 4, 1, 'Criar a classe Pergunta',
 'Crie uma classe Pergunta com enunciado, opções (array de Strings) e índice da resposta correta.',
 'public class Pergunta {\n    private String enunciado;\n    private String[] opcoes;\n    private int respostaCorreta; // índice em opcoes[]\n\n    public Pergunta(String enunciado, String[] opcoes, int respostaCorreta) {\n        this.enunciado = enunciado;\n        this.opcoes = opcoes;\n        this.respostaCorreta = respostaCorreta;\n    }\n\n    public boolean verificar(int resposta) {\n        return resposta == respostaCorreta;\n    }\n\n    // TODO: getters\n}',
 'O índice da resposta correta começa em 0. Se a resposta certa é a primeira opção, respostaCorreta = 0.',
 NULL),

(16, 4, 2, 'Montar o banco de perguntas',
 'Crie um array de Pergunta com 5 perguntas sobre Java. Cada pergunta tem 4 opções.',
 'Pergunta[] perguntas = {\n    new Pergunta(\n        "Qual é o tipo para números inteiros em Java?",\n        new String[]{"int", "number", "integer", "whole"},\n        0  // "int" é a resposta certa (índice 0)\n    ),\n    new Pergunta(\n        "O que significa OOP?",\n        new String[]{"Object Oriented Programming", "Only Object Program", "Open Output Process", "None"},\n        0\n    ),\n    // TODO: adicionar mais 3 perguntas\n};',
 'Use new String[]{} para criar um array inline. O índice 0 representa o primeiro elemento do array.',
 NULL),

(17, 4, 3, 'Exibir perguntas e coletar respostas',
 'Percorra o array de perguntas com for, exiba as opções e leia a resposta do usuário.',
 'Scanner sc = new Scanner(System.in);\nint pontos = 0;\n\nfor (int i = 0; i < perguntas.length; i++) {\n    Pergunta p = perguntas[i];\n    System.out.println("\\nPergunta " + (i+1) + ": " + p.getEnunciado());\n    String[] opcoes = p.getOpcoes();\n    for (int j = 0; j < opcoes.length; j++) {\n        System.out.println((j+1) + ") " + opcoes[j]);\n    }\n    System.out.print("Sua resposta (1-4): ");\n    int resp = sc.nextInt() - 1; // -1 porque índice começa em 0\n    if (p.verificar(resp)) {\n        System.out.println("✅ Correto!");\n        pontos++;\n    } else {\n        System.out.println("❌ Errado!");\n    }\n}',
 'Subtraímos 1 da resposta do usuário porque ele digita 1-4, mas os índices do array são 0-3.',
 NULL),

(18, 4, 4, 'Calcular e exibir pontuação final',
 'Ao final das perguntas, mostre a pontuação com uma mensagem adequada ao desempenho.',
 'System.out.println("\\n=== RESULTADO FINAL ===");\nSystem.out.println("Acertos: " + pontos + "/" + perguntas.length);\ndouble pct = (double) pontos / perguntas.length * 100;\nSystem.out.printf("Aproveitamento: %.1f%%\\n", pct);\n\nif (pct == 100) System.out.println("🏆 Perfeito!");\nelse if (pct >= 60) System.out.println("✅ Aprovado!");\nelse System.out.println("📚 Continue estudando!");',
 'O cast (double) é necessário para que a divisão não seja inteira. printf com %.1f mostra uma casa decimal.',
 'Acertos: 4/5\nAproveitamento: 80.0%\n✅ Aprovado!');

-- ============================================================
-- PROJECT STEPS — MINI BANCO
-- ============================================================
INSERT INTO project_steps (id, project_id, step_number, title, description, code_template, hint, expected_output) VALUES
(19, 5, 1, 'Criar classe Conta base',
 'Crie uma classe abstrata Conta com número, titular e saldo. Adicione métodos depositar e sacar.',
 'public abstract class Conta {\n    protected int numero;\n    protected String titular;\n    protected double saldo;\n\n    public Conta(int numero, String titular, double saldoInicial) {\n        this.numero = numero;\n        this.titular = titular;\n        this.saldo = saldoInicial;\n    }\n\n    public void depositar(double valor) {\n        if (valor <= 0) throw new IllegalArgumentException("Valor inválido");\n        saldo += valor;\n        System.out.println("✅ Depósito de R$" + valor + " realizado.");\n    }\n\n    public abstract void sacar(double valor);\n\n    public void exibirExtrato() {\n        System.out.println("Conta: " + numero + " | " + titular + " | Saldo: R$" + saldo);\n    }\n}',
 'Classes abstratas não podem ser instanciadas. O método sacar é abstrato porque cada tipo de conta tem regras diferentes.',
 NULL),

(20, 5, 2, 'Criar ContaCorrente e ContaPoupanca',
 'Crie duas subclasses. ContaCorrente tem limite de cheque especial. ContaPoupanca cobra taxa no saque.',
 'public class ContaCorrente extends Conta {\n    private double limite;\n\n    public ContaCorrente(int numero, String titular, double saldo, double limite) {\n        super(numero, titular, saldo);\n        this.limite = limite;\n    }\n\n    @Override\n    public void sacar(double valor) {\n        if (valor > saldo + limite) {\n            System.out.println("❌ Saldo insuficiente (com limite)!");\n            return;\n        }\n        saldo -= valor;\n        System.out.println("✅ Saque de R$" + valor + " realizado.");\n    }\n}\n\n// TODO: criar ContaPoupanca com taxa de 0.5% no saque',
 'extends indica herança. super() chama o construtor da classe pai. @Override indica que estamos sobrescrevendo sacar().',
 NULL),

(21, 5, 3, 'Criar o Banco com lista de contas',
 'Crie uma classe Banco que gerencia uma ArrayList de Conta. Implemente métodos para abrir conta e buscar por número.',
 'import java.util.ArrayList;\n\npublic class Banco {\n    private ArrayList<Conta> contas = new ArrayList<>();\n    private int proximoNumero = 1001;\n\n    public ContaCorrente abrirContaCorrente(String titular, double deposito) {\n        ContaCorrente c = new ContaCorrente(proximoNumero++, titular, deposito, 500);\n        contas.add(c);\n        System.out.println("✅ Conta Corrente " + c.getNumero() + " aberta para " + titular);\n        return c;\n    }\n\n    public Conta buscarConta(int numero) {\n        return contas.stream()\n            .filter(c -> c.getNumero() == numero)\n            .findFirst()\n            .orElse(null);\n    }\n}',
 'ArrayList<Conta> funciona com polimorfismo: armazena ContaCorrente e ContaPoupanca como Conta. Stream().filter() usa lambdas!',
 NULL),

(22, 5, 4, 'Criar menu interativo',
 'Crie o menu do caixa eletrônico com opções de consultar saldo, depositar, sacar e ver extrato.',
 'Scanner sc = new Scanner(System.in);\nBanco banco = new Banco();\n\n// Criar contas de teste\nContaCorrente cc = banco.abrirContaCorrente("Ana Silva", 1000);\nbanco.abrirContaPoupanca("João Lima", 500);\n\nint opcao;\ndo {\n    System.out.println("\\n=== BANCO JAVA ===");\n    System.out.println("1 - Ver saldo");\n    System.out.println("2 - Depositar");\n    System.out.println("3 - Sacar");\n    System.out.println("4 - Ver extrato de todas contas");\n    System.out.println("0 - Sair");\n    opcao = sc.nextInt();\n    // TODO: implementar switch com as opções\n} while (opcao != 0);',
 'Chame banco.buscarConta(numero) para encontrar a conta antes de operar. Sempre valide se a conta existe (não é null).',
 '=== BANCO JAVA ===\n1 - Ver saldo\n...');

-- ============================================================
-- INTERVIEW QUESTIONS
-- ============================================================

-- FUNDAMENTOS (10 perguntas)
INSERT INTO interview_questions (id, question, answer, difficulty, category, hint, code_example, order_index) VALUES
(1,
 'Qual a diferença entre int e Integer em Java?',
 'int é um tipo primitivo que armazena o valor diretamente na memória stack, ocupando 4 bytes. Integer é uma classe wrapper (objeto) que envolve o int, permitindo uso em coleções genéricas como List<Integer>, acesso a métodos utilitários (Integer.parseInt(), Integer.MAX_VALUE) e suporte a null. O Java faz autoboxing/unboxing automaticamente entre os dois.',
 'FACIL', 'Fundamentos',
 'Pense: primitivo vs objeto. Um pode ser null, o outro não.',
 'int a = 10;              // primitivo\nInteger b = 10;           // objeto (autoboxing)\nInteger c = null;         // pode ser null\nList<Integer> lista = new ArrayList<>();  // só aceita Integer',
 1),

(2,
 'O que é o método main e por que ele tem essa assinatura?',
 'O método main é o ponto de entrada de todo programa Java. A JVM busca exatamente a assinatura: public static void main(String[] args). public: acessível de fora da classe. static: chamado sem instanciar a classe. void: não retorna nada. String[] args: recebe argumentos da linha de comando.',
 'FACIL', 'Fundamentos',
 'Pense no que cada palavra-chave significa individualmente.',
 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Olá, mundo!");\n    }\n}',
 2),

(3,
 'Qual a diferença entre == e equals() para Strings?',
 '== compara referências de memória (se dois ponteiros apontam para o mesmo objeto). equals() compara o conteúdo das strings. Duas strings com o mesmo texto podem estar em locais diferentes da memória, então == pode retornar false mesmo com conteúdo igual. SEMPRE use equals() para comparar strings.',
 'FACIL', 'Fundamentos',
 'String s1 = new String("abc") cria um novo objeto, diferente do pool de strings.',
 'String a = "Java";\nString b = "Java";\nString c = new String("Java");\n\na == b      // true (mesmo objeto no pool)\na == c      // false (c é objeto novo)\na.equals(c) // true (mesmo conteúdo)',
 3),

(4,
 'O que é autoboxing e unboxing?',
 'Autoboxing é a conversão automática do Java de um tipo primitivo para seu wrapper correspondente (int → Integer). Unboxing é o contrário (Integer → int). Isso permite usar primitivos em estruturas que só aceitam objetos, como coleções. Cuidado: unboxing de null causa NullPointerException!',
 'FACIL', 'Fundamentos',
 'Boxing = colocar em uma caixa (objeto). Unboxing = tirar da caixa.',
 'Integer x = 42;       // autoboxing: int → Integer\nint y = x;            // unboxing: Integer → int\n\nInteger z = null;\nint w = z;            // NullPointerException!',
 4),

(5,
 'Qual a diferença entre Stack e Heap na JVM?',
 'Stack (pilha) armazena variáveis locais, parâmetros de métodos e referências de objetos. É gerenciada automaticamente: quando o método termina, a memória é liberada. Heap armazena todos os objetos criados com new. É onde o Garbage Collector atua. Tipos primitivos ficam na Stack; objetos ficam no Heap com apenas sua referência na Stack.',
 'MEDIO', 'Fundamentos',
 'Primitivos na Stack, objetos no Heap.',
 'void exemplo() {\n    int x = 5;           // x fica na Stack\n    String s = "Olá";   // referência na Stack, objeto no Heap\n    Pessoa p = new Pessoa(); // referência na Stack, Pessoa no Heap\n}',
 5),

(6,
 'O que é um NullPointerException e como evitá-lo?',
 'NullPointerException (NPE) ocorre quando tentamos acessar método ou campo de uma referência que é null. É o erro mais comum em Java. Para evitar: 1) Sempre inicialize variáveis antes de usar. 2) Verifique null antes de chamar métodos. 3) Use Optional<T> para retornos que podem ser null. 4) Use Objects.requireNonNull() em parâmetros críticos.',
 'FACIL', 'Fundamentos',
 'Null significa "nenhum objeto". Tentar usar um objeto que não existe = NPE.',
 'String nome = null;\nnome.length(); // NullPointerException!\n\n// Solução 1: verificar null\nif (nome != null) nome.length();\n\n// Solução 2: Optional\nOptional.ofNullable(nome)\n        .map(String::length)\n        .orElse(0);',
 6),

(7,
 'Qual a diferença entre String, StringBuilder e StringBuffer?',
 'String é imutável: cada operação cria um novo objeto. StringBuilder é mutável e eficiente para concatenações em loop, mas não é thread-safe. StringBuffer é como StringBuilder mas thread-safe (sincronizado), porém mais lento. Use String para textos fixos, StringBuilder para construção dinâmica de strings em código single-thread.',
 'MEDIO', 'Fundamentos',
 'Imutável vs mutável. Thread-safe vs não thread-safe.',
 '// String: ineficiente em loops\nString s = "";\nfor (int i = 0; i < 1000; i++) s += i; // cria 1000 objetos!\n\n// StringBuilder: eficiente\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 1000; i++) sb.append(i); // um objeto só',
 7),

(8,
 'O que são os modificadores de acesso em Java?',
 'public: acessível de qualquer lugar. protected: acessível na mesma classe, subclasses e mesmo pacote. default (sem modificador): acessível apenas no mesmo pacote. private: acessível apenas na mesma classe. Regra geral: use private por padrão, exponha apenas o necessário (encapsulamento).',
 'FACIL', 'Fundamentos',
 'Menos acesso = mais encapsulamento = código mais seguro.',
 'public class Pessoa {\n    private String nome;    // só aqui dentro\n    protected int idade;    // subclasses podem ver\n    String cidade;          // mesmo pacote\n    public String getId() { return nome; } // qualquer um\n}',
 8),

(9,
 'O que é final em Java? Quando usar?',
 'final aplicado a: variável: constante, não pode ser reatribuída. método: não pode ser sobrescrito (override) por subclasses. classe: não pode ser estendida (herdada). Use final em constantes (static final), parâmetros de métodos que não devem mudar, e classes/métodos que não devem ser extendidos por segurança ou design.',
 'MEDIO', 'Fundamentos',
 'final = "isso não pode mudar".',
 'final int MAX = 100;      // constante\nMAX = 200;               // erro de compilação!\n\nfinal class String { }   // não pode ser estendida\n\nvoid metodo(final int x) {\n    x = 5;               // erro!\n}',
 9),

(10,
 'Qual a diferença entre continue e break em loops?',
 'break encerra o loop imediatamente, saindo completamente. continue pula para a próxima iteração do loop, ignorando o restante do código da iteração atual. Ambos funcionam com for, while e do-while. break também funciona em switch para evitar fall-through.',
 'FACIL', 'Fundamentos',
 'break = sair do loop. continue = pular esta iteração e ir para a próxima.',
 'for (int i = 0; i < 10; i++) {\n    if (i == 3) continue; // pula o 3\n    if (i == 7) break;   // para no 7\n    System.out.println(i); // imprime 0,1,2,4,5,6\n}',
 10);

-- OOP (12 perguntas)
INSERT INTO interview_questions (id, question, answer, difficulty, category, hint, code_example, order_index) VALUES
(11,
 'Quais são os 4 pilares da OOP?',
 '1. Encapsulamento: esconder detalhes internos, expor apenas o necessário via métodos públicos. 2. Herança: uma classe filha herda atributos e métodos da classe pai (extends). 3. Polimorfismo: um mesmo método pode ter comportamentos diferentes dependendo do objeto. 4. Abstração: modelar apenas características relevantes do mundo real, ignorando detalhes desnecessários.',
 'FACIL', 'OOP',
 'E-H-P-A: Encapsulamento, Herança, Polimorfismo, Abstração.',
 NULL,
 11),

(12,
 'Qual a diferença entre classe abstrata e interface?',
 'Classe abstrata: pode ter métodos com implementação, construtores, atributos com qualquer modificador. Uma classe só pode estender uma. Interface: antes do Java 8, só métodos abstratos. Agora pode ter default e static methods. Atributos são sempre public static final. Uma classe pode implementar várias. Use interface para contratos; classe abstrata para compartilhar código entre subclasses.',
 'MEDIO', 'OOP',
 'Interface = contrato. Classe abstrata = base com código compartilhado.',
 'abstract class Animal {\n    String nome;\n    abstract void emitirSom(); // obrigatório sobrescrever\n    void respirar() { } // já implementado\n}\n\ninterface Voador {\n    void voar(); // abstrato por padrão\n    default void pousar() { } // Java 8+\n}',
 12),

(13,
 'O que é polimorfismo? Dê um exemplo.',
 'Polimorfismo significa "muitas formas". Um objeto pode ser referenciado pelo tipo da superclasse, mas executa o método da subclasse em tempo de execução (dynamic dispatch). Permite escrever código genérico que funciona com qualquer subclasse sem saber o tipo exato.',
 'MEDIO', 'OOP',
 'O tipo da referência é o pai, mas o comportamento é do filho.',
 'class Animal { void falar() { System.out.println("..."); } }\nclass Cachorro extends Animal { void falar() { System.out.println("Au!"); } }\nclass Gato extends Animal { void falar() { System.out.println("Miau!"); } }\n\nAnimal a = new Cachorro(); // polimorfismo!\na.falar(); // imprime "Au!" — comportamento do Cachorro',
 13),

(14,
 'O que é o princípio de encapsulamento?',
 'Encapsulamento é esconder o estado interno de um objeto, expondo apenas operações seguras via métodos públicos. Atributos devem ser private; acesso via getters/setters. Isso permite: 1) Validar dados antes de atribuir. 2) Mudar a implementação interna sem afetar código externo. 3) Controlar quem pode ler/escrever cada dado.',
 'FACIL', 'OOP',
 'Atributos privados + métodos públicos controlados.',
 'public class ContaBancaria {\n    private double saldo; // ninguém acessa diretamente\n\n    public void depositar(double valor) {\n        if (valor > 0) saldo += valor; // valida antes!\n    }\n\n    public double getSaldo() { return saldo; } // leitura OK\n    // sem setSaldo! ninguém pode alterar diretamente\n}',
 14),

(15,
 'O que é herança e quando NÃO usar?',
 'Herança é quando uma classe filha estende uma classe pai, herdando atributos e métodos. Deve representar uma relação "É UM" (Cachorro É UM Animal). Não use herança quando: 1) A relação é "TEM UM" (use composição). 2) Você quer reutilizar código sem relação semântica (use composição ou utilitários). Herança cria forte acoplamento — prefira interfaces.',
 'MEDIO', 'OOP',
 '"É UM" = herança. "TEM UM" = composição.',
 '// CORRETO: Cachorro É UM Animal\nclass Cachorro extends Animal { }\n\n// ERRADO: Carro NÃO É UM Motor\nclass Carro extends Motor { }  // use composição!\nclass Carro {\n    private Motor motor;  // TEM UM motor\n}',
 15),

(16,
 'O que é override vs overload?',
 'Override (sobrescrita): uma subclasse redefine um método herdado com a mesma assinatura. Resolvido em runtime. Anotado com @Override. Overload (sobrecarga): múltiplos métodos com o mesmo nome mas parâmetros diferentes na mesma classe. Resolvido em compile-time. Não é polimorfismo.',
 'MEDIO', 'OOP',
 'Override = redefinir método herdado. Overload = múltiplas versões com parâmetros diferentes.',
 '// Override: mesma assinatura, comportamento diferente\nclass Filho extends Pai {\n    @Override\n    void metodo() { /* nova implementação */ }\n}\n\n// Overload: mesmo nome, parâmetros diferentes\nvoid calcular(int a) { }\nvoid calcular(int a, int b) { }\nvoid calcular(double a) { }',
 16),

(17,
 'O que é this e super em Java?',
 'this refere-se ao objeto atual. Usos: this.campo para diferenciar campo de parâmetro com mesmo nome; this() para chamar outro construtor da mesma classe. super refere-se à superclasse. Usos: super.metodo() para chamar método do pai; super() para chamar construtor do pai (deve ser a primeira linha do construtor filho).',
 'MEDIO', 'OOP',
 'this = eu mesmo. super = meu pai.',
 'class Pai {\n    String nome;\n    Pai(String nome) { this.nome = nome; }\n}\n\nclass Filho extends Pai {\n    int idade;\n    Filho(String nome, int idade) {\n        super(nome); // chama construtor do Pai\n        this.idade = idade;\n    }\n}',
 17),

(18,
 'O que é static em Java?',
 'static pertence à classe, não a instâncias. Variáveis static: compartilhadas entre todos os objetos da classe. Métodos static: chamados via NomeDaClasse.metodo(), sem criar objeto. Não podem acessar membros de instância (não-static). Blocos static: executados quando a classe é carregada. Use para constantes, utilitários e fábricas.',
 'MEDIO', 'OOP',
 'static = da classe, não do objeto.',
 'public class Contador {\n    private static int total = 0; // compartilhado\n    private int id;\n\n    public Contador() {\n        total++;\n        this.id = total;\n    }\n\n    public static int getTotal() { return total; } // sem this\n}',
 18),

(19,
 'O que é uma interface funcional e para que serve?',
 'Interface funcional é uma interface com exatamente um método abstrato. Pode ser anotada com @FunctionalInterface. Serve como tipo alvo para expressões lambda e method references. Exemplos da JDK: Runnable, Callable, Comparator, Consumer, Supplier, Function, Predicate. São a base do estilo funcional no Java 8+.',
 'MEDIO', 'OOP',
 'Um método abstrato = pode usar lambda.',
 '@FunctionalInterface\ninterface Operacao {\n    int calcular(int a, int b);\n}\n\n// Uso com lambda:\nOperacao soma = (a, b) -> a + b;\nOperacao mult = (a, b) -> a * b;\n\nSystem.out.println(soma.calcular(3, 4));  // 7\nSystem.out.println(mult.calcular(3, 4)); // 12',
 19),

(20,
 'O que é o padrão Singleton?',
 'Singleton garante que uma classe tenha apenas uma instância em toda a aplicação, fornecendo um ponto de acesso global. Implementação: construtor private, instância static, método getInstance() que cria ou retorna a instância existente. Cuidado: pode dificultar testes unitários (prefira injeção de dependência quando possível).',
 'DIFICIL', 'OOP',
 'Uma instância só. getInstance() retorna sempre a mesma.',
 'public class Configuracao {\n    private static Configuracao instancia;\n    private String tema = "claro";\n\n    private Configuracao() { } // ninguém pode criar externamente\n\n    public static Configuracao getInstance() {\n        if (instancia == null) {\n            instancia = new Configuracao();\n        }\n        return instancia;\n    }\n}',
 20),

(21,
 'O que são classes anônimas e quando usar?',
 'Classe anônima é uma classe criada e instanciada ao mesmo tempo, sem nome. Usada para implementar interfaces ou estender classes em uso único. Com Java 8+, lambdas substituem classes anônimas para interfaces funcionais. Ainda útil para interfaces com múltiplos métodos.',
 'DIFICIL', 'OOP',
 'Antes dos lambdas, era a forma de passar comportamento como parâmetro.',
 '// Com classe anônima\nRunnable r = new Runnable() {\n    @Override\n    public void run() {\n        System.out.println("Executando!");\n    }\n};\n\n// Com lambda (Java 8+) — equivalente e mais limpo\nRunnable r2 = () -> System.out.println("Executando!");',
 21),

(22,
 'Qual a diferença entre composição e herança?',
 'Herança: "É UM" — a subclasse é um tipo especializado da superclasse. Cria acoplamento forte. Composição: "TEM UM" — a classe contém uma instância de outra. Mais flexível e preferida na OOP moderna ("prefira composição à herança"). Composição permite trocar a implementação em runtime e é mais fácil de testar.',
 'DIFICIL', 'OOP',
 'Favor composition over inheritance — GoF Design Patterns.',
 '// Herança: Salário É UM funcionário? Não faz sentido!\n// Composição: Funcionário TEM UM salário\nclass Funcionario {\n    private Salario salario;    // composição\n    private Cargo cargo;        // composição\n    private String nome;\n}',
 22);

-- COLLECTIONS (10 perguntas)
INSERT INTO interview_questions (id, question, answer, difficulty, category, hint, code_example, order_index) VALUES
(23,
 'Qual a diferença entre ArrayList e LinkedList?',
 'ArrayList usa array interno: acesso por índice O(1), inserção/remoção no meio O(n). LinkedList usa nós encadeados: acesso por índice O(n), inserção/remoção nas pontas O(1). Use ArrayList para a maioria dos casos (acesso aleatório frequente). Use LinkedList quando insere/remove muito nas pontas ou usa como Queue/Deque.',
 'MEDIO', 'Collections',
 'ArrayList = acesso rápido. LinkedList = inserção/remoção rápida nas pontas.',
 'List<String> array = new ArrayList<>();  // get(i) é rápido\nList<String> linked = new LinkedList<>(); // add/remove nas pontas é rápido\n\n// Para a maioria: ArrayList é suficiente\narray.add("Java");\nString s = array.get(0); // O(1)',
 23),

(24,
 'Qual a diferença entre HashMap, LinkedHashMap e TreeMap?',
 'HashMap: sem ordem garantida, O(1) para get/put. LinkedHashMap: mantém ordem de inserção, levemente mais lento. TreeMap: ordenado pela chave (natural ou Comparator), O(log n). Use HashMap para máxima performance sem ordem. LinkedHashMap para cache LRU. TreeMap para dados ordenados.',
 'MEDIO', 'Collections',
 'Hash = rápido sem ordem. Linked = ordem de inserção. Tree = ordenado.',
 'Map<String, Integer> hash = new HashMap<>();       // sem ordem\nMap<String, Integer> linked = new LinkedHashMap<>(); // ordem inserção\nMap<String, Integer> tree = new TreeMap<>();          // ordem alfabética\n\ntree.put("banana", 2);\ntree.put("abacaxi", 1);\ntree.put("coco", 3);\n// Iteração: abacaxi, banana, coco',
 24),

(25,
 'Qual a diferença entre HashSet e TreeSet?',
 'HashSet: sem ordem, usa hashCode() e equals(), O(1) para add/contains. TreeSet: ordenado (natural ou Comparator), usa compareTo(), O(log n). Para conjuntos sem ordem e máxima performance: HashSet. Para conjuntos ordenados: TreeSet. Ambos não permitem duplicatas.',
 'MEDIO', 'Collections',
 'Set = sem duplicatas. Hash = rápido. Tree = ordenado.',
 'Set<String> hash = new HashSet<>();\nhash.add("banana");\nhash.add("maçã");\nhash.add("banana"); // ignorado!\nhash.size(); // 2\n\nSet<Integer> tree = new TreeSet<>();\ntree.add(3); tree.add(1); tree.add(2);\n// Iteração: 1, 2, 3 (ordenado)',
 25),

(26,
 'O que é a interface Comparable e para que serve?',
 'Comparable define a "ordem natural" de uma classe via método compareTo(). Classes que implementam Comparable podem ser ordenadas com Collections.sort() ou Arrays.sort() sem precisar de Comparator externo. Retorna negativo se this < outro, zero se igual, positivo se this > outro.',
 'MEDIO', 'Collections',
 'Comparable = a classe sabe se ordenar. compareTo retorna <0, 0, ou >0.',
 'class Produto implements Comparable<Produto> {\n    private double preco;\n\n    @Override\n    public int compareTo(Produto outro) {\n        return Double.compare(this.preco, outro.preco);\n    }\n}\n\nList<Produto> lista = new ArrayList<>();\nCollections.sort(lista); // usa compareTo automaticamente',
 26),

(27,
 'Qual a diferença entre Iterator e for-each?',
 'for-each é açúcar sintático sobre Iterator — o compilador converte para Iterator por baixo. Iterator é necessário quando você precisa remover elementos durante a iteração (use iterator.remove()). Nunca remova de uma coleção dentro de um for-each — causa ConcurrentModificationException.',
 'MEDIO', 'Collections',
 'Remover durante iteração? Use Iterator. Caso contrário, for-each.',
 '// for-each (normal)\nfor (String s : lista) { System.out.println(s); }\n\n// Iterator (quando precisa remover)\nIterator<String> it = lista.iterator();\nwhile (it.hasNext()) {\n    String s = it.next();\n    if (s.isEmpty()) it.remove(); // seguro!\n}',
 27),

(28,
 'O que é Collections.unmodifiableList() e quando usar?',
 'Retorna uma visão imutável de uma lista existente. Qualquer tentativa de modificar (add, remove, set) lança UnsupportedOperationException. Use para expor listas internas de uma classe sem permitir modificação externa. Java 9+ introduziu List.of() e List.copyOf() que criam listas imutáveis mais eficientes.',
 'MEDIO', 'Collections',
 'Imutabilidade defensiva: proteger dados internos.',
 'class Turma {\n    private List<String> alunos = new ArrayList<>();\n\n    public List<String> getAlunos() {\n        return Collections.unmodifiableList(alunos); // protegido!\n    }\n}\n\n// Java 9+\nList<String> imutavel = List.of("Ana", "Bob", "Carlos");\nimutavel.add("David"); // UnsupportedOperationException!',
 28),

(29,
 'Como funciona o hashCode e equals? Qual o contrato?',
 'O contrato: 1) Se a.equals(b) é true, então a.hashCode() == b.hashCode(). 2) Se hashCode() são iguais, equals() pode ser true ou false (colisão). HashMap e HashSet dependem disso. Se você sobrescreve equals(), DEVE sobrescrever hashCode() também. A maioria das IDEs gera os dois juntos. Java 7+ tem Objects.equals() e Objects.hash() para ajudar.',
 'DIFICIL', 'Collections',
 'equals == mesmo conteúdo. hashCode == índice no bucket. Sempre sobrescreva os dois juntos.',
 'class Ponto {\n    int x, y;\n\n    @Override\n    public boolean equals(Object o) {\n        if (!(o instanceof Ponto p)) return false;\n        return x == p.x && y == p.y;\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(x, y);\n    }\n}',
 29),

(30,
 'Qual a diferença entre Queue e Stack em Java?',
 'Queue (fila) é FIFO — primeiro a entrar, primeiro a sair. Interface Queue com implementações: LinkedList, ArrayDeque, PriorityQueue. Stack (pilha) é LIFO — último a entrar, primeiro a sair. A classe Stack existe mas é legada — prefira Deque com ArrayDeque como pilha. Deque suporta operações em ambas as pontas.',
 'MEDIO', 'Collections',
 'Queue = fila de banco. Stack = pilha de pratos.',
 'Queue<String> fila = new LinkedList<>();\nfila.offer("primeiro");\nfila.offer("segundo");\nfila.poll(); // remove "primeiro" (FIFO)\n\nDeque<String> pilha = new ArrayDeque<>();\npilha.push("base");\npilha.push("topo");\npilha.pop(); // remove "topo" (LIFO)',
 30),

(31,
 'O que é ConcurrentModificationException?',
 'Ocorre quando uma coleção é modificada estruturalmente enquanto é iterada por um Iterator ou for-each. Detectado pelo campo modCount. Para iterar e modificar: use Iterator.remove(), CopyOnWriteArrayList (thread-safe), ou colete os itens a remover e remova depois. Em código multi-thread, use coleções concurrent como ConcurrentHashMap.',
 'MEDIO', 'Collections',
 'Não modifique uma coleção enquanto itera com for-each.',
 '// ERRO:\nfor (String s : lista) {\n    if (s.isEmpty()) lista.remove(s); // ConcurrentModificationException!\n}\n\n// CORRETO:\nlista.removeIf(String::isEmpty); // Java 8+\n\n// Ou:\nIterator<String> it = lista.iterator();\nwhile (it.hasNext()) {\n    if (it.next().isEmpty()) it.remove();\n}',
 31),

(32,
 'O que é um Map.Entry e como iterar um Map?',
 'Map.Entry representa um par chave-valor do Map. Iterar um Map via entrySet() é a forma mais eficiente de acessar chave e valor ao mesmo tempo. Alternativas: keySet() (só chaves), values() (só valores). Java 8+ tem forEach() com lambda.',
 'FACIL', 'Collections',
 'entrySet() = pares chave-valor. keySet() = só chaves. values() = só valores.',
 'Map<String, Integer> idades = new HashMap<>();\nidades.put("Ana", 25);\nidades.put("Bob", 30);\n\n// Forma idiomática Java 8+:\nidades.forEach((nome, idade) ->\n    System.out.println(nome + " tem " + idade + " anos")\n);\n\n// Forma tradicional:\nfor (Map.Entry<String, Integer> e : idades.entrySet()) {\n    System.out.println(e.getKey() + ": " + e.getValue());\n}',
 32);

-- STREAMS & LAMBDA (8 perguntas)
INSERT INTO interview_questions (id, question, answer, difficulty, category, hint, code_example, order_index) VALUES
(33,
 'O que é a Stream API e quais são seus 3 tipos de operações?',
 'Stream é uma sequência de elementos que suporta operações em pipeline de forma declarativa. Não armazena dados — processa da fonte. 3 tipos: 1) Operações intermediárias: filter, map, sorted, distinct, limit (lazy, retornam Stream). 2) Operações terminais: collect, forEach, count, findFirst, reduce (executam o pipeline). 3) Short-circuit: anyMatch, findFirst (param o pipeline cedo).',
 'MEDIO', 'Streams e Lambda',
 'Stream = pipeline de transformações. Intermediária retorna Stream. Terminal executa tudo.',
 'List<String> nomes = List.of("Ana", "Bob", "Carlos", "Alice");\n\nnomes.stream()\n    .filter(n -> n.startsWith("A"))   // intermediária\n    .map(String::toUpperCase)          // intermediária\n    .sorted()                           // intermediária\n    .forEach(System.out::println);      // terminal: ANA, ALICE',
 33),

(34,
 'Qual a diferença entre map() e flatMap()?',
 'map() transforma cada elemento 1:1, produzindo Stream<Stream<T>> se o mapper retorna Stream. flatMap() "achata" o resultado: mapeia e depois une todas as streams em uma só, produzindo Stream<T>. Use flatMap quando cada elemento produz múltiplos resultados.',
 'DIFICIL', 'Streams e Lambda',
 'map = 1 entrada, 1 saída. flatMap = 1 entrada, N saídas (achatadas).',
 'List<List<Integer>> lista = List.of(\n    List.of(1, 2, 3),\n    List.of(4, 5, 6)\n);\n\n// map: Stream<List<Integer>> — lista de listas\nlista.stream().map(l -> l);\n\n// flatMap: Stream<Integer> — lista plana\nlista.stream()\n    .flatMap(Collection::stream)\n    .collect(Collectors.toList()); // [1,2,3,4,5,6]',
 34),

(35,
 'O que é Optional e como usar corretamente?',
 'Optional<T> é um container que pode ou não conter um valor. Criado para eliminar null checks explícitos e NPE. Métodos: of() para valor não-null, ofNullable() para possível null, empty() para vazio. Operações: isPresent(), get() (cuidado!), orElse(), orElseGet(), orElseThrow(), map(), filter(), ifPresent(). NUNCA use Optional como campo de classe ou parâmetro — só para retornos.',
 'MEDIO', 'Streams e Lambda',
 'Optional = pode ter valor ou não. orElse() > get() (evita NoSuchElementException).',
 'Optional<String> opt = Optional.ofNullable(buscarNome());\n\n// Ruim: get() sem verificar\nopt.get(); // NoSuchElementException se vazio!\n\n// Bom:\nString nome = opt.orElse("Anônimo");\nString nome2 = opt.orElseGet(() -> gerarNome());\nopt.ifPresent(n -> System.out.println("Olá, " + n));\nopt.map(String::toUpperCase).orElse("?");',
 35),

(36,
 'O que é um method reference? Quais os 4 tipos?',
 'Method reference é uma forma mais concisa de lambda quando o lambda apenas chama um método existente. Sintaxe: NomeClasse::nomeMetodo. 4 tipos: 1) Estático: Integer::parseInt. 2) De instância de objeto específico: obj::metodo. 3) De instância de tipo arbitrário: String::toUpperCase. 4) Construtor: ArrayList::new.',
 'MEDIO', 'Streams e Lambda',
 'Classe::metodo no lugar de x -> Classe.metodo(x).',
 '// Lambda equivalente ao method reference:\nlist.forEach(s -> System.out.println(s));\nlist.forEach(System.out::println);   // mais limpo\n\nlist.stream().map(s -> s.toUpperCase());\nlist.stream().map(String::toUpperCase); // tipo arbitrário\n\nlist.stream().map(s -> new ArrayList<>(s));\nlist.stream().map(ArrayList::new);   // construtor',
 36),

(37,
 'Como usar Collectors para agrupar dados?',
 'Collectors.groupingBy() agrupa elementos por uma chave, retornando Map<K, List<V>>. Collectors.counting() conta por grupo. Collectors.partitioningBy() divide em dois grupos (true/false). Collectors.joining() une strings. Collectors.toMap() converte para Map. São os coletores mais usados em entrevistas.',
 'DIFICIL', 'Streams e Lambda',
 'groupingBy = agrupar. joining = juntar strings. toMap = criar mapa.',
 'List<Pessoa> pessoas = ...; // nome, idade, cidade\n\n// Agrupar por cidade\nMap<String, List<Pessoa>> porCidade =\n    pessoas.stream().collect(Collectors.groupingBy(Pessoa::getCidade));\n\n// Contar por cidade\nMap<String, Long> contagem =\n    pessoas.stream().collect(Collectors.groupingBy(Pessoa::getCidade, Collectors.counting()));\n\n// Unir nomes\nString nomes = pessoas.stream()\n    .map(Pessoa::getNome)\n    .collect(Collectors.joining(", "));',
 37),

(38,
 'O que é reduce() em Streams?',
 'reduce() é uma operação terminal que combina todos os elementos do stream em um único resultado aplicando uma função acumuladora. Útil para somar, multiplicar, encontrar máximo/mínimo de forma customizada. Variantes: sem identidade (retorna Optional), com identidade (retorna T), combiner para streams paralelas.',
 'DIFICIL', 'Streams e Lambda',
 'reduce = juntar tudo em um. Como um fold/accumulate funcional.',
 'List<Integer> numeros = List.of(1, 2, 3, 4, 5);\n\n// Soma manual com reduce\nint soma = numeros.stream()\n    .reduce(0, (acc, n) -> acc + n); // 15\n\n// Equivalente mais limpo:\nint soma2 = numeros.stream()\n    .reduce(0, Integer::sum);\n\n// Alternativa:\nOptionalInt soma3 = numeros.stream()\n    .mapToInt(Integer::intValue)\n    .sum(); // via IntStream',
 38),

(39,
 'Qual a diferença entre stream() e parallelStream()?',
 'stream() processa elementos sequencialmente em uma thread. parallelStream() divide os elementos entre múltiplas threads do ForkJoinPool para processamento paralelo. Nem sempre parallelStream é mais rápido: tem overhead de sincronização. Use parallelStream para coleções grandes e operações CPU-intensivas sem efeitos colaterais. Evite com operações que têm estado compartilhado.',
 'DIFICIL', 'Streams e Lambda',
 'Paralelo nem sempre = mais rápido. Depende do tamanho e tipo de operação.',
 '// Sequencial\nlista.stream()\n    .map(this::processoLento)\n    .collect(toList());\n\n// Paralelo (bom para listas grandes e CPU-bound)\nlista.parallelStream()\n    .map(this::processoLento)\n    .collect(toList());\n\n// CUIDADO: efeitos colaterais são perigosos em paralelo!\nList<String> result = new ArrayList<>(); // não thread-safe!\nlista.parallelStream().forEach(result::add); // PROBLEMA!',
 39),

(40,
 'O que é a interface Predicate e como compor predicados?',
 'Predicate<T> é uma interface funcional que recebe T e retorna boolean. Usada em filter(). Pode ser composta: and(), or(), negate(). Predicate.not() (Java 11+) nega um method reference. Permite criar filtros reutilizáveis e combináveis.',
 'MEDIO', 'Streams e Lambda',
 'Predicate = função que retorna true/false. Componível com and/or/negate.',
 'Predicate<String> temA = s -> s.contains("a");\nPredicate<String> longa = s -> s.length() > 5;\n\n// Composição:\nPredicate<String> temAELonga = temA.and(longa);\nPredicate<String> temAOuLonga = temA.or(longa);\nPredicate<String> naoTemA = temA.negate();\n\nlist.stream().filter(temAELonga).collect(toList());\n\n// Predicate.not() Java 11+\nlist.stream().filter(Predicate.not(String::isBlank));',
 40);

-- EXCEPTIONS (6 perguntas)
INSERT INTO interview_questions (id, question, answer, difficulty, category, hint, code_example, order_index) VALUES
(41,
 'Qual a diferença entre Checked e Unchecked Exceptions?',
 'Checked exceptions (verificadas): estendem Exception (exceto RuntimeException). O compilador força tratar (try-catch) ou declarar (throws). Ex: IOException, SQLException. Unchecked exceptions (não verificadas): estendem RuntimeException. Não exige tratamento explícito. Ex: NullPointerException, IllegalArgumentException. Error também é unchecked mas representa problemas da JVM (OutOfMemoryError).',
 'MEDIO', 'Exceptions',
 'Checked = compilador força tratar. Unchecked = erro de programação em runtime.',
 '// Checked: obrigatório tratar\ntry {\n    FileInputStream f = new FileInputStream("arquivo.txt");\n} catch (FileNotFoundException e) { }\n\n// Unchecked: opcional tratar (mas boa prática)\nString s = null;\ntry {\n    s.length(); // NullPointerException\n} catch (NullPointerException e) { }',
 41),

(42,
 'O que faz o bloco finally?',
 'finally executa sempre após try/catch, independente de exceção. Usado para liberar recursos (fechar conexões, streams, arquivos). Com try-with-resources (Java 7+), o finally para recursos é automático. CUIDADO: return no finally sobrescreve return do try. finally NÃO executa se a JVM for morta (System.exit()).',
 'FACIL', 'Exceptions',
 'finally = sempre executa. Use para liberar recursos.',
 '// Sem try-with-resources (Java 6-)\nConnection conn = null;\ntry {\n    conn = getConnection();\n    // trabalhar com conn\n} catch (SQLException e) {\n    e.printStackTrace();\n} finally {\n    if (conn != null) conn.close(); // sempre fecha\n}\n\n// Com try-with-resources (Java 7+) — melhor!\ntry (Connection conn = getConnection()) {\n    // conn fechado automaticamente\n}',
 42),

(43,
 'Como criar uma exceção customizada?',
 'Crie uma classe que estende RuntimeException (para unchecked) ou Exception (para checked). Adicione construtores convenientes. Inclua informações de contexto para diagnóstico. Use exceções customizadas para representar erros de domínio do seu sistema (ex: SaldoInsuficienteException, ProdutoNaoEncontradoException).',
 'MEDIO', 'Exceptions',
 'Estenda RuntimeException ou Exception. Passe mensagem para super().',
 'public class SaldoInsuficienteException extends RuntimeException {\n    private final double saldoAtual;\n    private final double valorSolicitado;\n\n    public SaldoInsuficienteException(double saldo, double valor) {\n        super("Saldo insuficiente. Saldo: " + saldo + ", Solicitado: " + valor);\n        this.saldoAtual = saldo;\n        this.valorSolicitado = valor;\n    }\n}',
 43),

(44,
 'O que é exception chaining (encadeamento de exceções)?',
 'Exception chaining é incluir a exceção original como causa de uma nova exceção, preservando o stack trace completo. Feito passando a exceção original no construtor: new MinhaException("msg", causaOriginal). Acesse com getCause(). Fundamental para não "engolir" exceções e manter rastreabilidade de erros.',
 'DIFICIL', 'Exceptions',
 'Nunca perca o stack trace original. Passe a causa no construtor.',
 '// ERRADO: perde a causa original\ntry {\n    repo.salvar(dados);\n} catch (SQLException e) {\n    throw new ServicoException("Falha ao salvar"); // causa perdida!\n}\n\n// CORRETO: encadeamento\ntry {\n    repo.salvar(dados);\n} catch (SQLException e) {\n    throw new ServicoException("Falha ao salvar", e); // causa preservada\n}',
 44),

(45,
 'O que é multi-catch e quando usar?',
 'Multi-catch (Java 7+) permite capturar múltiplos tipos de exceção em um único catch usando |. Reduz duplicação de código quando o tratamento é idêntico para diferentes exceções. A exceção capturada é implicitamente final. Não use se os tratamentos são diferentes — use catches separados.',
 'FACIL', 'Exceptions',
 'catch (A | B e) quando o tratamento é igual para A e B.',
 '// Antes (verboso)\ntry { } catch (IOException e) { log(e); } catch (SQLException e) { log(e); }\n\n// Multi-catch (Java 7+)\ntry {\n    // operação que pode lançar ambas\n} catch (IOException | SQLException e) {\n    log.error("Erro de I/O ou banco: " + e.getMessage());\n    // e é final implicitamente\n}',
 45),

(46,
 'Quando usar throws vs try-catch?',
 'try-catch: use quando você PODE tratar o erro localmente (ex: retry, fallback, log e continuar). throws: use quando você NÃO pode tratar o erro na camada atual e prefere deixar o chamador decidir. Em geral: Controllers tratam (e retornam erro HTTP). Services lançam exceções de negócio. Repositories relançam como exceções de domínio.',
 'MEDIO', 'Exceptions',
 'Pode tratar aqui? catch. Não pode? throws e deixa o chamador decidir.',
 '// Service: lança, não trata\npublic Produto buscar(Long id) throws ProdutoNaoEncontradoException {\n    return repo.findById(id)\n        .orElseThrow(() -> new ProdutoNaoEncontradoException(id));\n}\n\n// Controller: trata e retorna resposta\npublic ResponseEntity<?> buscar(Long id) {\n    try {\n        return ResponseEntity.ok(service.buscar(id));\n    } catch (ProdutoNaoEncontradoException e) {\n        return ResponseEntity.notFound().build();\n    }\n}',
 46);

-- JVM e PERFORMANCE (6 perguntas)
INSERT INTO interview_questions (id, question, answer, difficulty, category, hint, code_example, order_index) VALUES
(47,
 'O que é o Garbage Collector e como funciona?',
 'Garbage Collector (GC) é responsável por liberar memória de objetos que não têm mais referências alcançáveis. Java usa GC automático (diferente de C/C++). Algoritmos modernos: G1 GC (padrão Java 9+), ZGC, Shenandoah. Processo: Mark (marcar objetos alcançáveis) → Sweep (remover os não marcados) → Compact (compactar memória). Não chame System.gc() explicitamente — é apenas uma sugestão.',
 'DIFICIL', 'JVM',
 'GC libera memória automaticamente de objetos sem referências.',
 '// Objeto elegível para GC quando ninguém aponta para ele\nvoid exemplo() {\n    Pessoa p = new Pessoa("Ana"); // criado no Heap\n    p = null; // sem referência — elegível para GC\n    // ou quando o método termina e p sai de escopo\n}\n\n// NÃO faça isso:\nSystem.gc(); // sugestão, não garantia',
 47),

(48,
 'O que é JVM, JRE e JDK?',
 'JVM (Java Virtual Machine): executa o bytecode Java, fornece portabilidade "write once, run anywhere". JRE (Java Runtime Environment): JVM + bibliotecas padrão (java.lang, java.util, etc.) — necessário para EXECUTAR programas Java. JDK (Java Development Kit): JRE + ferramentas de desenvolvimento (javac, javadoc, debugger) — necessário para DESENVOLVER.',
 'FACIL', 'JVM',
 'JDK > JRE > JVM. Dev usa JDK. Usuário final usa JRE.',
 NULL,
 48),

(49,
 'O que é imutabilidade e por que é importante?',
 'Imutável = objeto que não muda após criação. String é imutável em Java. Benefícios: thread-safe por natureza (sem sincronização), seguro para usar como chave em HashMap, mais fácil de raciocinar sobre o código. Crie classes imutáveis com: todos os campos private final, sem setters, copiar objetos mutáveis no construtor e nos getters.',
 'DIFICIL', 'JVM',
 'Imutável = thread-safe grátis. String, Integer, LocalDate são imutáveis.',
 'public final class Ponto { // final: não pode estender\n    private final int x; // final: não muda\n    private final int y;\n\n    public Ponto(int x, int y) {\n        this.x = x;\n        this.y = y;\n    }\n    // só getters, sem setters\n    // operações retornam novo objeto:\n    public Ponto mover(int dx, int dy) {\n        return new Ponto(x + dx, y + dy);\n    }\n}',
 49),

(50,
 'O que é o ClassLoader?',
 'ClassLoader é responsável por carregar arquivos .class no bytecode para a JVM em runtime. Hierarquia: Bootstrap ClassLoader (JDK core) → Platform ClassLoader → Application ClassLoader (classpath). Carregamento é lazy: classes só são carregadas quando necessário. Base para frameworks como Spring e servidores de aplicação (Tomcat) que carregam classes dinâmicas.',
 'DIFICIL', 'JVM',
 'ClassLoader = quem carrega as classes em memória.',
 '// Ver qual ClassLoader carregou uma classe:\nSystem.out.println(String.class.getClassLoader());  // null = Bootstrap\nSystem.out.println(Main.class.getClassLoader());    // AppClassLoader\n\n// Classes são carregadas uma única vez por ClassLoader\n// Spring usa ClassLoader customizado para hot reload',
 50);
