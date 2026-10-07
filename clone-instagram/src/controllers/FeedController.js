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
                imagem: "https://picsum.photos/800/800?random=20",
                curtidas: 1284,
                curtidasTexto: "avilla_jaylle e outras pessoas",
                legenda: "Projeto atualizado com sucesso! 🚀",
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
                imagem: "https://picsum.photos/800/800?random=21",
                curtidas: 856,
                curtidasTexto: "carlos_andre e outras pessoas",
                legenda: "Dia de foco e novos aprendizados! 💻✨",
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
                imagem: "https://picsum.photos/800/800?random=22",
                curtidas: 421,
                curtidasTexto: "maria_jainara e outras pessoas",
                legenda: "Pausa para o café e revisão de código ☕",
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
                            ${post.curtido ? "❤️" : "🤍"}
                        </button>
                        <button class="btn-icon" type="button" data-action="comment" data-post-id="${post.id}" title="Comentar">
                            💬 <span class="action-count">${post.comentariosCount}</span>
                        </button>
                        <button class="btn-icon" type="button" data-action="share" data-post-id="${post.id}" title="Compartilhar">
                            ↗️
                        </button>
                    </div>
                    <button class="btn-icon save-button ${post.salvo ? "saved" : ""}" type="button" data-action="save" data-post-id="${post.id}" title="Salvar">
                        🔖
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
    button.classList.toggle("saved");

    mostrarToast(
        button.classList.contains("saved")
            ? "Publicação salva! 🔖"
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
