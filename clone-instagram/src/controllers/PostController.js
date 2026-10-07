import { initDatabase, saveDatabase } from '../database/sqlite-init.js';

document.addEventListener('DOMContentLoaded', async () => {
  const db = await initDatabase();
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id') || 1; // Padrão: post 1

  const container = document.getElementById('post-detail-container');

  function renderPost() {
    // Buscar Post
    const stmtPost = db.prepare(`
      SELECT posts.*, usuarios.username, usuarios.foto_perfil 
      FROM posts 
      JOIN usuarios ON posts.usuario_id = usuarios.id 
      WHERE posts.id = ?
    `);
    stmtPost.bind([postId]);
    stmtPost.step();
    const post = stmtPost.getAsObject();
    stmtPost.free();

    // Buscar Comentários
    const stmtComments = db.prepare(`
      SELECT comentarios.texto, usuarios.username 
      FROM comentarios 
      JOIN usuarios ON comentarios.usuario_id = usuarios.id 
      WHERE comentarios.post_id = ?
      ORDER BY comentarios.id ASC
    `);
    stmtComments.bind([postId]);

    let comentariosHtml = '';
    while (stmtComments.step()) {
      const c = stmtComments.getAsObject();
      comentariosHtml += `<p class="text-sm"><span class="font-semibold">${c.username}</span> ${c.texto}</p>`;
    }
    stmtComments.free();

    container.innerHTML = `
      <article class="bg-white border border-gray-300 rounded">
        <div class="flex items-center px-4 py-3 gap-3 border-b border-gray-100">
          <img src="${post.foto_perfil || 'https://via.placeholder.com/40'}" class="w-8 h-8 rounded-full">
          <span class="font-semibold text-sm">${post.username}</span>
        </div>
        <img src="${post.imagem_url}" class="w-full">
        <div class="p-4 space-y-3">
          <p class="text-sm"><span class="font-semibold">${post.username}</span> ${post.legenda}</p>
          <hr class="my-2 border-gray-200">
          <div class="space-y-2 max-h-48 overflow-y-auto">
            ${comentariosHtml || '<p class="text-xs text-gray-400">Sem comentários ainda.</p>'}
          </div>
          <form id="comment-form" class="flex gap-2 pt-2 border-t border-gray-200">
            <input type="text" id="comment-text" placeholder="Adicione um comentário..." required class="flex-1 text-xs border border-gray-300 rounded px-3 py-2 focus:outline-none">
            <button type="submit" class="text-xs font-semibold text-blue-500 hover:text-blue-700">Publicar</button>
          </form>
        </div>
      </article>
    `;

    document.getElementById('comment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const texto = document.getElementById('comment-text').value.trim();
      if (!texto) return;

      db.run('INSERT INTO comentarios (post_id, usuario_id, texto) VALUES (?, ?, ?)', [
        postId,
        usuarioLogado.id,
        texto
      ]);
      saveDatabase();
      renderPost();
    });
  }

  renderPost();
});