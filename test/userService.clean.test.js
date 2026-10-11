const { UserService } = require('../src/userService');

const dadosUsuarioComum = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

const dadosUsuarioAdmin = {
  nome: 'Admin',
  email: 'admin@teste.com',
  idade: 40,
};

describe('UserService', () => {
  let userService;

  const criarUsuarioComum = () =>
    userService.createUser(
      dadosUsuarioComum.nome,
      dadosUsuarioComum.email,
      dadosUsuarioComum.idade
    );

  const criarUsuarioAdmin = () =>
    userService.createUser(
      dadosUsuarioAdmin.nome,
      dadosUsuarioAdmin.email,
      dadosUsuarioAdmin.idade,
      true
    );

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('retorna o usuário com os dados informados e status ativo', () => {
      // Arrange
      const { nome, email, idade } = dadosUsuarioComum;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario).toMatchObject({ nome, email, idade, status: 'ativo' });
    });

    test('gera um id para o novo usuário', () => {
      // Arrange
      const { nome, email, idade } = dadosUsuarioComum;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.id).toEqual(expect.any(String));
    });

    test('cria o usuário como não administrador por padrão', () => {
      // Arrange
      const { nome, email, idade } = dadosUsuarioComum;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.isAdmin).toBe(false);
    });

    test('lança erro quando o usuário é menor de idade', () => {
      // Arrange
      const idadeMenor = 17;

      // Act
      const criarMenor = () =>
        userService.createUser('Menor', 'menor@email.com', idadeMenor);

      // Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test('lança erro quando falta um campo obrigatório', () => {
      // Arrange
      const emailAusente = '';

      // Act
      const criarSemEmail = () =>
        userService.createUser('Sem Email', emailAusente, 30);

      // Assert
      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('retorna o usuário cadastrado com o id informado', () => {
      // Arrange
      const usuarioCriado = criarUsuarioComum();

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('retorna null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const usuarioBuscado = userService.getUserById(idInexistente);

      // Assert
      expect(usuarioBuscado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('retorna true ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = criarUsuarioComum();

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('muda o status do usuário comum para inativo', () => {
      // Arrange
      const usuarioComum = criarUsuarioComum();

      // Act
      userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('retorna false ao tentar desativar um administrador', () => {
      // Arrange
      const usuarioAdmin = criarUsuarioAdmin();

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('mantém o administrador ativo após a tentativa de desativação', () => {
      // Arrange
      const usuarioAdmin = criarUsuarioAdmin();

      // Act
      userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('retorna false quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('inclui o nome e o status de cada usuário cadastrado', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toEqual(expect.stringContaining('Alice'));
      expect(relatorio).toEqual(expect.stringContaining('Bob'));
      expect(relatorio).toEqual(expect.stringContaining('ativo'));
    });

    test('mostra o status atualizado de um usuário desativado', () => {
      // Arrange
      const usuarioComum = criarUsuarioComum();
      userService.deactivateUser(usuarioComum.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toEqual(expect.stringContaining('inativo'));
    });

    test('informa que não há usuários quando o cadastro está vazio', () => {
      // Arrange
      userService._clearDB();

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toEqual(
        expect.stringContaining('Nenhum usuário cadastrado.')
      );
    });
  });
});
