-- ============================================================
-- MODULES
-- ============================================================
INSERT INTO modules (id, title, description, order_index, icon, color) VALUES
(1,  'Sintaxe Java',           'Aprenda a estrutura básica de um programa Java', 1,  '☕', '#58CC02'),
(2,  'Variáveis e Tipos',      'Inteiros, decimais, texto e booleanos',           2,  '📦', '#1CB0F6'),
(3,  'Operadores',             'Operadores aritméticos, lógicos e de comparação', 3,  '⚙️', '#FF9600'),
(4,  'Controle de Fluxo',      'if/else, switch, loops for e while',              4,  '🔀', '#FF4B4B'),
(5,  'Métodos e Funções',      'Declare, chame e retorne valores de métodos',     5,  '🔧', '#CE82FF'),
(6,  'Arrays e Strings',       'Trabalhe com coleções de dados e texto',          6,  '📚', '#FF9600'),
(7,  'Orientação a Objetos',   'Classes, objetos, encapsulamento',                7,  '🏗️', '#58CC02'),
(8,  'Herança e Polimorfismo', 'extends, implements, override',                  8,  '🧬', '#1CB0F6'),
(9,  'Coleções Java',          'ArrayList, HashMap, HashSet',                     9,  '🗂️', '#FF4B4B'),
(10, 'Exceções e Streams',     'try/catch, Streams, Lambda, Optional',            10, '⚡', '#CE82FF');

-- ============================================================
-- LESSONS
-- ============================================================
INSERT INTO lessons (id, module_id, title, description, order_index, xp_reward) VALUES
-- Module 1
(1,  1, 'Olá, Java!',           'Seu primeiro programa Java',             1, 20),
(2,  1, 'Estrutura do Código',  'Pacotes, classes e o método main',       2, 20),
(3,  1, 'Comentários',          'Documente seu código corretamente',      3, 15),
-- Module 2
(4,  2, 'Tipos Primitivos',     'int, double, char, boolean',             1, 20),
(5,  2, 'Variáveis e Escopo',   'Declare e inicialize variáveis',         2, 20),
(6,  2, 'Casting e Conversão',  'Converta entre tipos de dados',          3, 25),
-- Module 3
(7,  3, 'Operadores Básicos',   'Soma, subtração, multiplicação',         1, 20),
(8,  3, 'Operadores Lógicos',   '&&, ||, ! e comparações',               2, 25),
-- Module 4
(9,  4, 'if e else',            'Decisões condicionais',                  1, 25),
(10, 4, 'switch e switch expr.','Múltiplas condições',                    2, 25),
(11, 4, 'Loop for',             'Repita com contadores',                  3, 25),
(12, 4, 'Loop while',           'Repita com condições',                   4, 25),
-- Module 5
(13, 5, 'Declarando Métodos',   'Assinatura, parâmetros e retorno',       1, 30),
(14, 5, 'Sobrecarga',           'Múltiplos métodos com mesmo nome',       2, 30),
(15, 5, 'Recursão',             'Métodos que chamam a si mesmos',         3, 35),
-- Module 6
(16, 6, 'Arrays',               'Arrays unidimensionais e multidim.',     1, 30),
(17, 6, 'Strings',              'Métodos essenciais de String',           2, 30),
(18, 6, 'StringBuilder',        'Construa Strings eficientemente',        3, 30),
-- Module 7
(19, 7, 'Classes e Objetos',    'Defina classes e instancie objetos',     1, 35),
(20, 7, 'Encapsulamento',       'Private, getters e setters',             2, 35),
(21, 7, 'Construtores',         'Inicialize objetos corretamente',        3, 35),
-- Module 8
(22, 8, 'Herança',              'extends e hierarquia de classes',        1, 40),
(23, 8, 'Polimorfismo',         'Override e @Override',                   2, 40),
(24, 8, 'Interfaces',           'interface e implements',                 3, 40),
-- Module 9
(25, 9, 'ArrayList',            'Lista dinâmica de elementos',            1, 40),
(26, 9, 'HashMap',              'Pares chave-valor',                      2, 40),
(27, 9, 'HashSet e Iteração',   'Conjuntos únicos e for-each',            3, 40),
-- Module 10
(28, 10, 'try/catch/finally',   'Tratamento de exceções',                 1, 45),
(29, 10, 'Streams e Lambda',    'Programação funcional em Java',          2, 50),
(30, 10, 'Optional',            'Evite NullPointerException',             3, 50);

-- ============================================================
-- EXERCISES — Module 1: Sintaxe Java
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

-- Lesson 1: Olá, Java!
(1, 'MULTIPLE_CHOICE',
 'Qual é o método principal de um programa Java?',
 'public static void main(String[] args)',
 '["public static void main(String[] args)","public void start()","static main()","void run(String args)"]',
 'O método main é o ponto de entrada de todo programa Java. Ele deve ser public, static, retornar void e receber String[] args.',
 NULL, 1, 15),

(1, 'TRUE_FALSE',
 'Em Java, todo programa precisa ter pelo menos uma classe pública.',
 'true',
 '["true","false"]',
 'Sim! Java é 100% orientado a objetos. Todo código deve estar dentro de uma classe.',
 NULL, 2, 10),

(1, 'FILL_BLANK',
 'Complete: System.out.___("Olá, Mundo!");',
 'println',
 '["println","print","write","output"]',
 'System.out.println() imprime texto e pula uma linha. System.out.print() imprime sem pular linha.',
 NULL, 3, 10),

(1, 'CODE_CHALLENGE',
 'Qual será a saída deste código?',
 'Olá, Java!',
 '["Olá, Java!","Erro de compilação","Olá, Java","null"]',
 'System.out.println imprime o texto e adiciona uma nova linha.',
 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Olá, Java!");\n    }\n}', 4, 15),

-- Lesson 2: Estrutura do Código
(2, 'MULTIPLE_CHOICE',
 'O que é um pacote (package) em Java?',
 'Um agrupamento de classes relacionadas',
 '["Um agrupamento de classes relacionadas","Um tipo de variável","Um método especial","Um arquivo de configuração"]',
 'Pacotes organizam classes relacionadas, evitam conflitos de nomes e controlam o acesso.',
 NULL, 1, 15),

(2, 'FILL_BLANK',
 'Complete: ___ com.empresa.projeto; (declaração de pacote)',
 'package',
 '["package","import","class","module"]',
 'A palavra-chave package declara a qual pacote uma classe pertence.',
 NULL, 2, 10),

(2, 'TRUE_FALSE',
 'O nome do arquivo Java deve ser igual ao nome da classe pública.',
 'true',
 '["true","false"]',
 'O compilador Java exige que o nome do arquivo .java seja idêntico ao nome da classe pública.',
 NULL, 3, 10),

-- Lesson 3: Comentários
(3, 'MULTIPLE_CHOICE',
 'Como se inicia um comentário de múltiplas linhas em Java?',
 '/*',
 '["/*","//","#","<!--"]',
 '/* ... */ é usado para comentários de múltiplas linhas. // é para comentários de linha única.',
 NULL, 1, 10),

(3, 'TRUE_FALSE',
 '// Este é um comentário de linha única em Java.',
 'true',
 '["true","false"]',
 'Correto! // comenta tudo até o fim da linha.',
 NULL, 2, 10);

-- ============================================================
-- EXERCISES — Module 2: Variáveis e Tipos
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

-- Lesson 4: Tipos Primitivos
(4, 'MULTIPLE_CHOICE',
 'Qual tipo primitivo armazena números inteiros em Java?',
 'int',
 '["int","double","String","boolean"]',
 'int armazena inteiros de -2.147.483.648 a 2.147.483.647. String não é primitivo!',
 NULL, 1, 15),

(4, 'MULTIPLE_CHOICE',
 'Qual é o tipo correto para armazenar true ou false?',
 'boolean',
 '["boolean","int","bool","bit"]',
 'boolean armazena apenas dois valores: true ou false. Atenção: em Java é "boolean", não "bool".',
 NULL, 2, 15),

(4, 'FILL_BLANK',
 'Complete: ___ preco = 19.99; (número decimal)',
 'double',
 '["double","float","int","decimal"]',
 'double é o tipo padrão para decimais em Java. float tem menos precisão e requer sufixo f.',
 NULL, 3, 10),

(4, 'TRUE_FALSE',
 'Em Java, String é um tipo primitivo.',
 'false',
 '["true","false"]',
 'String é uma classe, não um tipo primitivo! Os 8 primitivos são: byte, short, int, long, float, double, char, boolean.',
 NULL, 4, 10),

(4, 'CODE_CHALLENGE',
 'Qual é o valor de x após a execução?',
 '10',
 '["10","10.0","erro","5"]',
 'int armazena inteiros. 10 / 2 = 5, mas 5 * 2 = 10.',
 'int x = 10 / 2;\nx = x * 2;', 5, 15),

-- Lesson 5: Variáveis e Escopo
(5, 'MULTIPLE_CHOICE',
 'Como declarar uma constante em Java?',
 'final int VALOR = 10;',
 '["final int VALOR = 10;","const int VALOR = 10;","static VALOR = 10;","int final VALOR = 10;"]',
 'final impede que o valor seja modificado. Por convenção, constantes são escritas em MAIÚSCULAS.',
 NULL, 1, 15),

(5, 'FILL_BLANK',
 'Complete: ___ int numero = 42; (a partir de Java 10, inferência de tipo)',
 'var',
 '["var","auto","let","val"]',
 'var permite que o compilador infira o tipo automaticamente. É uma feature introduzida no Java 10.',
 NULL, 2, 15),

(5, 'TRUE_FALSE',
 'Uma variável local só existe dentro do bloco onde foi declarada.',
 'true',
 '["true","false"]',
 'Correto! Variáveis locais têm escopo limitado ao bloco {} onde foram declaradas.',
 NULL, 3, 10),

-- Lesson 6: Casting
(6, 'MULTIPLE_CHOICE',
 'O que é widening conversion (conversão implícita)?',
 'Converter de um tipo menor para um maior automaticamente',
 '["Converter de um tipo menor para um maior automaticamente","Converter String para int","Perder dados na conversão","Converter double para int"]',
 'Widening converte automaticamente: byte → short → int → long → float → double.',
 NULL, 1, 20),

(6, 'CODE_CHALLENGE',
 'Qual é o resultado de (int) 9.99?',
 '9',
 '["9","10","9.99","erro"]',
 'O casting (int) trunca o decimal, não arredonda. 9.99 vira 9.',
 'double d = 9.99;\nint x = (int) d;', 2, 15);

-- ============================================================
-- EXERCISES — Module 3: Operadores
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

-- Lesson 7: Operadores Básicos
(7, 'CODE_CHALLENGE',
 'Qual é o resultado de 17 % 5?',
 '2',
 '["2","3","4","1"]',
 '% é o operador módulo (resto da divisão). 17 ÷ 5 = 3 com resto 2.',
 'int resultado = 17 % 5;', 1, 15),

(7, 'MULTIPLE_CHOICE',
 'O que faz o operador ++ em Java?',
 'Incrementa o valor em 1',
 '["Incrementa o valor em 1","Multiplica por 2","Concatena strings","Declara variável"]',
 '++ incrementa a variável em 1. i++ é pós-incremento, ++i é pré-incremento.',
 NULL, 2, 15),

(7, 'FILL_BLANK',
 'Complete: int soma = 5 ___ 3; // resultado: 8',
 '+',
 '["+","-","*","/"]',
 '+ é o operador de adição. Também concatena Strings.',
 NULL, 3, 10),

-- Lesson 8: Operadores Lógicos
(8, 'MULTIPLE_CHOICE',
 'O que retorna (true && false)?',
 'false',
 '["false","true","null","erro"]',
 '&& (AND) retorna true somente se AMBOS os lados forem true.',
 NULL, 1, 15),

(8, 'MULTIPLE_CHOICE',
 'O que retorna (false || true)?',
 'true',
 '["true","false","null","erro"]',
 '|| (OR) retorna true se PELO MENOS UM lado for true.',
 NULL, 2, 15),

(8, 'TRUE_FALSE',
 '!true retorna false em Java.',
 'true',
 '["true","false"]',
 'O operador ! (NOT) inverte o valor booleano. !true = false, !false = true.',
 NULL, 3, 10),

(8, 'CODE_CHALLENGE',
 'Qual é o resultado desta expressão?',
 'true',
 '["true","false","erro","null"]',
 '10 > 5 é true. true && true = true.',
 'boolean resultado = (10 > 5) && (3 < 7);', 4, 20);

-- ============================================================
-- EXERCISES — Module 4: Controle de Fluxo
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

-- Lesson 9: if/else
(9, 'CODE_CHALLENGE',
 'O que será impresso?',
 'Maior de idade',
 '["Maior de idade","Menor de idade","Nada","Erro"]',
 '18 >= 18 é true, então o bloco if é executado.',
 'int idade = 18;\nif (idade >= 18) {\n    System.out.println("Maior de idade");\n} else {\n    System.out.println("Menor de idade");\n}', 1, 20),

(9, 'FILL_BLANK',
 'Complete: if (nota >= 7) { ... } ___ if (nota >= 5) { ... } else { ... }',
 'else',
 '["else","elif","otherwise","or"]',
 'else if encadeia múltiplas condições. Em Java é "else if", não "elif" como em Python.',
 NULL, 2, 15),

(9, 'MULTIPLE_CHOICE',
 'O operador ternário é uma versão compacta de:',
 'if/else',
 '["if/else","for loop","while loop","switch"]',
 'condição ? valorSeVerdadeiro : valorSeFalso é equivalente a um if/else simples.',
 NULL, 3, 15),

-- Lesson 10: switch
(10, 'MULTIPLE_CHOICE',
 'O que acontece se esquecer o break no switch?',
 'A execução continua para o próximo case (fall-through)',
 '["A execução continua para o próximo case (fall-through)","O programa encerra","Erro de compilação","O switch reinicia"]',
 'Sem break, o switch continua executando os cases seguintes. Isso se chama fall-through.',
 NULL, 1, 20),

(10, 'CODE_CHALLENGE',
 'O que será impresso?',
 'Dois',
 '["Dois","Um","Três","Nada"]',
 'O valor 2 corresponde ao case 2, que imprime "Dois".',
 'int x = 2;\nswitch (x) {\n    case 1: System.out.println("Um"); break;\n    case 2: System.out.println("Dois"); break;\n    default: System.out.println("Outro");\n}', 2, 20),

-- Lesson 11: Loop for
(11, 'CODE_CHALLENGE',
 'Quantas vezes "Java" será impresso?',
 '5',
 '["5","4","6","infinito"]',
 'O loop vai de i=0 até i<5, ou seja, 5 iterações (0,1,2,3,4).',
 'for (int i = 0; i < 5; i++) {\n    System.out.println("Java");\n}', 1, 20),

(11, 'MULTIPLE_CHOICE',
 'Qual é a estrutura correta do for?',
 'for (inicialização; condição; incremento)',
 '["for (inicialização; condição; incremento)","for (condição; incremento; inicialização)","for (condição)","for i in range"]',
 'O for tem 3 partes: inicialização, condição de continuação e incremento/decremento.',
 NULL, 2, 15),

(11, 'FILL_BLANK',
 'Para percorrer um array com for-each: for (int n ___ numeros)',
 ':',
 '[":","in","of","->"]',
 'O for-each usa : para iterar. Exemplo: for (int n : array) { ... }',
 NULL, 3, 10),

-- Lesson 12: while
(12, 'TRUE_FALSE',
 'Um loop do-while sempre executa o bloco pelo menos uma vez.',
 'true',
 '["true","false"]',
 'O do-while executa o bloco ANTES de verificar a condição, garantindo pelo menos uma execução.',
 NULL, 1, 15),

(12, 'MULTIPLE_CHOICE',
 'O que faz o comando break em um loop?',
 'Sai imediatamente do loop',
 '["Sai imediatamente do loop","Pula para a próxima iteração","Pausa o loop","Reinicia o loop"]',
 'break encerra o loop imediatamente. continue pula para a próxima iteração.',
 NULL, 2, 15),

(12, 'CODE_CHALLENGE',
 'Qual é o valor de soma após a execução?',
 '10',
 '["10","15","4","5"]',
 '0+1+2+3+4 = 10',
 'int soma = 0;\nint i = 0;\nwhile (i < 5) {\n    soma += i;\n    i++;\n}', 3, 20);

-- ============================================================
-- EXERCISES — Module 5: Métodos
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

-- Lesson 13: Declarando Métodos
(13, 'MULTIPLE_CHOICE',
 'O que significa void no retorno de um método?',
 'O método não retorna nenhum valor',
 '["O método não retorna nenhum valor","O método retorna null","O método retorna 0","Erro de tipo"]',
 'void indica que o método não retorna valor. Use return; para sair antecipadamente.',
 NULL, 1, 20),

(13, 'CODE_CHALLENGE',
 'O que será impresso?',
 '15',
 '["15","5","10","Erro"]',
 'O método soma recebe 5 e 10, retorna 15, que é impresso.',
 'public static int soma(int a, int b) {\n    return a + b;\n}\n// chamada:\nSystem.out.println(soma(5, 10));', 2, 25),

(13, 'FILL_BLANK',
 'Para chamar um método que está na mesma classe, escreva: ___ soma(5, 3);',
 'int resultado =',
 '["int resultado =","void","return","call"]',
 'Para capturar o retorno de um método, declare uma variável do mesmo tipo.',
 NULL, 3, 15),

-- Lesson 14: Sobrecarga
(14, 'TRUE_FALSE',
 'Sobrecarga de método (overloading) é quando dois métodos têm o mesmo nome mas parâmetros diferentes.',
 'true',
 '["true","false"]',
 'Overloading permite múltiplos métodos com o mesmo nome, diferenciados pelos parâmetros.',
 NULL, 1, 20),

(14, 'MULTIPLE_CHOICE',
 'O que diferencia métodos sobrecarregados?',
 'Número ou tipo de parâmetros',
 '["Número ou tipo de parâmetros","Apenas o tipo de retorno","O nome da variável","O modificador de acesso"]',
 'O tipo de retorno sozinho NÃO diferencia métodos sobrecarregados.',
 NULL, 2, 20),

-- Lesson 15: Recursão
(15, 'CODE_CHALLENGE',
 'O que retorna fatorial(3)?',
 '6',
 '["6","3","9","infinito"]',
 '3! = 3 × 2 × 1 = 6. Recursão: fatorial(3) = 3 * fatorial(2) = 3 * 2 = 6.',
 'int fatorial(int n) {\n    if (n <= 1) return 1;\n    return n * fatorial(n - 1);\n}', 1, 30),

(15, 'TRUE_FALSE',
 'Todo método recursivo precisa de um caso base para evitar recursão infinita.',
 'true',
 '["true","false"]',
 'O caso base é a condição de parada. Sem ele, a recursão causaria StackOverflowError.',
 NULL, 2, 20);

-- ============================================================
-- EXERCISES — Module 6: Arrays e Strings
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

(16, 'MULTIPLE_CHOICE',
 'Como declarar um array de inteiros com 5 elementos?',
 'int[] nums = new int[5];',
 '["int[] nums = new int[5];","int nums[5];","array<int> nums = new array(5);","int nums = new int[5];"]',
 'Arrays em Java são declarados com [] após o tipo e inicializados com new tipo[tamanho].',
 NULL, 1, 20),

(16, 'CODE_CHALLENGE',
 'Qual é o índice do último elemento de um array com 5 elementos?',
 '4',
 '["4","5","3","0"]',
 'Arrays são indexados de 0 a length-1. Um array de 5 elementos tem índices 0,1,2,3,4.',
 'int[] arr = {10, 20, 30, 40, 50};\n// arr[4] = 50 (último)', 2, 15),

(17, 'MULTIPLE_CHOICE',
 'Qual método retorna o tamanho de uma String?',
 'length()',
 '["length()","size()","count()","len()"]',
 'String.length() retorna o número de caracteres. Arrays usam .length (sem parênteses).',
 NULL, 1, 20),

(17, 'CODE_CHALLENGE',
 'Qual é a saída?',
 'JAVA',
 '["JAVA","java","Java","jAVA"]',
 'toUpperCase() converte todos os caracteres para maiúsculas.',
 'String s = "java";\nSystem.out.println(s.toUpperCase());', 2, 20),

(17, 'FILL_BLANK',
 'Para verificar se "hello" começa com "he": "hello".___(\"he\")',
 'startsWith',
 '["startsWith","beginsWith","startWith","contains"]',
 'startsWith() verifica o prefixo de uma String. endsWith() verifica o sufixo.',
 NULL, 3, 15),

(18, 'TRUE_FALSE',
 'StringBuilder é mais eficiente que String para concatenações em loop.',
 'true',
 '["true","false"]',
 'String cria um novo objeto a cada concatenação. StringBuilder modifica o mesmo objeto, sendo muito mais eficiente.',
 NULL, 1, 20),

(18, 'CODE_CHALLENGE',
 'O que será impresso?',
 'Java é incrível!',
 '["Java é incrível!","Java","é incrível!","Erro"]',
 'append() adiciona ao final. toString() converte para String.',
 'StringBuilder sb = new StringBuilder();\nsb.append("Java").append(" é ").append("incrível!");\nSystem.out.println(sb.toString());', 2, 25);

-- ============================================================
-- EXERCISES — Module 7: OOP
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

(19, 'MULTIPLE_CHOICE',
 'O que é uma classe em Java?',
 'Um modelo/template para criar objetos',
 '["Um modelo/template para criar objetos","Um método especial","Um tipo primitivo","Um arquivo de configuração"]',
 'Classes definem atributos e comportamentos. Objetos são instâncias de classes.',
 NULL, 1, 20),

(19, 'FILL_BLANK',
 'Para criar um objeto Carro: Carro meuCarro = ___ Carro();',
 'new',
 '["new","create","make","instantiate"]',
 'A palavra-chave new cria uma nova instância (objeto) da classe.',
 NULL, 2, 15),

(20, 'MULTIPLE_CHOICE',
 'O que é encapsulamento?',
 'Ocultar detalhes internos e expor apenas o necessário',
 '["Ocultar detalhes internos e expor apenas o necessário","Herdar de outra classe","Implementar interfaces","Criar múltiplos construtores"]',
 'Encapsulamento usa private para atributos e public para getters/setters controlando o acesso.',
 NULL, 1, 25),

(20, 'TRUE_FALSE',
 'Um atributo private só pode ser acessado de dentro da própria classe.',
 'true',
 '["true","false"]',
 'private é o nível mais restrito. Use getters e setters para acesso externo controlado.',
 NULL, 2, 20),

(21, 'CODE_CHALLENGE',
 'Qual é a saída?',
 'Olá, Ana!',
 '["Olá, Ana!","Olá, !","Erro","null"]',
 'O construtor inicializa nome com "Ana". O método cumprimentar usa this.nome.',
 'class Pessoa {\n    String nome;\n    Pessoa(String nome) { this.nome = nome; }\n    void cumprimentar() {\n        System.out.println("Olá, " + nome + "!");\n    }\n}\nnew Pessoa("Ana").cumprimentar();', 1, 30),

(21, 'MULTIPLE_CHOICE',
 'O que é this em Java?',
 'Referência ao objeto atual',
 '["Referência ao objeto atual","O construtor da classe","Um método estático","Uma palavra reservada sem função"]',
 'this refere-se ao objeto corrente. Útil para diferenciar atributos de parâmetros com o mesmo nome.',
 NULL, 2, 20);

-- ============================================================
-- EXERCISES — Module 8: Herança e Polimorfismo
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

(22, 'FILL_BLANK',
 'Para uma classe Cachorro herdar de Animal: class Cachorro ___ Animal',
 'extends',
 '["extends","implements","inherits","is-a"]',
 'extends é a palavra-chave para herança em Java. Uma classe pode estender apenas UMA classe.',
 NULL, 1, 25),

(22, 'TRUE_FALSE',
 'Java suporta herança múltipla de classes.',
 'false',
 '["true","false"]',
 'Java não permite herança múltipla de classes. Uma classe pode implementar múltiplas interfaces.',
 NULL, 2, 20),

(23, 'MULTIPLE_CHOICE',
 'O que é @Override?',
 'Anotação que indica que um método redefine o método da superclasse',
 '["Anotação que indica que um método redefine o método da superclasse","Cria um novo método","Remove o método pai","Torna o método privado"]',
 '@Override não é obrigatório mas ajuda o compilador a verificar se está realmente sobrescrevendo.',
 NULL, 1, 25),

(23, 'CODE_CHALLENGE',
 'O que será impresso?',
 'Au au!',
 '["Au au!","Animal fala","Erro","Silêncio"]',
 'Cachorro sobrescreve falar(). Como meuAnimal é Cachorro, o método de Cachorro é chamado (polimorfismo).',
 'class Animal { void falar() { System.out.println("..."); } }\nclass Cachorro extends Animal {\n    @Override void falar() { System.out.println("Au au!"); }\n}\nAnimal meuAnimal = new Cachorro();\nmeuAnimal.falar();', 2, 30),

(24, 'MULTIPLE_CHOICE',
 'Qual é a diferença entre interface e classe abstrata?',
 'Interface não tem implementação (até Java 7), classe abstrata pode ter',
 '["Interface não tem implementação (até Java 7), classe abstrata pode ter","São iguais","Interface usa extends","Classe abstrata usa implements"]',
 'Interfaces definem contratos. Classes abstratas podem ter implementação parcial e construtores.',
 NULL, 1, 30),

(24, 'FILL_BLANK',
 'Para uma classe implementar uma interface: class Pato ___ Voador',
 'implements',
 '["implements","extends","uses","applies"]',
 'implements é usado para interfaces. Uma classe pode implementar múltiplas interfaces.',
 NULL, 2, 20);

-- ============================================================
-- EXERCISES — Module 9: Coleções
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

(25, 'MULTIPLE_CHOICE',
 'Como adicionar um elemento a um ArrayList?',
 'lista.add(elemento)',
 '["lista.add(elemento)","lista.insert(elemento)","lista.push(elemento)","lista.append(elemento)"]',
 'ArrayList usa add() para inserir, remove() para remover e get(i) para acessar.',
 NULL, 1, 25),

(25, 'CODE_CHALLENGE',
 'Qual é a saída?',
 '3',
 '["3","2","4","0"]',
 'size() retorna o número de elementos. A lista tem [Java, Python, C++], então 3.',
 'List<String> linguagens = new ArrayList<>();\nlinguagens.add("Java");\nlinguagens.add("Python");\nlinguagens.add("C++");\nSystem.out.println(linguagens.size());', 2, 25),

(26, 'MULTIPLE_CHOICE',
 'Como obter o valor de uma chave em um HashMap?',
 'mapa.get(chave)',
 '["mapa.get(chave)","mapa.value(chave)","mapa[chave]","mapa.fetch(chave)"]',
 'HashMap usa get(chave) para buscar, put(chave, valor) para inserir.',
 NULL, 1, 25),

(26, 'TRUE_FALSE',
 'Um HashMap pode ter chaves duplicadas.',
 'false',
 '["true","false"]',
 'Chaves em HashMap são únicas. Se inserir a mesma chave, o valor anterior é sobrescrito.',
 NULL, 2, 20),

(27, 'MULTIPLE_CHOICE',
 'O que garante um HashSet?',
 'Elementos únicos sem ordem definida',
 '["Elementos únicos sem ordem definida","Elementos ordenados","Permite duplicatas","É igual ao ArrayList"]',
 'HashSet não permite duplicatas e não garante ordem. Use LinkedHashSet para manter ordem de inserção.',
 NULL, 1, 25),

(27, 'CODE_CHALLENGE',
 'Quantos elementos terá o HashSet?',
 '3',
 '["3","5","4","2"]',
 'HashSet elimina duplicatas. "Java" aparece 3 vezes mas conta como 1.',
 'Set<String> set = new HashSet<>();\nset.add("Java");\nset.add("Python");\nset.add("Java");\nset.add("C++");\nset.add("Java");\nSystem.out.println(set.size());', 2, 30);

-- ============================================================
-- EXERCISES — Module 10: Exceções e Streams
-- ============================================================
INSERT INTO exercises (lesson_id, type, question_text, correct_answer, options_json, explanation, code_snippet, order_index, xp_reward) VALUES

(28, 'MULTIPLE_CHOICE',
 'O que é uma exceção em Java?',
 'Um evento que interrompe o fluxo normal do programa',
 '["Um evento que interrompe o fluxo normal do programa","Um tipo de variável","Um método especial","Um comentário de erro"]',
 'Exceções são eventos inesperados. Checked exceptions devem ser tratadas, unchecked são opcionais.',
 NULL, 1, 25),

(28, 'FILL_BLANK',
 'Complete: try { ... } ___ (Exception e) { ... } finally { ... }',
 'catch',
 '["catch","except","error","handle"]',
 'catch captura a exceção. finally sempre executa, independente de exceção.',
 NULL, 2, 20),

(28, 'CODE_CHALLENGE',
 'O que será impresso?',
 'Erro: / by zero',
 '["Erro: / by zero","0","Erro desconhecido","O programa termina"]',
 'ArithmeticException é lançada ao dividir por zero. O catch captura e imprime a mensagem.',
 'try {\n    int x = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println("Erro: " + e.getMessage());\n}', 3, 30),

(29, 'MULTIPLE_CHOICE',
 'O que faz o método filter() em Streams?',
 'Seleciona elementos que atendem a um predicado',
 '["Seleciona elementos que atendem a um predicado","Transforma cada elemento","Reduz a um valor único","Ordena os elementos"]',
 'filter(predicate) mantém apenas elementos onde o predicado retorna true.',
 NULL, 1, 30),

(29, 'CODE_CHALLENGE',
 'Qual é o resultado?',
 '3',
 '["3","5","2","4"]',
 'filter(n > 2) mantém [3, 4, 5]. count() conta 3 elementos.',
 'List<Integer> nums = List.of(1, 2, 3, 4, 5);\nlong count = nums.stream()\n    .filter(n -> n > 2)\n    .count();\nSystem.out.println(count);', 2, 35),

(29, 'FILL_BLANK',
 'Para transformar cada elemento: stream.___(x -> x * 2)',
 'map',
 '["map","transform","convert","apply"]',
 'map() aplica uma função a cada elemento, retornando um novo Stream transformado.',
 NULL, 3, 25),

(30, 'MULTIPLE_CHOICE',
 'Qual método de Optional lança exceção se o valor for null?',
 'get()',
 '["get()","orElse()","orElseGet()","ifPresent()"]',
 'get() lança NoSuchElementException se vazio. Prefira orElse() ou orElseThrow().',
 NULL, 1, 30),

(30, 'CODE_CHALLENGE',
 'O que será impresso?',
 'Padrão',
 '["Padrão","null","Erro","vazio"]',
 'Optional.empty() está vazio. orElse("Padrão") retorna "Padrão" quando vazio.',
 'Optional<String> opt = Optional.empty();\nSystem.out.println(opt.orElse("Padrão"));', 2, 30),

(30, 'TRUE_FALSE',
 'Optional.of(null) lança NullPointerException.',
 'true',
 '["true","false"]',
 'Optional.of() não aceita null. Use Optional.ofNullable() quando o valor pode ser null.',
 NULL, 3, 25);

-- ============================================================
-- EXAMS
-- ============================================================
INSERT INTO exams (id, title, description, passing_score, time_limit_minutes, order_index, icon) VALUES
(1, 'Prova 1: Sintaxe e Variáveis',    'Avalie seus conhecimentos dos Módulos 1 e 2',       70, 20, 1, '📝'),
(2, 'Prova 2: Operadores e Fluxo',     'Teste seus conhecimentos sobre Módulos 3 e 4',      70, 25, 2, '⚙️'),
(3, 'Prova 3: Métodos e Strings',      'Avaliação sobre Módulos 5 e 6',                     70, 25, 3, '🔧'),
(4, 'Prova 4: Orientação a Objetos',   'Teste completo de OOP — Módulos 7 e 8',             70, 30, 4, '🏗️'),
(5, 'Prova Final Java',                'Avaliação geral — todos os módulos',                80, 45, 5, '🎓');

-- ============================================================
-- EXAM QUESTIONS
-- ============================================================
INSERT INTO exam_questions (id, exam_id, question_text, type, options_json, correct_answer, explanation, code_snippet, order_index) VALUES

-- Prova 1: Sintaxe e Variáveis
(1,  1, 'Qual modificador torna uma variável imutável em Java?', 'MULTIPLE_CHOICE',
 '["final","static","const","immutable"]', 'final',
 'final impede reatribuição. const não existe em Java.', NULL, 1),
(2,  1, 'Java é sensível a maiúsculas e minúsculas (case-sensitive)?', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'Java diferencia minúsculas e maiúsculas. minhaVar e MinhaVar são variáveis diferentes.', NULL, 2),
(3,  1, 'Qual tipo primitivo armazena valores true/false?', 'MULTIPLE_CHOICE',
 '["boolean","bit","bool","logical"]', 'boolean',
 'Em Java o tipo para valores lógicos é boolean (não bool como em C/C++).', NULL, 3),
(4,  1, 'O que será impresso?', 'MULTIPLE_CHOICE',
 '["30","20","10","Erro"]', '30',
 'int x = 10, y = 20: x + y = 30.',
 'int x = 10;\nint y = 20;\nSystem.out.println(x + y);', 4),
(5,  1, 'Qual é o tamanho em bits de um int em Java?', 'MULTIPLE_CHOICE',
 '["32","16","64","8"]', '32',
 'int ocupa 32 bits (4 bytes) e suporta -2.147.483.648 a 2.147.483.647.', NULL, 5),
(6,  1, 'float tem mais precisão que double em Java.', 'TRUE_FALSE',
 '["true","false"]', 'false',
 'double tem precisão dupla (64 bits) enquanto float tem 32 bits.', NULL, 6),
(7,  1, 'Qual palavra-chave declara um pacote em Java?', 'MULTIPLE_CHOICE',
 '["package","import","namespace","module"]', 'package',
 'package declara o pacote de uma classe. import traz classes de outros pacotes.', NULL, 7),
(8,  1, 'Uma variável local é declarada:', 'MULTIPLE_CHOICE',
 '["Dentro de um método ou bloco","Como atributo da classe","Com o modificador local","No topo do arquivo"]', 'Dentro de um método ou bloco',
 'Variáveis locais existem somente dentro do bloco {} onde foram declaradas.', NULL, 8),
(9,  1, 'var pode ser usado para inferência de tipo a partir do Java 10.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'var foi introduzido no Java 10 para inferência de tipo em variáveis locais.', NULL, 9),
(10, 1, 'Qual o valor de (int) 7.9?', 'MULTIPLE_CHOICE',
 '["7","8","7.9","Erro"]', '7',
 'O cast (int) trunca o decimal (não arredonda). 7.9 vira 7.', NULL, 10),

-- Prova 2: Operadores e Fluxo
(11, 2, 'O que faz o operador % em Java?', 'MULTIPLE_CHOICE',
 '["Resto da divisão","Porcentagem","Divisão inteira","Módulo lógico"]', 'Resto da divisão',
 '% retorna o resto de uma divisão inteira. Ex: 10 % 3 = 1.', NULL, 1),
(12, 2, 'O que será impresso?', 'MULTIPLE_CHOICE',
 '["Par","Ímpar","0","Erro"]', 'Par',
 '10 % 2 == 0, então entra no if e imprime "Par".',
 'int n = 10;\nif (n % 2 == 0) {\n    System.out.println("Par");\n} else {\n    System.out.println("Ímpar");\n}', 2),
(13, 2, '&& retorna true quando ambos os operandos são true.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 '&& (AND lógico) só retorna true se AMBOS os lados forem true.', NULL, 3),
(14, 2, 'Qual é o resultado de !false?', 'MULTIPLE_CHOICE',
 '["true","false","null","0"]', 'true',
 '! (NOT) inverte o booleano. !false = true.', NULL, 4),
(15, 2, 'O que acontece se omitir break em um case do switch?', 'MULTIPLE_CHOICE',
 '["Execução continua para o próximo case","Erro de compilação","O switch encerra","Executa o default"]', 'Execução continua para o próximo case',
 'Sem break ocorre fall-through: execução continua nos cases seguintes.', NULL, 5),
(16, 2, 'Um loop do-while garante pelo menos uma execução.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'do-while executa o bloco ANTES de verificar a condição.', NULL, 6),
(17, 2, 'Quantas vezes este loop executa?', 'MULTIPLE_CHOICE',
 '["3","4","5","2"]', '3',
 'i vai de 0 a 2 (i < 3), executando 3 vezes.',
 'for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}', 7),
(18, 2, 'O que faz o comando continue dentro de um loop?', 'MULTIPLE_CHOICE',
 '["Pula para a próxima iteração","Encerra o loop","Reinicia o loop","Pausa a execução"]', 'Pula para a próxima iteração',
 'continue pula o restante do bloco e vai para a próxima iteração. break encerra o loop.', NULL, 8),
(19, 2, 'O operador ternário (? :) é uma versão compacta de if/else.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'condição ? valorVerdadeiro : valorFalso substitui if/else de uma expressão simples.', NULL, 9),
(20, 2, 'Qual é o resultado de (5 > 3) || (2 > 10)?', 'MULTIPLE_CHOICE',
 '["true","false","null","Erro"]', 'true',
 '|| retorna true se PELO MENOS UM lado for true. 5 > 3 é true.', NULL, 10),

-- Prova 3: Métodos e Strings
(21, 3, 'O que significa void no retorno de um método?', 'MULTIPLE_CHOICE',
 '["O método não retorna valor","Retorna null","Retorna 0","É um tipo primitivo"]', 'O método não retorna valor',
 'void indica que o método não tem retorno.', NULL, 1),
(22, 3, 'Sobrecarga (overloading) permite métodos com o mesmo nome mas parâmetros diferentes.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'Overloading diferencia métodos pelo número e tipo dos parâmetros, não pelo retorno.', NULL, 2),
(23, 3, 'O que retorna este método com soma(3, 5)?', 'MULTIPLE_CHOICE',
 '["8","3","5","Erro"]', '8',
 'O método retorna a + b = 3 + 5 = 8.',
 'static int soma(int a, int b) { return a + b; }', 3),
(24, 3, 'Todo método recursivo precisa de um caso base.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'Sem caso base, a recursão seria infinita e causaria StackOverflowError.', NULL, 4),
(25, 3, 'Qual método retorna o tamanho de uma String?', 'MULTIPLE_CHOICE',
 '["length()","size()","count()","len()"]', 'length()',
 'String.length() retorna o número de caracteres. Arrays usam .length sem parênteses.', NULL, 5),
(26, 3, 'Como declarar um array de 3 inteiros?', 'MULTIPLE_CHOICE',
 '["int[] arr = new int[3];","int arr[3];","array<int>(3);","int arr = {3};"]', 'int[] arr = new int[3];',
 'A sintaxe correta usa [] após o tipo e new tipo[tamanho].', NULL, 6),
(27, 3, 'O índice do primeiro elemento de um array é sempre 1.', 'TRUE_FALSE',
 '["true","false"]', 'false',
 'Arrays em Java são indexados a partir de 0, não 1.', NULL, 7),
(28, 3, 'O que imprime o código?', 'MULTIPLE_CHOICE',
 '["HELLO","hello","Hello","Erro"]', 'HELLO',
 'toUpperCase() converte todos os caracteres para maiúsculas.',
 'String s = "hello";\nSystem.out.println(s.toUpperCase());', 8),
(29, 3, 'StringBuilder é mais eficiente que String para concatenações repetidas.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'String cria um novo objeto a cada concatenação. StringBuilder modifica o mesmo objeto.', NULL, 9),
(30, 3, 'Qual método de ArrayList remove um elemento pela posição?', 'MULTIPLE_CHOICE',
 '["remove(int index)","delete(index)","erase(index)","pop(index)"]', 'remove(int index)',
 'ArrayList.remove(index) remove por posição. remove(Object o) remove por valor.', NULL, 10),

-- Prova 4: Orientação a Objetos
(31, 4, 'O que é encapsulamento em Java?', 'MULTIPLE_CHOICE',
 '["Proteger atributos com private e expor via getters/setters","Herdar de outra classe","Implementar interfaces","Criar construtores"]', 'Proteger atributos com private e expor via getters/setters',
 'Encapsulamento oculta detalhes internos da classe protegendo a integridade dos dados.', NULL, 1),
(32, 4, 'A palavra-chave extends é usada para implementar interfaces.', 'TRUE_FALSE',
 '["true","false"]', 'false',
 'extends herda de classes. implements é para interfaces.', NULL, 2),
(33, 4, 'O que é this em Java?', 'MULTIPLE_CHOICE',
 '["Referência ao objeto atual","O construtor","Um método estático","Referência à superclasse"]', 'Referência ao objeto atual',
 'this refere ao objeto corrente. Útil para diferenciar atributos de parâmetros.', NULL, 3),
(34, 4, 'O que será impresso?', 'MULTIPLE_CHOICE',
 '["Au au!","Animal fala","Erro","Nada"]', 'Au au!',
 'Cachorro sobrescreve falar(). Polimorfismo chama o método do objeto real.',
 'class Animal { void falar() { System.out.println("..."); } }\nclass Cachorro extends Animal {\n    void falar() { System.out.println("Au au!"); }\n}\nAnimal a = new Cachorro();\na.falar();', 4),
(35, 4, 'Java suporta herança múltipla de classes.', 'TRUE_FALSE',
 '["true","false"]', 'false',
 'Java não permite herança múltipla de classes. Uma classe pode implementar múltiplas interfaces.', NULL, 5),
(36, 4, '@Override indica que um método sobrescreve o da superclasse.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 '@Override ajuda o compilador a verificar se o método realmente sobrescreve um da superclasse.', NULL, 6),
(37, 4, 'Para uma classe implementar uma interface usa-se:', 'MULTIPLE_CHOICE',
 '["implements","extends","uses","inherits"]', 'implements',
 'implements é para interfaces. Uma classe pode implementar múltiplas interfaces.', NULL, 7),
(38, 4, 'O que é polimorfismo?', 'MULTIPLE_CHOICE',
 '["Objetos de tipos diferentes respondendo ao mesmo método de forma diferente","Criar múltiplos construtores","Ocultar atributos","Herdar de duas classes"]', 'Objetos de tipos diferentes respondendo ao mesmo método de forma diferente',
 'Polimorfismo permite tratar objetos de subclasses como objetos da superclasse.', NULL, 8),
(39, 4, 'Uma classe abstrata pode ser instanciada diretamente com new.', 'TRUE_FALSE',
 '["true","false"]', 'false',
 'Classes abstratas não podem ser instanciadas. São usadas como base para subclasses.', NULL, 9),
(40, 4, 'private é o modificador de acesso mais restrito em Java.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'private limita o acesso apenas à própria classe. protected permite acesso em subclasses.', NULL, 10),

-- Prova Final
(41, 5, 'O que é uma exceção verificada (checked exception)?', 'MULTIPLE_CHOICE',
 '["Exceção que DEVE ser tratada ou declarada","Exceção que pode ser ignorada","Erro de execução","Exceção de null"]', 'Exceção que DEVE ser tratada ou declarada',
 'Checked exceptions extendem Exception e obrigam tratamento com try/catch ou throws.', NULL, 1),
(42, 5, 'O que faz stream.filter()?', 'MULTIPLE_CHOICE',
 '["Seleciona elementos que satisfazem um predicado","Transforma cada elemento","Conta os elementos","Ordena os elementos"]', 'Seleciona elementos que satisfazem um predicado',
 'filter() mantém apenas elementos onde o predicado retorna true.', NULL, 2),
(43, 5, 'Optional.of(null) lança NullPointerException.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'Use Optional.ofNullable() quando o valor pode ser null.', NULL, 3),
(44, 5, 'HashMap permite chaves duplicadas.', 'TRUE_FALSE',
 '["true","false"]', 'false',
 'Chaves em HashMap são únicas. Inserir a mesma chave sobrescreve o valor anterior.', NULL, 4),
(45, 5, 'O que imprime o código?', 'MULTIPLE_CHOICE',
 '["Erro: / by zero","0","10","Programa termina"]', 'Erro: / by zero',
 'ArithmeticException é lançada ao dividir por zero. catch captura e imprime a mensagem.',
 'try {\n    System.out.println(10 / 0);\n} catch (ArithmeticException e) {\n    System.out.println("Erro: " + e.getMessage());\n}', 5),
(46, 5, 'Qual estrutura garante elementos únicos?', 'MULTIPLE_CHOICE',
 '["HashSet","ArrayList","HashMap","LinkedList"]', 'HashSet',
 'HashSet não permite duplicatas. ArrayList e LinkedList permitem.', NULL, 6),
(47, 5, 'O operador lambda -> foi introduzido no Java 8.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'Java 8 introduziu Streams, Lambdas, Optional e muito mais.', NULL, 7),
(48, 5, 'Qual método de String verifica se começa com um prefixo?', 'MULTIPLE_CHOICE',
 '["startsWith()","beginsWith()","hasPrefix()","startsAt()"]', 'startsWith()',
 'String.startsWith(prefix) retorna true se a string começa com o prefixo especificado.', NULL, 8),
(49, 5, 'O bloco finally em try/catch/finally sempre executa.', 'TRUE_FALSE',
 '["true","false"]', 'true',
 'O bloco finally executa sempre, independente de exceção. Ideal para fechar recursos.', NULL, 9),
(50, 5, 'O que é um construtor padrão (default constructor)?', 'MULTIPLE_CHOICE',
 '["Construtor sem parâmetros gerado automaticamente","O primeiro construtor da classe","Um construtor static","Um método init()"]', 'Construtor sem parâmetros gerado automaticamente',
 'Se nenhum construtor for definido, Java gera automaticamente um construtor sem parâmetros.', NULL, 10);
