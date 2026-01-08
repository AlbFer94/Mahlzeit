console.log("🔥 POSTS.JS LOADED FROM:", window.location.href);
window.postsLoaded = true;

/* ---------------------------------------------------------
   Utility: generate unique IDs
--------------------------------------------------------- */
function generateId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "post-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function normalizeIngredients(text) {
  return text
    .split(/[\n,]/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => (line.startsWith("- ") ? line : "- " + line))
    .join("\n");
}

/* ---------------------------------------------------------
   LocalStorage helpers
--------------------------------------------------------- */
function loadUserPosts() {
  const saved = localStorage.getItem("myPosts");
  return saved ? JSON.parse(saved) : [];
}

function saveUserPosts(posts) {
  localStorage.setItem("myPosts", JSON.stringify(posts));
}

function loadMyList() {
  const saved = localStorage.getItem("myList");
  return saved ? JSON.parse(saved) : [];
}

function saveMyList(list) {
  localStorage.setItem("myList", JSON.stringify(list));
}

function updateListCounter() {
  const counter = document.getElementById("list-counter");
  const list = loadMyList();
  if (!counter) return;

  if (list.length > 0) {
    counter.textContent = list.length;
    counter.style.display = "inline-block";
  } else {
    counter.style.display = "none";
  }
}

/* ---------------------------------------------------------
   Merge server posts + user posts
--------------------------------------------------------- */
function getAllPosts() {
  const server = window.SERVER_POSTS || [];
  const user = loadUserPosts();
  return [...server, ...user];
}

/* ---------------------------------------------------------
   Delete a user post
--------------------------------------------------------- */
function deleteUserPost(id) {
  let posts = loadUserPosts().filter(p => p.id !== id);
  saveUserPosts(posts);

  let list = loadMyList().filter(pid => pid !== id);
  saveMyList(list);

  window.location.reload();
}

/* ---------------------------------------------------------
   Render user posts (Homepage + My Posts)
--------------------------------------------------------- */
function renderUserPosts() {
  const anchor = document.getElementById("user-posts-anchor");
  if (!anchor) return;

  const isMyPostsPage = anchor.dataset.page === "my-posts";
  const userPosts = loadUserPosts();
  anchor.innerHTML = "";

  userPosts.forEach((post, idx) => {
    const article = document.createElement("article");
    article.className = "post-card";

    const img = document.createElement("img");
    img.className = "post-image";
    img.src = post.image;
    img.alt = "Post Image";

    const title = document.createElement("h3");
    title.className = "post-title";
    title.textContent = post.title;

    const preview = document.createElement("p");
    preview.className = "post-preview";
    preview.textContent = post.content;

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "post-content";

    const toggleId = "user-toggle-" + idx;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.id = toggleId;
    toggle.className = "toggle";

    const label = document.createElement("label");
    label.htmlFor = toggleId;
    label.className = "read-more btn btn-secondary";
    label.textContent = "Read more";

    const extra = document.createElement("div");
    extra.className = "extra";

    const pIngredients = document.createElement("p");
    pIngredients.textContent = post.ingredients || "";

    const pExtra = document.createElement("p");
    pExtra.textContent = post.extra || "";

    extra.appendChild(pIngredients);
    extra.appendChild(pExtra);

    contentWrapper.appendChild(toggle);
    contentWrapper.appendChild(label);
    contentWrapper.appendChild(extra);

    let actionsRow = null;
    if (isMyPostsPage) {
      actionsRow = document.createElement("div");
      actionsRow.className = "post-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-primary";
      editBtn.textContent = "Modifica";
      editBtn.addEventListener("click", () => {
        localStorage.setItem("editPostId", post.id);
        window.location.href = "/new";
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "Elimina";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Vuoi davvero eliminare questa ricetta?")) {
          deleteUserPost(post.id);
        }
      });

      actionsRow.appendChild(editBtn);
      actionsRow.appendChild(deleteBtn);
    }

    let addBtn = null;
    if (!isMyPostsPage) {
      addBtn = document.createElement("button");
      addBtn.className = "btn btn-secondary add-to-list";
      addBtn.textContent = "Aggiungi alla tua Lista";
      addBtn.dataset.id = post.id;
    }

    article.appendChild(img);
    article.appendChild(title);
    article.appendChild(preview);
    article.appendChild(contentWrapper);
    if (actionsRow) article.appendChild(actionsRow);
    if (addBtn) article.appendChild(addBtn);

    anchor.appendChild(article);
  });
}

/* ---------------------------------------------------------
   Generic setup for "Aggiungi alla tua Lista"
--------------------------------------------------------- */
function setupAddToListButtons() {
  document.querySelectorAll(".add-to-list").forEach(btn => {
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (!id) return;
      const list = loadMyList();
      if (!list.includes(id)) {
        list.push(id);
        saveMyList(list);
        updateListCounter();
      }
    });
  });
}

/* ---------------------------------------------------------
   Edit mode on new.ejs
--------------------------------------------------------- */
function loadEditMode() {
  const form = document.getElementById("new-post-form");
  if (!form) return;

  const editId = localStorage.getItem("editPostId");
  if (!editId) return;

  const posts = loadUserPosts();
  const post = posts.find(p => p.id === editId);
  if (!post) return;

  document.getElementById("title").value = post.title;
  document.getElementById("content").value = post.content;
}














