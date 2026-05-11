(function () {
  "use strict";

  const API = "/api";

  const state = {
    access: localStorage.getItem("access") || "",
    refresh: localStorage.getItem("refresh") || "",
    me: null,
    activeTab: "feed",
    feedResults: [],
    feedNext: null,
    tweetsResults: [],
    tweetsNext: null,
    lookupProfile: null,
    composeText: "",
    modalTweet: null,
    modalComments: [],
    modalCommentsNext: null,
    replyToId: null,
  };

  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function showToast(message, isError) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.toggle("error", !!isError);
    el.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.add("hidden"), 4200);
  }

  function saveTokens(access, refresh) {
    state.access = access || "";
    state.refresh = refresh || "";
    if (state.access) localStorage.setItem("access", state.access);
    else localStorage.removeItem("access");
    if (state.refresh) localStorage.setItem("refresh", state.refresh);
    else localStorage.removeItem("refresh");
  }

  function clearAuth() {
    state.access = "";
    state.refresh = "";
    state.me = null;
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }

  async function apiRequest(path, options = {}) {
    const url = path.startsWith("http") ? path : API + path;
    const headers = { ...(options.headers || {}) };
    if (state.access) headers.Authorization = "Bearer " + state.access;
    const body = options.body;
    if (body != null && typeof body === "object" && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!res.ok) {
      const err = new Error(
        (data && data.detail) || (typeof data === "string" ? data : res.statusText)
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return { status: res.status, data };
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  function renderHeader() {
    const nav = $("#header-actions");
    if (!state.access) {
      nav.innerHTML = '<span class="muted">Sign in to post and interact</span>';
      return;
    }
    const u = state.me && state.me.username ? state.me.username : "…";
    nav.innerHTML =
      '<span class="muted">Signed in as</span> <strong>' +
      escapeHtml(u) +
      '</strong> <button type="button" class="btn btn-sm btn-ghost" id="btn-logout">Log out</button>';
    $("#btn-logout", nav).addEventListener("click", () => {
      clearAuth();
      state.feedResults = [];
      state.tweetsResults = [];
      state.lookupProfile = null;
      closeModal();
      renderAll();
      showToast("Logged out");
    });
  }

  function renderSidebar() {
    const el = $("#sidebar");
    if (!state.access) {
      el.innerHTML = "";
      return;
    }
    const m = state.me;
    if (!m) {
      el.innerHTML = '<div class="panel"><p class="muted">Loading profile…</p></div>';
      return;
    }
    el.innerHTML =
      '<div class="panel">' +
      "<h3>Your profile</h3>" +
      "<p><strong>@" +
      escapeHtml(m.username) +
      "</strong></p>" +
      '<p class="muted">ID: ' +
      m.id +
      "</p>" +
      "<p>Tweets: " +
      (m.tweets_count ?? 0) +
      " · Following: " +
      (m.following_count ?? 0) +
      " · Followers: " +
      (m.followers_count ?? 0) +
      "</p>" +
      '<button type="button" class="btn btn-sm" id="btn-refresh-me">Refresh /me</button>' +
      "</div>" +
      '<div class="panel">' +
      "<h3>Look up user</h3>" +
      '<div class="field"><label for="lookup-id">User ID</label>' +
      '<input type="number" id="lookup-id" min="1" placeholder="e.g. 2"></div>' +
      '<button type="button" class="btn btn-primary" id="btn-lookup">Load profile</button>' +
      '<div id="lookup-result"></div>' +
      "</div>";
    $("#btn-refresh-me", el).addEventListener("click", () => loadMe().then(renderAll));
    $("#btn-lookup", el).addEventListener("click", () => {
      const id = parseInt($("#lookup-id", el).value, 10);
      if (!id) {
        showToast("Enter a user ID", true);
        return;
      }
      loadUserProfile(id)
        .then(() => renderSidebarLookup())
        .catch((e) => showToast(e.message || "Lookup failed", true));
    });
    renderSidebarLookup();
  }

  function renderSidebarLookup() {
    const host = $("#sidebar");
    const box = $("#lookup-result", host);
    if (!box) return;
    const p = state.lookupProfile;
    if (!p) {
      box.innerHTML = "";
      return;
    }
    const selfId = state.me && state.me.id;
    const isSelf = selfId === p.id;
    box.innerHTML =
      '<div class="card" style="margin-top:0.75rem">' +
      "<div class=\"card-meta\"><strong>@" +
      escapeHtml(p.username) +
      "</strong></div>" +
      '<p class="muted">Tweets: ' +
      (p.tweets_count ?? 0) +
      " · Following: " +
      (p.following_count ?? 0) +
      " · Followers: " +
      (p.followers_count ?? 0) +
      "</p>" +
      (isSelf
        ? '<p class="muted">This is you.</p>'
        : '<button type="button" class="btn btn-primary btn-sm" id="btn-follow-lookup">' +
          (p.is_following ? "Unfollow" : "Follow / toggle") +
          "</button>") +
      "</div>";
    const btn = $("#btn-follow-lookup", box);
    if (btn)
      btn.addEventListener("click", () =>
        toggleFollow(p.id)
          .then(() => loadUserProfile(p.id))
          .then(() => {
            renderSidebarLookup();
            renderAll();
          })
          .catch((e) => showToast(e.message || "Follow failed", true))
      );
  }

  function renderGuest() {
    const panel = $("#guest-panel");
    const auth = $("#auth-panel");
    if (state.access) {
      panel.classList.add("hidden");
      auth.classList.remove("hidden");
      return;
    }
    panel.classList.remove("hidden");
    auth.classList.add("hidden");
    panel.innerHTML =
      '<div class="grid-2">' +
      '<div><h2>Register</h2>' +
      '<div class="field"><label>Username</label><input type="text" id="reg-user" autocomplete="username"></div>' +
      '<div class="field"><label>Email (optional)</label><input type="email" id="reg-email" autocomplete="email"></div>' +
      '<div class="field"><label>Password (min 8)</label><input type="password" id="reg-pass" autocomplete="new-password"></div>' +
      '<button type="button" class="btn btn-primary" id="btn-register">Create account</button></div>' +
      '<div><h2>Log in</h2>' +
      '<div class="field"><label>Username</label><input type="text" id="login-user" autocomplete="username"></div>' +
      '<div class="field"><label>Password</label><input type="password" id="login-pass" autocomplete="current-password"></div>' +
      '<button type="button" class="btn btn-primary" id="btn-login">Log in</button></div>' +
      "</div>";
    $("#btn-register", panel).addEventListener("click", onRegister);
    $("#btn-login", panel).addEventListener("click", onLogin);
  }

  function renderAuth() {
    const auth = $("#auth-panel");
    if (!state.access) return;
    auth.classList.remove("hidden");
    const feedActive = state.activeTab === "feed" ? "active" : "";
    const allActive = state.activeTab === "all" ? "active" : "";
    auth.innerHTML =
      '<div class="panel">' +
      "<h2>Compose</h2>" +
      '<textarea id="compose" placeholder="What is happening?"></textarea>' +
      '<div class="row"><button type="button" class="btn btn-primary" id="btn-compose">Post tweet</button></div>' +
      "</div>" +
      '<div class="tabs">' +
      '<button type="button" class="tab ' +
      feedActive +
      '" data-tab="feed">Following feed</button>' +
      '<button type="button" class="tab ' +
      allActive +
      '" data-tab="all">All tweets</button>' +
      "</div>" +
      '<div id="tweet-list"></div>';
    auth.querySelectorAll(".tab").forEach((t) =>
      t.addEventListener("click", () => {
        state.activeTab = t.getAttribute("data-tab");
        renderAuth();
        if (state.activeTab === "feed") renderTweetList("feed");
        else renderTweetList("all");
      })
    );
    $("#btn-compose", auth).addEventListener("click", onCompose);
    if (state.activeTab === "feed") renderTweetList("feed");
    else renderTweetList("all");
  }

  function tweetCard(t) {
    const u = t.user && t.user.username ? t.user.username : "?";
    const liked = t.is_liked ? "♥ Liked" : "Like";
    return (
      '<article class="card" data-tweet-id="' +
      t.id +
      '">' +
      '<div class="card-meta"><strong>@' +
      escapeHtml(u) +
      "</strong> · " +
      formatDate(t.created_at) +
      " · id " +
      t.id +
      "</div>" +
      '<div class="card-body">' +
      escapeHtml(t.content) +
      "</div>" +
      '<div class="row">' +
      '<span class="muted">' +
      (t.likes_count ?? 0) +
      " likes · " +
      (t.comments_count ?? 0) +
      " comments</span>" +
      (state.access
        ? '<button type="button" class="btn btn-sm" data-like="' +
          t.id +
          '">' +
          liked +
          "</button>"
        : "") +
      '<button type="button" class="btn btn-sm btn-primary" data-open="' +
      t.id +
      '">Open</button>' +
      "</div></article>"
    );
  }

  function renderTweetList(which) {
    const host = $("#tweet-list");
    if (!host) return;
    const isFeed = which === "feed";
    const results = isFeed ? state.feedResults : state.tweetsResults;
    const next = isFeed ? state.feedNext : state.tweetsNext;
    let html = results.map(tweetCard).join("");
    if (!results.length)
      html =
        '<p class="muted">' +
        (isFeed
          ? "No tweets from people you follow yet. Follow users by ID from the sidebar, then refresh this tab."
          : "No tweets yet. Be the first to post.") +
        "</p>";
    html +=
      '<div class="row" style="margin-top:0.75rem">' +
      '<button type="button" class="btn btn-sm" id="btn-reload-list">Reload</button>';
    if (next)
      html += '<button type="button" class="btn btn-sm btn-primary" id="btn-more">Load more</button>';
    html += "</div>";
    host.innerHTML = html;
    host.querySelectorAll("[data-open]").forEach((b) =>
      b.addEventListener("click", () => openTweetModal(parseInt(b.getAttribute("data-open"), 10)))
    );
    host.querySelectorAll("[data-like]").forEach((b) =>
      b.addEventListener("click", () =>
        toggleLike(parseInt(b.getAttribute("data-like"), 10))
          .then(() => refreshCurrentList())
          .catch((e) => showToast(e.message || "Like failed", true))
      )
    );
    $("#btn-reload-list", host).addEventListener("click", () =>
      (isFeed ? loadFeed(true) : loadTweets(true)).then(() => {
        renderTweetList(which);
      })
    );
    const more = $("#btn-more", host);
    if (more)
      more.addEventListener("click", () =>
        (isFeed ? loadFeed(false) : loadTweets(false)).then(() => renderTweetList(which))
      );
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadMe() {
    const { data } = await apiRequest("/me/");
    state.me = data;
  }

  async function loadUserProfile(id) {
    const { data } = await apiRequest("/users/" + id + "/");
    state.lookupProfile = data;
  }

  async function loadFeed(reset) {
    const url = reset ? "/feed/" : state.feedNext;
    if (!url) return;
    const { data } = await apiRequest(url);
    if (reset) state.feedResults = [];
    state.feedResults = state.feedResults.concat(data.results || []);
    state.feedNext = data.next || null;
  }

  async function loadTweets(reset) {
    const url = reset ? "/tweets/" : state.tweetsNext;
    if (!url) return;
    const { data } = await apiRequest(url);
    if (reset) state.tweetsResults = [];
    state.tweetsResults = state.tweetsResults.concat(data.results || []);
    state.tweetsNext = data.next || null;
  }

  async function refreshCurrentList() {
    if (state.activeTab === "feed") await loadFeed(true);
    else await loadTweets(true);
    renderTweetList(state.activeTab === "feed" ? "feed" : "all");
    if (state.modalTweet) {
      const id = state.modalTweet.id;
      await openTweetModal(id);
    }
  }

  async function onRegister() {
    const username = $("#reg-user").value.trim();
    const password = $("#reg-pass").value;
    const email = $("#reg-email").value.trim();
    const body = { username, password };
    if (email) body.email = email;
    try {
      await apiRequest("/register/", { method: "POST", body });
      showToast("Account created. You can log in now.");
    } catch (e) {
      const msg =
        e.data && typeof e.data === "object"
          ? JSON.stringify(e.data)
          : e.message;
      showToast(msg, true);
    }
  }

  async function onLogin() {
    const username = $("#login-user").value.trim();
    const password = $("#login-pass").value;
    try {
      const { data } = await apiRequest("/login/", {
        method: "POST",
        body: { username, password },
      });
      saveTokens(data.access, data.refresh);
      await loadMe();
      await loadFeed(true);
      await loadTweets(true);
      renderAll();
      showToast("Welcome, @" + (state.me && state.me.username));
    } catch (e) {
      showToast(e.message || "Login failed", true);
    }
  }

  async function onCompose() {
    const content = $("#compose").value.trim();
    if (!content) {
      showToast("Write something first", true);
      return;
    }
    try {
      await apiRequest("/tweets/", { method: "POST", body: { content } });
      $("#compose").value = "";
      await refreshCurrentList();
      showToast("Tweet posted");
    } catch (e) {
      showToast(e.message || "Post failed", true);
    }
  }

  async function toggleLike(tweetId) {
    await apiRequest("/tweets/" + tweetId + "/like/", { method: "POST" });
  }

  async function toggleFollow(userId) {
    await apiRequest("/users/" + userId + "/follow/", { method: "POST" });
  }

  function closeModal() {
    const root = $("#modal-root");
    root.classList.add("hidden");
    root.setAttribute("aria-hidden", "true");
    state.modalTweet = null;
    state.modalComments = [];
    state.modalCommentsNext = null;
    state.replyToId = null;
  }

  function openModal() {
    const root = $("#modal-root");
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
  }

  async function openTweetModal(id) {
    try {
      const [{ data: tweet }, commentsBundle] = await Promise.all([
        apiRequest("/tweets/" + id + "/"),
        loadCommentsPage("/tweets/" + id + "/comments/", true),
      ]);
      state.modalTweet = tweet;
      state.modalComments = commentsBundle.results;
      state.modalCommentsNext = commentsBundle.next;
      state.replyToId = null;
      renderModal();
      openModal();
    } catch (e) {
      showToast(e.message || "Could not load tweet", true);
    }
  }

  async function loadCommentsPage(url, reset) {
    const { data } = await apiRequest(url);
    return {
      results: data.results || [],
      next: data.next || null,
    };
  }

  function renderModal() {
    const body = $("#modal-body");
    const t = state.modalTweet;
    if (!t) {
      body.innerHTML = "";
      return;
    }
    const uid = state.me && state.me.id;
    const owner = t.user && uid === t.user.id;
    const u = t.user && t.user.username ? t.user.username : "?";
    let html =
      '<div class="card-meta"><strong>@' +
      escapeHtml(u) +
      "</strong> · " +
      formatDate(t.created_at) +
      "</div>" +
      '<div class="card-body" id="modal-tweet-content">' +
      escapeHtml(t.content) +
      "</div>" +
      '<div class="row">' +
      '<span class="muted">' +
      (t.likes_count ?? 0) +
      " likes · " +
      (t.comments_count ?? 0) +
      " comments</span>";
    if (state.access)
      html +=
        '<button type="button" class="btn btn-sm" id="modal-like">' +
        (t.is_liked ? "Unlike" : "Like") +
        "</button>";
    html += "</div>";
    if (owner) {
      html +=
        '<div class="panel" style="margin-top:0.75rem">' +
        "<h3>Edit your tweet</h3>" +
        '<textarea id="edit-content"></textarea>' +
        '<div class="row">' +
        '<button type="button" class="btn btn-primary btn-sm" id="btn-patch">Save changes</button>' +
        '<button type="button" class="btn btn-sm btn-danger" id="btn-delete">Delete tweet</button>' +
        "</div></div>";
    }
    if (state.access) {
      html +=
        '<div class="panel" style="margin-top:0.75rem">' +
        "<h3>Comments</h3>" +
        '<p class="muted" id="reply-hint"></p>' +
        '<textarea id="comment-content" placeholder="Add a comment"></textarea>' +
        '<div class="row">' +
        '<button type="button" class="btn btn-primary btn-sm" id="btn-comment">Post comment</button>' +
        '<button type="button" class="btn btn-sm btn-ghost hidden" id="btn-cancel-reply">Cancel reply</button>' +
        "</div>";
    }
    html += '<div id="comments-list" style="margin-top:0.75rem"></div>';
    if (state.modalCommentsNext)
      html += '<div class="row"><button type="button" class="btn btn-sm" id="btn-more-comments">More comments</button></div>';
    body.innerHTML = html;
    const editTa = $("#edit-content", body);
    if (editTa) editTa.value = t.content || "";
    updateReplyHint();
    renderCommentsList();

    const likeBtn = $("#modal-like", body);
    if (likeBtn)
      likeBtn.addEventListener("click", () =>
        toggleLike(t.id)
          .then(() => apiRequest("/tweets/" + t.id + "/"))
          .then(({ data }) => {
            state.modalTweet = data;
            renderModal();
            refreshCurrentList();
          })
          .catch((e) => showToast(e.message, true))
      );
    const patch = $("#btn-patch", body);
    if (patch)
      patch.addEventListener("click", () => {
        const content = $("#edit-content", body).value.trim();
        if (!content) return showToast("Content required", true);
        return apiRequest("/tweets/" + t.id + "/", { method: "PATCH", body: { content } })
          .then(({ data }) => {
            state.modalTweet = data;
            renderModal();
            refreshCurrentList();
            showToast("Tweet updated");
          })
          .catch((e) => showToast(e.message, true));
      });
    const del = $("#btn-delete", body);
    if (del)
      del.addEventListener("click", () => {
        if (!confirm("Delete this tweet?")) return;
        return apiRequest("/tweets/" + t.id + "/", { method: "DELETE" })
          .then(() => {
            closeModal();
            refreshCurrentList();
            showToast("Tweet deleted");
          })
          .catch((e) => showToast(e.message, true));
      });
    const postC = $("#btn-comment", body);
    if (postC)
      postC.addEventListener("click", () => {
        const content = $("#comment-content", body).value.trim();
        if (!content) return showToast("Comment cannot be empty", true);
        const bodyPayload = { content };
        if (state.replyToId) bodyPayload.parent_comment = state.replyToId;
        return apiRequest("/tweets/" + t.id + "/comments/", {
          method: "POST",
          body: bodyPayload,
        })
          .then(() => loadCommentsPage("/tweets/" + t.id + "/comments/", true))
          .then((bundle) => {
            state.modalComments = bundle.results;
            state.modalCommentsNext = bundle.next;
            state.replyToId = null;
            $("#comment-content", body).value = "";
            return apiRequest("/tweets/" + t.id + "/");
          })
          .then(({ data }) => {
            state.modalTweet = data;
            renderModal();
            refreshCurrentList();
            showToast("Comment added");
          })
          .catch((e) => showToast(e.message || "Comment failed", true));
      });
    const cancelR = $("#btn-cancel-reply", body);
    if (cancelR) {
      cancelR.addEventListener("click", () => {
        state.replyToId = null;
        updateReplyHint();
        cancelR.classList.add("hidden");
      });
    }
    const moreC = $("#btn-more-comments", body);
    if (moreC && state.modalCommentsNext)
      moreC.addEventListener("click", () =>
        loadCommentsPage(state.modalCommentsNext, false).then((bundle) => {
          state.modalComments = state.modalComments.concat(bundle.results);
          state.modalCommentsNext = bundle.next;
          renderModal();
        })
      );
  }

  function updateReplyHint() {
    const el = $("#reply-hint");
    if (!el) return;
    if (state.replyToId)
      el.textContent = "Replying to comment #" + state.replyToId;
    else el.textContent = "Top-level comment (use Reply on a comment to thread).";
    const cancel = $("#btn-cancel-reply");
    if (cancel) cancel.classList.toggle("hidden", !state.replyToId);
  }

  function renderCommentsList() {
    const list = $("#comments-list");
    if (!list) return;
    const items = state.modalComments || [];
    if (!items.length) {
      list.innerHTML = '<p class="muted">No comments yet.</p>';
      return;
    }
    list.innerHTML = items
      .map((c) => {
        const cu = c.user && c.user.username ? c.user.username : "?";
        const replyClass = c.parent_comment ? "comment reply" : "comment";
        return (
          '<div class="' +
          replyClass +
          '">' +
          '<div class="card-meta"><strong>@' +
          escapeHtml(cu) +
          "</strong> · #" +
          c.id +
          (c.parent_comment ? " · reply to #" + c.parent_comment : "") +
          "</div>" +
          '<div class="card-body">' +
          escapeHtml(c.content) +
          "</div>" +
          '<div class="row"><span class="muted">' +
          (c.replies_count ?? 0) +
          " replies</span>" +
          (state.access
            ? '<button type="button" class="btn btn-sm" data-reply="' + c.id + '">Reply</button>'
            : "") +
          "</div></div>"
        );
      })
      .join("");
    list.querySelectorAll("[data-reply]").forEach((b) =>
      b.addEventListener("click", () => {
        state.replyToId = parseInt(b.getAttribute("data-reply"), 10);
        updateReplyHint();
        const cancel = $("#btn-cancel-reply");
        if (cancel) cancel.classList.remove("hidden");
        const ta = $("#comment-content");
        if (ta) ta.focus();
      })
    );
  }

  function renderAll() {
    renderHeader();
    renderSidebar();
    renderGuest();
    renderAuth();
  }

  $("#modal-root").addEventListener("click", (e) => {
    if (e.target.matches("[data-close-modal]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  async function boot() {
    if (state.access) {
      try {
        await loadMe();
        await loadFeed(true);
        await loadTweets(true);
      } catch {
        clearAuth();
        showToast("Session expired. Please log in again.", true);
      }
    }
    renderAll();
  }

  boot();
})();
