import { initDatabase, saveDatabase } from '../database/sqlite-init.js';

document.addEventListener('DOMContentLoaded', async () => {
  const db = await initDatabase();
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));

  if (!usuarioLogado) {
    window.location.href = 'index.html';
    return;
  }

  const feedContainer = document.getElementById('feed-container');

  // Buscar posts com informações do usuário e curtidas
  const stmt = db.prepare(`
    SELECT 
      posts.id, posts.imagem_url, posts.legenda, posts.criado_em,
      usuarios.id as usuario_id, usuarios.username, usuarios.foto_perfil,
      (SELECT COUNT(*) FROM curtidas WHERE post_id = posts.id) as total_curtidas,
      (SELECT COUNT(*) FROM curtidas WHERE post_id = posts.id AND usuario_id = ?) as curtiu
    FROM posts
    JOIN usuarios ON posts.usuario_id = usuarios.id
    ORDER BY posts.id DESC
  `);
  stmt.bind([usuarioLogado.id]);

  let html = '';
  while (stmt.step()) {
    const post = stmt.getAsObject();
    html += `
      <article class="bg-white border border-gray-300 rounded sm:rounded-md overflow-hidden">
        <div class="flex items-center px-4 py-3 gap-3 border-b border-gray-100">
          <img src="${post.foto_perfil || 'https://via.placeholder.com/40'}" class="w-8 h-8 rounded-full object-cover">
          <a href="perfil.html?id=${post.usuario_id}" class="font-semibold text-sm hover:underline">${post.username}</a>
        </div>
        <img src="${post.imagem_url}" class="w-full max-h-[500px] object-cover">
        <div class="p-4 space-y-2">
          <div class="flex items-center gap-4 text-xl">
            <button class="btn-like ${post.curtiu ? 'text-red-500' : 'text-gray-700'}" data-id="${post.id}">
              ${post.curtiu ? '❤️' : '🤍'}
            </button>
            <a href="post.html?id=${post.id}" class="text-gray-700">💬</a>
            <button class="btn-share text-gray-700" data-id="${post.id}">✈️</button>
          </div>
          <p class="font-semibold text-xs">${post.total_curtidas} curtidas</p>
          <p class="text-sm"><span class="font-semibold">${post.username}</span> ${post.legenda}</p>
          <a href="post.html?id=${post.id}" class="text-xs text-gray-400 block">Ver todos os comentários</a>
        </div>
      </article>
    `;
  }
  stmt.free();

  feedContainer.innerHTML = html || '<p class="text-center text-gray-500 text-sm mt-8">Nenhuma publicação encontrada.</p>';

  // Evento Curtir
  feedContainer.addEventListener('click', (e) => {
    const btnLike = e.target.closest('.btn-like');
    if (btnLike) {
      const postId = btnLike.dataset.id;
      const isLiked = btnLike.classList.contains('text-red-500');

      if (isLiked) {
        db.run('DELETE FROM curtidas WHERE post_id = ? AND usuario_id = ?', [postId, usuarioLogado.id]);
      } else {
        db.run('INSERT INTO curtidas (post_id, usuario_id) VALUES (?, ?)', [postId, usuarioLogado.id]);
      }
      saveDatabase();
      window.location.reload();
    }

    // Evento Compartilhar
    const btnShare = e.target.closest('.btn-share');
    if (btnShare) {
      document.getElementById('share-modal').classList.remove('hidden');
    }
  });

  document.getElementById('close-share-modal').addEventListener('click', () => {
    document.getElementById('share-modal').classList.add('hidden');
  });
});