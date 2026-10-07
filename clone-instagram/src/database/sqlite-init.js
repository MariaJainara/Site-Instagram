// src/database/sqlite-init.js

let db = null;

export async function initDatabase() {
  if (db) return db;

  const SQL = await window.initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  // Tenta carregar o banco de dados salvo no localStorage
  const savedDb = localStorage.getItem('instagram_db');

  if (savedDb) {
    const uInt8Array = new Uint8Array(JSON.parse(savedDb));
    db = new SQL.Database(uInt8Array);
  } else {
    db = new SQL.Database();
    createTables();
    seedInitialData();
    saveDatabase();
  }

  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nome TEXT,
      bio TEXT,
      foto_perfil TEXT
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      imagem_url TEXT NOT NULL,
      legenda TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      usuario_id INTEGER,
      texto TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS curtidas (
      post_id INTEGER,
      usuario_id INTEGER,
      PRIMARY KEY (post_id, usuario_id),
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS seguidores (
      seguidor_id INTEGER,
      seguido_id INTEGER,
      PRIMARY KEY (seguidor_id, seguido_id),
      FOREIGN KEY (seguidor_id) REFERENCES usuarios(id),
      FOREIGN KEY (seguido_id) REFERENCES usuarios(id)
    );
  `);
}

function seedInitialData() {
  // Inserir Usuário Inicial
  db.run(`
    INSERT INTO usuarios (username, password, nome, bio, foto_perfil)
    VALUES ('usuario_demo', '123456', 'Usuário Exemplo', 'Projeto de Programação para a Web', 'https://via.placeholder.com/150');
  `);

  // Inserir 1 Postagem Obrigatória
  db.run(`
    INSERT INTO posts (usuario_id, imagem_url, legenda)
    VALUES (1, 'https://picsum.photos/600/600', 'Minha primeira publicação no clone do Instagram! 🚀');
  `);

  // Inserir 1 Comentário de Teste
  db.run(`
    INSERT INTO comentarios (post_id, usuario_id, texto)
    VALUES (1, 1, 'Muito legal esse projeto!');
  `);
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Array.from(data);
  localStorage.setItem('instagram_db', JSON.stringify(buffer));
}