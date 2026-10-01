// URL base da API do vosso Back-end (ex: Node.js, Python, PHP)
const API_BASE_URL = "https://sua-api.com/api"; 

let postEmDestaque = null;

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  carregarPostsDoBackend();
});

/* =============================================================
   1. ENDPOINT: Carregar Posts da Base de Dados (GET)
============================================================= */
async function carregarPostsDoBackend() {
  const container = document.getElementById("postsContainer");

  try {
    // Chamada ao endpoint que busca as publicações
    const response = await fetch(`${API_BASE_URL}/posts`);
    
    if (!response.ok) {
      throw new Error("Erro ao procurar publicações no servidor.");
    }

    const posts = await response.json();
    renderizarPosts(posts);

  } catch (error) {
    console.warn("Servidor offline. A carregar dados locais de demonstração...", error);
    
    // Dados de fallback caso a API ainda não esteja rodando no servidor
    const postsDemo = [
      {
        id: 1,
        username: "maria_jainara",
        verified: true,
        tempo: "• 2 min",
        avatar: "https://picsum.photos/40/40?random=10",
        imagem: "https://picsum.photos/600/600?random=20",
        curtidasTexto: "avilla_jaylle e outras pessoas",
        legenda: "Projeto atualizado com sucesso! 🚀",
        comentariosCount: 10,
        salvo: false
      },
      {
        id: 2,
        username: "avilla_jaylle",
        verified: true,
        tempo: "• 15 min",
        avatar: "https://picsum.photos/40/40?random=11",
        imagem: "https://picsum.photos/600/600?random=21",
        curtidasTexto: "carlos_andre e outras pessoas",
        legenda: "Dia de foco e novos aprendizados! 💻✨",
        comentariosCount: 5,
        salvo: false
      },
      {
        id: 3,
        username: "carlos_andre",
        verified: false,
        tempo: "• 1 h",
        avatar: "https://picsum.photos/40/40?random=12",
        imagem: "https://picsum.photos/600/600?random=22",
        curtidasTexto: "maria_jainara e outras pessoas",
        legenda: "Pausa para o café e revisão de código ☕",
        comentariosCount: 12,
        salvo: false
      }
    ];

    renderizarPosts(postsDemo);
  }
}

// Renderiza o HTML dinamicamente com base nos dados do endpoint
function renderizarPosts(posts) {
  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  posts.forEach(post => {
    const postHTML = `
      <article class="post-card" data-post-id="${post.id}">
        <header class="post-header">
          <div class="user-info">
            <div class="story-ring small active">
              <img src="${post.avatar}" class="avatar" alt="${post.username}">
            </div>
            <div class="user-details">
              <span class="username">${post.username} ${post.verified ? '<span class="verified-badge">✔</span>' : ''}</span>
              <span class="post-time">${post.tempo}</span>
            </div>
          </div>
          <button class="btn-options">•••</button>
        </header>

        <div class="post-image-container">
          <img src="${post.imagem}" alt="Publicação de ${post.username}" class="post-image">
        </div>

        <div class="post-actions">
          <div class="actions-left">
            <button class="btn-icon" onclick="curtirPost(${post.id})" title="Curtir">❤️</button>
            <button class="btn-icon" title="Comentar">💬 <span class="action-count">${post.comentariosCount}</span></button>
            <button class="btn-icon" onclick="abrirModalCompartilhar(${post.id})" title="Compartilhar">↗️</button>
          </div>
          <button class="btn-icon" onclick="salvarPost(${post.id})" title="Salvar">🔖</button>
        </div>

        <div class="post-details">
          <p class="likes-info">Curtido por <strong>${post.curtidasTexto}</strong></p>
          <p class="caption">
            <strong>${post.username} ${post.verified ? '<span class="verified-badge">✔</span>' : ''}</strong> ${post.legenda}
          </p>
        </div>
      </article>
    `;
    container.insertAdjacentHTML("beforeend", postHTML);
  });
}

/* =============================================================
   2. ENDPOINT: Ações de Compartilhar (POST)
============================================================= */
function abrirModalCompartilhar(postId) {
  postEmDestaque = postId;
  document.getElementById("shareModal").classList.add("active");
}

function fecharModal() {
  document.getElementById("shareModal").classList.remove("active");
}

function fecharModalFora(event) {
  if (event.target.classList.contains("modal-overlay")) {
    fecharModal();
  }
}

// Envia evento de compartilhamento ao servidor
async function registrarCompartilhamentoNoBackend(postId, tipo) {
  try {
    await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoCompartilhamento: tipo })
    });
  } catch (error) {
    console.log("Erro ao registrar compartilhamento no servidor (Backend offline).");
  }
}

// Copiar link com Callback da Clipboard API
function copiarLinkPost() {
  const linkPost = `${window.location.origin}/post.html?id=${postEmDestaque}`;

  // Requisição ao endpoint
  registrarCompartilhamentoNoBackend(postEmDestaque, "copiar_link");

  if (navigator.clipboard) {
    // Callbacks de promessa (.then e .catch)
    navigator.clipboard.writeText(linkPost)
      .then(() => mostrarToast("Link copiado para a área de transferência!"))
      .catch(() => mostrarToast("Erro ao copiar o link."));
  } else {
    mostrarToast(`Link: ${linkPost}`);
  }

  fecharModal();
}

// Compartilhar WhatsApp
function compartilharWhatsApp() {
  const linkPost = `${window.location.origin}/post.html?id=${postEmDestaque}`;
  
  // Requisição ao endpoint
  registrarCompartilhamentoNoBackend(postEmDestaque, "whatsapp");

  const texto = encodeURIComponent(`Confira esta publicação no Instagram: ${linkPost}`);
  window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
  fecharModal();
}

/* =============================================================
   3. ENDPOINTS: Salvar e Curtir (POST)
============================================================= */
async function salvarPost(postId) {
  mostrarToast("Publicação guardada!");

  try {
    await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: "POST"
    });
  } catch (error) {
    console.log("Endpoint de salvar acionado (Simulado).");
  }
}

async function curtirPost(postId) {
  try {
    await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST"
    });
  } catch (error) {
    console.log("Endpoint de curtir acionado (Simulado).");
  }
}

/* Helper: Toast de Notificação */
function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  toast.innerText = mensagem;
  toast.classList.add("show");

  // Callback assíncrono do setTimeout
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}