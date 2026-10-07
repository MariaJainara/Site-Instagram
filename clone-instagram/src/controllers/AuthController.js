// src/controllers/AuthController.js
import { initDatabase, saveDatabase } from '../database/sqlite-init.js';

document.addEventListener('DOMContentLoaded', async () => {
  const db = await initDatabase();

  const authForm = document.getElementById('auth-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const btnRegister = document.getElementById('btn-register');
  const authMessage = document.getElementById('auth-message');

  function showMessage(text, isError = true) {
    authMessage.textContent = text;
    authMessage.className = `text-xs mt-4 text-center ${isError ? 'text-red-500' : 'text-green-600'}`;
  }

  // Fazer Login
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const stmt = db.prepare("SELECT * FROM usuarios WHERE username = :user AND password = :pass");
    const result = stmt.getAsObject({ ':user': username, ':pass': password });
    stmt.free();

    if (result.id) {
      // Salvar usuário logado na sessão do navegador
      localStorage.setItem('usuario_logado', JSON.stringify(result));
      window.location.href = 'feed.html';
    } else {
      showMessage('Usuário ou senha incorretos.');
    }
  });

  // Criar Conta (Cadastro)
  btnRegister.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showMessage('Preencha o nome de usuário e a senha.');
      return;
    }

    try {
      db.run("INSERT INTO usuarios (username, password, nome, bio) VALUES (?, ?, ?, ?)", [
        username,
        password,
        username,
        'Novo usuário do Instagram'
      ]);

      saveDatabase();
      showMessage('Conta criada com sucesso! Faça login para continuar.', false);
      usernameInput.value = '';
      passwordInput.value = '';
    } catch (err) {
      showMessage('Nome de usuário já existe ou ocorreu um erro.');
    }
  });
});