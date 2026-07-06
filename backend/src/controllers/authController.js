const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

// 1. Entrar direto com o botão do Google
// Usa a variável de ambiente se existir, ou a string fixa de fallback
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "629604508013-83t8kmdlt1gq798k92nrgdtlmm9e2g7t.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
const loginGoogle = async (req, res) => {
  try {
    const { token } = req.body; // Agora recebemos o TOKEN, não mais o e-mail solto
    if (!token) return res.status(400).json({ erro: "Token do Google não fornecido" });
    // Pede ao servidor do Google para atestar que este token é verdadeiro
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    
    // Se o Google confirmou, extraímos o e-mail de dentro do cofre (payload)
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    // Verificamos no nosso banco de dados se esse e-mail é de um funcionário cadastrado
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: "E-mail não autorizado" });
    // Retira a senha da resposta por segurança antes de enviar ao frontend
    const { senha, ...dadosUsuario } = usuario;
    res.status(200).json(dadosUsuario);
    
  } catch (error) {
    console.error("Erro no login via Google:", error);
    res.status(401).json({ erro: "Token de login inválido ou expirado" });
  }
};

// 2. Entrar digitando E-mail e Senha (Formulário Tradicional)
const loginTradicional = async (req, res) => {
  try {
    const { email, senhaDigitada } = req.body;
    if (!email || !senhaDigitada) return res.status(400).json({ erro: "E-mail e senha são obrigatórios" });

    const usuario = await prisma.usuarios.findUnique({ where: { email } });

    // Checa se o usuário existe e se ele realmente tem uma senha salva
    if (!usuario || !usuario.senha) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos (ou senha não cadastrada)" });
    }

    // O Bcrypt compara se a senha digitada bate com o código maluco (hash) salvo no banco
    const senhaValida = await bcrypt.compare(senhaDigitada, usuario.senha);
    if (!senhaValida) return res.status(401).json({ erro: "E-mail ou senha incorretos" });

    const { senha: senhaBanco, ...dadosUsuario } = usuario;
    res.status(200).json(dadosUsuario);

  } catch (error) {
    console.error("Erro no login tradicional:", error);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
};

// 3. Cadastrar a primeira senha (para o Gestor)
const criarSenha = async (req, res) => {
  try {
    const { email, novaSenha } = req.body;
    if (!email || !novaSenha) return res.status(400).json({ erro: "E-mail e nova senha são obrigatórios" });

    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ erro: "E-mail não encontrado no sistema" });

    // Se o gestor já tiver uma senha no banco, não deixa ele criar por cima (medida de segurança)
    if (usuario.senha) return res.status(400).json({ erro: "Este e-mail já possui uma senha cadastrada." });

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

    // Salva a senha embaralhada no banco
    await prisma.usuarios.update({
      where: { email },
      data: { senha: senhaCriptografada }
    });

    res.status(200).json({ mensagem: "Senha criada com sucesso!" });

  } catch (error) {
    console.error("Erro ao criar senha:", error);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
};

module.exports = { loginGoogle, loginTradicional, criarSenha };
