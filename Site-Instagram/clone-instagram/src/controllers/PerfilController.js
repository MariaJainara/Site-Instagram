import { initDatabase, saveDatabase } from '../database/sqlite-init.js';

document.addEventListener('DOMContentLoaded', async () => {
  const db = await initDatabase();
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
  const params = new URLSearchParams(window.location.search);
  
  // Se houver id na URL, exibe esse perfil, senão exibe o próprio perfil logado
  const perfilId = params.get('id') ? parseInt(params.get('id')) : usuarioLogado.id;

  const container = document.getElementById('perfil-container');

  function renderPerfil() {
    // Buscar Dados do Usuário
    const stmtUser = db.prepare('SELECT * FROM usuarios WHERE id = ?');
    stmtUser.bind([perfilId]);
    stmtUser.step();
    const user = stmtUser.getAsObject();
    stmtUser.free();

    // Contar Posts, Seguidores e Seguindo
    const stmtStats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE usuario_id = ?) as total_posts,
        (SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?) as total_seguidores,
        (SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?) as total_seguindo,
        (SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?) as esta_seguindo
    `);
    stmtStats.bind([perfilId, perfilId, perfilId, usuarioLogado.id, perfilId]);
    stmtStats.step();
    const stats = stmtStats.getAsObject();
    stmtStats.free();

    // Buscar Posts do Perfil
    const stmtPosts = db.prepare('SELECT * FROM posts WHERE usuario_id = ? ORDER BY id DESC');
    stmtPosts.bind([perfilId]);
    
    let gridPosts = '';
    while (stmtPosts.step()) {
      const p = stmtPosts.getAsObject();
      gridPosts += `
        <a href="post.html?id=${p.id}" class="aspect-square bg-gray-200 overflow-hidden block">
          <img src="${p.imagem_url}" class="w-full h-full object-cover">
        </a>
      `;
    }
    stmtPosts.free();

    const eProprioPerfil = perfilId === usuarioLogado.id;

    container.innerHTML = `
      <div class="flex items-center gap-6 mb-6">
        <img src="${user.foto_perfil || 'https://via.placeholder.com/150'}" class="w-20 h-20 rounded-full object-cover border border-gray-300">
        <div class="space-y-2 flex-1">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-normal">${user.username}</h2>
            ${!eProprioPerfil ? `
              <button id="btn-follow" class="px-4 py-1 text-xs font-semibold rounded ${stats.esta_seguindo ? 'bg-gray-200 text-black' : 'bg-blue-500 text-white'}">
                ${stats.esta_seguindo ? 'Seguindo' : 'Seguir'}
              </button>
            ` : ''}
          </div>
          <div class="flex gap-4 text-xs">
            <span><strong>${stats.total_posts}</strong> publicações</span>
            <span><strong>${stats.total_seguidores}</strong> seguidores</span>
            <span><strong>${stats.total_seguindo}</strong> seguindo</span>
          </div>
          <p class="text-xs font-semibold">${user.nome || ''}</p>
          <p class="text-xs text-gray-600">${user.bio || ''}</p>
        </div>
      </div>

      <hr class="border-gray-300 mb-4">

      <div class="grid grid-cols-3 gap-1">
        ${gridPosts || '<p class="col-span-3 text-center text-gray-400 text-xs py-8">Nenhuma publicação ainda.</p>'}
      </div>
    `;

    // Lógica do Botão Seguir
    if (!eProprioPerfil) {
      document.getElementById('btn-follow').addEventListener('click', () => {
        if (stats.esta_seguindo) {
          db.run('DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?', [usuarioLogado.id, perfilId]);
        } else {
          db.run('INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)', [usuarioLogado.id, perfilId]);
        }
        saveDatabase();
        renderPerfil();
      });
    }
  }

  renderPerfil();
});