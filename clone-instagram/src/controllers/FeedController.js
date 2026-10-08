// =============================================================
// CONFIGURAÇÃO
// =============================================================

const API_BASE_URL = "https://sua-api.com/api";
let postEmDestaque = null;

// =============================================================
// INICIAR
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
    carregarPostsDoBackend();
    configurarModal();
    configurarBotoes();
});

// =============================================================
// CONFIGURAR BOTÕES
// =============================================================

function configurarBotoes() {
    document.addEventListener("click", (event) => {
        const botao = event.target.closest("[data-action]");

        if (!botao) {
            return;
        }

        const acao = botao.dataset.action;
        const postId = botao.dataset.postId;

        if (acao === "like") {
            curtirPost(postId, botao);
        }

        if (acao === "share") {
            abrirModalCompartilhar(postId);
        }

        if (acao === "save") {
            salvarPost(postId, botao);
        }

        if (acao === "comment") {
            mostrarToast("Comentários em breve 💬");
        }
    });
}

// =============================================================
// CONFIGURAR MODAL
// =============================================================

function configurarModal() {
    const closeButton = document.getElementById("close-share-modal");
    if (closeButton) {
        closeButton.addEventListener("click", fecharModal);
    }

    const shareModal = document.getElementById("share-modal");
    if (shareModal) {
        shareModal.addEventListener("click", (event) => {
            if (event.target === shareModal) {
                fecharModal();
            }
        });
    }

    const copiarButton = document.getElementById("copy-link-button");
    if (copiarButton) {
        copiarButton.addEventListener("click", copiarLinkPost);
    }

    const whatsappButton = document.getElementById("whatsapp-button");
    if (whatsappButton) {
        whatsappButton.addEventListener("click", compartilharWhatsApp);
    }
}

// =============================================================
// 1. CARREGAR POSTS
// =============================================================

async function carregarPostsDoBackend() {
    const container = document.getElementById("feed-container");

    if (!container) {
        console.error("Elemento #feed-container não encontrado.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts`);

        if (!response.ok) {
            throw new Error("Erro ao procurar publicações.");
        }

        const posts = await response.json();

        if (!Array.isArray(posts)) {
            throw new Error("A API não retornou uma lista de posts.");
        }

        renderizarPosts(posts);

    } catch (error) {
        console.warn("Servidor offline. Usando posts de demonstração.");

        const postsDemo = [
            {
                id: 1,
                username: "maria_jainara",
                verified: true,
                tempo: "2 min",
                avatar: "Jainara.jpeg",
                imagem: "sobremesa.jfif",
                curtidas: 1284,
                curtidasTexto: "avilla_jaylle e outras pessoas",
                legenda: "Adoçando o dia! 🍰✨",
                comentariosCount: 42,
                salvo: false,
                curtido: false
            },
            {
                id: 2,
                username: "avilla_jaylle",
                verified: true,
                tempo: "5 h",
                avatar: "Ávilla.png",
                imagem: "praia.jfif",
                curtidas: 856,
                curtidasTexto: "carlos_andre e outras pessoas",
                legenda: "Pé na areia e mente leve. 🌊☀️",
                comentariosCount: 18,
                salvo: false,
                curtido: false
            },
            {
                id: 3,
                username: "carlos_andre",
                verified: false,
                tempo: "1 d",
                avatar: "Carlos.png",
                imagem: "violao.jpg",
                curtidas: 421,
                curtidasTexto: "maria_jainara e outras pessoas",
                legenda: "Apenas bons acordes para hoje. 🎸🎶",
                comentariosCount: 12,
                salvo: false,
                curtido: false
            }
        ];

        renderizarPosts(postsDemo);
    }
}

// =============================================================
// 2. RENDERIZAR POSTS
// =============================================================

function renderizarPosts(posts) {
    const container = document.getElementById("feed-container");

    if (!container) {
        console.error("Elemento #feed-container não encontrado.");
        return;
    }

    const storiesContainer = container.querySelector(".stories-container");
    container.innerHTML = "";
    if (storiesContainer) {
        container.appendChild(storiesContainer);
    }

    posts.forEach((post) => {
        const postHTML = `
            <article class="post-card" data-post-id="${post.id}">
                <header class="post-header">
                    <div class="user-info">
                        <div class="story-ring small active">
                            <img src="${post.avatar}" class="avatar" alt="${post.username}">
                        </div>
                        <div class="user-details">
                            <span class="username">
                                ${post.username}
                                ${post.verified ? `<span class="verified-badge">✓</span>` : ""}
                            </span>
                            <span class="post-time">• ${post.tempo}</span>
                        </div>
                    </div>
                    <button class="btn-options" type="button" title="Mais opções">•••</button>
                </header>

                <div class="post-image-container">
                    <img src="${post.imagem}" alt="Publicação de ${post.username}" class="post-image">
                </div>

                <div class="post-actions">
                    <div class="actions-left">
                        <button class="btn-icon like-button ${post.curtido ? "liked" : ""}" type="button" data-action="like" data-post-id="${post.id}" title="Curtir">
                            <svg width="24" height="24" viewBox="0 0 24 24">
                              <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.074 2.5 12.168 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.118-1.763a4.17 4.17 0 0 1 3.671-1.941" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                        </button>
                        <button class="btn-icon" type="button" data-action="comment" data-post-id="${post.id}" title="Comentar">
                            <svg width="24" height="24" viewBox="0 0 24 24">
                              <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615l4.01 1.085z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            <span class="action-count">${post.comentariosCount}</span>
                        </button>
                        <button class="btn-icon" type="button" data-action="share" data-post-id="${post.id}" title="Compartilhar">
                            <svg width="24" height="24" viewBox="0 0 24 24">
                              <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="2" y2="10.083"></line>
                              <polygon fill="none" points="11.698 20.334 22 2 0.001 8.665 7.086 12.426 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
                            </svg>
                        </button>
                    </div>
                    <button class="btn-icon save-button ${post.salvo ? "saved" : ""}" type="button" data-action="save" data-post-id="${post.id}" title="Salvar">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon>
                        </svg>
                    </button>
                </div>

                <div class="post-details">
                    <p class="likes-info">
                        Curtido por <strong>${post.curtidasTexto}</strong>
                    </p>
                    <p class="caption">
                        <strong>
                            ${post.username}
                            ${post.verified ? `<span class="verified-badge">✓</span>` : ""}
                        </strong>
                        ${post.legenda}
                    </p>
                    ${
                        post.comentariosCount > 0
                            ? `<button class="comments-link" type="button" data-action="comment" data-post-id="${post.id}">
                                Ver todos os ${post.comentariosCount} comentários
                               </button>`
                            : ""
                    }
                </div>
            </article>
        `;

        container.insertAdjacentHTML("beforeend", postHTML);
    });
}

// =============================================================
// 3. ABRIR / FECHAR MODAL
// =============================================================

function abrirModalCompartilhar(postId) {
    postEmDestaque = postId;
    const modal = document.getElementById("share-modal");
    if (modal) {
        modal.classList.add("show");
    }
}

function fecharModal() {
    const modal = document.getElementById("share-modal");
    if (modal) {
        modal.classList.remove("show");
    }
    postEmDestaque = null;
}

// =============================================================
// COPIAR LINK & WHATSAPP
// =============================================================

async function copiarLinkPost() {
    if (!postEmDestaque) return;

    const linkPost = `${window.location.origin}/post.html?id=${postEmDestaque}`;

    try {
        await navigator.clipboard.writeText(linkPost);
        mostrarToast("Link copiado!");
    } catch (error) {
        mostrarToast("Não foi possível copiar o link.");
    }

    fecharModal();
}

function compartilharWhatsApp() {
    if (!postEmDestaque) return;

    const linkPost = `${window.location.origin}/post.html?id=${postEmDestaque}`;
    const texto = encodeURIComponent(`Confira esta publicação: ${linkPost}`);

    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
    fecharModal();
}

// =============================================================
// SALVAR E CURTIR
// =============================================================

async function salvarPost(postId, button) {
    const eSalvo = button.classList.toggle("saved");

    mostrarToast(
        eSalvo
            ? "Publicação salva!"
            : "Publicação removida dos salvos."
    );

    try {
        await fetch(`${API_BASE_URL}/posts/${postId}/save`, { method: "POST" });
    } catch (error) {
        console.log("Backend offline. Ação simulada.");
    }
}

async function curtirPost(postId, button) {
    const eCurtido = button.classList.toggle("liked");

    // Alterna o emoji entre coração cheio (❤️) e vazio (🤍)
    button.innerText = eCurtido ? "❤️" : "🤍";

    mostrarToast(
        eCurtido
            ? "Você curtiu! ❤️"
            : "Curtida removida."
    );

    try {
        await fetch(`${API_BASE_URL}/posts/${postId}/like`, { method: "POST" });
    } catch (error) {
        console.log("Backend offline. Ação simulada.");
    }
}

// =============================================================
// TOAST
// =============================================================

function mostrarToast(mensagem) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = mensagem;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
