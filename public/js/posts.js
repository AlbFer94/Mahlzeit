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
  .map(line => line.startsWith("- ") ? line : "- " + line) 
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

    // IMAGE
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = post.image;
    img.alt = "Post Image";

    // TITLE
    const title = document.createElement("h3");
    title.className = "post-title";
    title.textContent = post.title;

    // PREVIEW
    const preview = document.createElement("p");
    preview.className = "post-preview";
    preview.textContent = post.content;

    // READ MORE + EXTRA (must match CSS: toggle + label + extra)
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

    // ORDER CRITICAL for CSS .toggle:checked+.read-more+.extra
    contentWrapper.appendChild(toggle); // 1
    contentWrapper.appendChild(label);  // 2
    contentWrapper.appendChild(extra);  // 3

    // MY POSTS: buttons row under content
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

    // HOMEPAGE: Add to List button under content
    let addBtn = null;
    if (!isMyPostsPage) {
      addBtn = document.createElement("button");
      addBtn.className = "btn btn-secondary add-to-list";
      addBtn.textContent = "Aggiungi alla tua Lista";
      addBtn.dataset.id = post.id;
    }

    // FINAL STRUCTURE
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
   Generic setup for "Aggiungi alla tua Lista" (server + user posts)
--------------------------------------------------------- */
function setupAddToListButtons() {
  document.querySelectorAll(".add-to-list").forEach(btn => {
    if (btn.dataset.bound === "true") return; // avoid double-binding
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
  document.getElementById("ingredients").value = post.ingredients;
  document.getElementById("extra").value = post.extra;

  window.__EDIT_MODE = editId;
}

/* ---------------------------------------------------------
   Handle new post creation or editing
--------------------------------------------------------- */
function setupNewPostForm() {
  const form = document.getElementById("new-post-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const ingredients = document.getElementById("ingredients").value.trim();
    const extra = document.getElementById("extra").value.trim();
    const imageInput = document.getElementById("image");

    const userPosts = loadUserPosts();

    function finishSave(imageDataUrl) {
      const updatedPost = {
        id: window.__EDIT_MODE || generateId(),
        image: imageDataUrl || "/images/default.png",
        title,
        content,
        ingredients: normalizeIngredients(ingredients),
        extra
      };

      if (window.__EDIT_MODE) {
        const index = userPosts.findIndex(p => p.id === window.__EDIT_MODE);
        userPosts[index] = updatedPost;
        localStorage.removeItem("editPostId");
      } else {
        userPosts.push(updatedPost);
      }

      saveUserPosts(userPosts);
      window.location.href = "/";
    }

    const file = imageInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = evt => finishSave(evt.target.result);
      reader.readAsDataURL(file);
    } else {
      finishSave(null);
    }
  });
}

/* ---------------------------------------------------------
   Render weekly menu on /my-menu
--------------------------------------------------------- */
function renderMyMenu() {
  const container = document.getElementById("my-menu-container");
  if (!container) return;

  const list = loadMyList();
  const allPosts = getAllPosts();
  const selected = allPosts.filter(p => list.includes(p.id));

  if (selected.length === 0) {
    container.innerHTML = "<p>La tua lista è vuota!</p>";
    return;
  }

  selected.forEach(post => {
    const article = document.createElement("article");
    article.className = "post-card";

    const img = document.createElement("img");
    img.className = "post-image";
    img.src = post.image;

    const title = document.createElement("h3");
    title.className = "post-title";
    title.textContent = post.title;

    const preview = document.createElement("p");
    preview.className = "post-preview";
    preview.textContent = post.content;

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger";
    removeBtn.textContent = "Rimuovi dalla lista";
    removeBtn.addEventListener("click", () => {
      let list = loadMyList().filter(id => id !== post.id);
      saveMyList(list);
      window.location.reload();
    });

    article.appendChild(img);
    article.appendChild(title);
    article.appendChild(preview);
    article.appendChild(removeBtn);

    container.appendChild(article);
  });
}

/* ---------------------------------------------------------
   Shopping list grouped by recipe title
--------------------------------------------------------- */
function setupShoppingList() {
  const toggleBtn = document.getElementById("shoppingListToggle");
  const panel = document.getElementById("shoppingListPanel");
  const listEl = document.getElementById("shoppingListItems");
  const clearBtn = document.getElementById("clearChecked");

  if (!toggleBtn || !panel || !listEl) return;

  const list = loadMyList();
  const allPosts = getAllPosts();
  const selected = allPosts.filter(p => list.includes(p.id));

  if (selected.length === 0) {
    toggleBtn.style.display = "none";
    return;
  }

  toggleBtn.style.display = "block";

  const grouped = selected.map(post => {
    const items = post.ingredients
      .split("\n")
      .map(i => i.replace(/^- /, "").trim())
      .filter(i => i.length > 0);

    return { title: post.title, items };
  });

  grouped.forEach(group => {
    const section = document.createElement("li");
    section.classList.add("recipe-group");

    section.innerHTML = `
      <details>
        <summary>${group.title}</summary>
        <ul>
          ${group.items
            .map(item => {
              const id = `${group.title}-${item}`.replace(/\s+/g, "_");
              return `
                <li>
                  <input type="checkbox" id="${id}">
                  <label for="${id}">${item}</label>
                </li>
              `;
            })
            .join("")}
        </ul>
      </details>
    `;

    listEl.appendChild(section);
  });

  listEl.addEventListener("change", () => {
    const checked = Array.from(listEl.querySelectorAll("input:checked")).map(cb => cb.id);
    localStorage.setItem("shoppingListChecked", JSON.stringify(checked));
  });

  const saved = JSON.parse(localStorage.getItem("shoppingListChecked") || "[]");
  saved.forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.checked = true;
  });

  toggleBtn.addEventListener("click", () => panel.classList.toggle("open"));

  clearBtn.addEventListener("click", () => {
    listEl.querySelectorAll("input:checked").forEach(cb => cb.parentElement.remove());
  });
}

/* ---------------------------------------------------------
   Search across ALL posts
--------------------------------------------------------- */
function setupSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    const allPosts = getAllPosts();

    const filtered = allPosts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.ingredients.toLowerCase().includes(query)
    );

    renderSearchResults(filtered);
  });
}

function renderSearchResults(posts) {
  const container = document.getElementById("posts-container");
  if (!container) return;

  container.innerHTML = "";

  posts.forEach(post => {
    const article = document.createElement("article");
    article.className = "post-card";

    const img = document.createElement("img");
    img.className = "post-image";
    img.src = post.image;

    const title = document.createElement("h3");
    title.className = "post-title";
    title.textContent = post.title;

    const preview = document.createElement("p");
    preview.className = "post-preview";
    preview.textContent = post.content;

    article.appendChild(img);
    article.appendChild(title);
    article.appendChild(preview);

    container.appendChild(article);
  });
}

/* ---------------------------------------------------------
   Initialize
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderUserPosts();
  setupAddToListButtons();
  loadEditMode();
  setupNewPostForm();
  renderMyMenu();
  setupShoppingList();
  setupSearch();
  updateListCounter();
});

/* ---------------------------------------------------------
   Initialize
--------------------------------------------------------- */


// === UNIVERSAL UPLOAD VIA FETCH (Fix Chrome Samsung) ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const fileInput = document.querySelector("input[type='file'][name='image']");

  if (!form || !fileInput) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const formData = new FormData(form);

    if (file) {
      formData.set("image", file); // assicura che il file sia incluso
    }

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Redirect dopo il successo
      window.location.href = response.url;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Errore durante l'upload. Riprova.");
    }
  });
});












