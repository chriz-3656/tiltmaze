function corsHeaders(env, request) {
  const origin = request.headers.get("Origin") || "*";
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin === "*" ? "*" : origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(env, request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env, request)
    }
  });
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validUsername(username) {
  return /^[A-Za-z0-9_]{3,20}$/.test(username);
}

async function getAuthUser(env, request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT u.id, u.username, p.max_unlocked_level AS maxUnlockedLevel
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN progress p ON p.user_id = u.id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
  ).bind(tokenHash).first();

  return row || null;
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env, request) });
    }

    if (!url.pathname.startsWith("/api/")) {
      return jsonResponse(env, request, { ok: false, error: "Not found" }, 404);
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return jsonResponse(env, request, { ok: true, status: "healthy" });
      }

      if (url.pathname === "/api/login" && request.method === "POST") {
        const body = await parseJson(request);
        const usernameRaw = String(body.username || "").trim();
        if (!validUsername(usernameRaw)) {
          return jsonResponse(env, request, { ok: false, error: "Invalid username" }, 400);
        }

        const username = usernameRaw;
        await env.DB.prepare("INSERT OR IGNORE INTO users (username) VALUES (?)").bind(username).run();
        const user = await env.DB.prepare("SELECT id, username FROM users WHERE username = ?").bind(username).first();
        if (!user) {
          return jsonResponse(env, request, { ok: false, error: "Unable to create user" }, 500);
        }

        await env.DB.prepare("INSERT OR IGNORE INTO progress (user_id, max_unlocked_level) VALUES (?, 1)").bind(user.id).run();

        const token = randomToken();
        const tokenHash = await sha256Hex(token);
        await env.DB.prepare(
          "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))"
        ).bind(tokenHash, user.id).run();

        const progress = await env.DB.prepare(
          "SELECT max_unlocked_level AS maxUnlockedLevel FROM progress WHERE user_id = ?"
        ).bind(user.id).first();

        return jsonResponse(env, request, {
          ok: true,
          token,
          user,
          progress: progress || { maxUnlockedLevel: 1 }
        });
      }

      if (url.pathname === "/api/me" && request.method === "GET") {
        const authUser = await getAuthUser(env, request);
        if (!authUser) return jsonResponse(env, request, { ok: false, error: "Unauthorized" }, 401);
        return jsonResponse(env, request, {
          ok: true,
          user: { id: authUser.id, username: authUser.username }
        });
      }

      if (url.pathname === "/api/progress" && request.method === "GET") {
        const authUser = await getAuthUser(env, request);
        if (!authUser) return jsonResponse(env, request, { ok: false, error: "Unauthorized" }, 401);

        const progress = await env.DB.prepare(
          "SELECT max_unlocked_level AS maxUnlockedLevel FROM progress WHERE user_id = ?"
        ).bind(authUser.id).first();

        return jsonResponse(env, request, {
          ok: true,
          progress: progress || { maxUnlockedLevel: 1 }
        });
      }

      if (url.pathname === "/api/progress/unlock" && request.method === "POST") {
        const authUser = await getAuthUser(env, request);
        if (!authUser) return jsonResponse(env, request, { ok: false, error: "Unauthorized" }, 401);

        const body = await parseJson(request);
        const maxUnlockedLevel = Number(body.maxUnlockedLevel || 1);
        if (!Number.isInteger(maxUnlockedLevel) || maxUnlockedLevel < 1 || maxUnlockedLevel > 1000) {
          return jsonResponse(env, request, { ok: false, error: "Invalid level unlock value" }, 400);
        }

        await env.DB.prepare(
          `INSERT INTO progress (user_id, max_unlocked_level, updated_at)
           VALUES (?, ?, datetime('now'))
           ON CONFLICT(user_id) DO UPDATE SET
             max_unlocked_level = MAX(progress.max_unlocked_level, excluded.max_unlocked_level),
             updated_at = datetime('now')`
        ).bind(authUser.id, maxUnlockedLevel).run();

        const progress = await env.DB.prepare(
          "SELECT max_unlocked_level AS maxUnlockedLevel FROM progress WHERE user_id = ?"
        ).bind(authUser.id).first();

        return jsonResponse(env, request, { ok: true, progress });
      }

      if (url.pathname === "/api/leaderboard/submit" && request.method === "POST") {
        const authUser = await getAuthUser(env, request);
        if (!authUser) return jsonResponse(env, request, { ok: false, error: "Unauthorized" }, 401);

        const body = await parseJson(request);
        const level = Number(body.level);
        const timeMs = Number(body.timeMs);

        if (!Number.isInteger(level) || level < 1 || level > 1000) {
          return jsonResponse(env, request, { ok: false, error: "Invalid level" }, 400);
        }
        if (!Number.isInteger(timeMs) || timeMs < 200 || timeMs > 3600000) {
          return jsonResponse(env, request, { ok: false, error: "Invalid time" }, 400);
        }

        await env.DB.prepare(
          `INSERT INTO scores (user_id, level, best_time_ms, updated_at)
           VALUES (?, ?, ?, datetime('now'))
           ON CONFLICT(user_id, level) DO UPDATE SET
             best_time_ms = MIN(scores.best_time_ms, excluded.best_time_ms),
             updated_at = datetime('now')`
        ).bind(authUser.id, level, timeMs).run();

        const score = await env.DB.prepare(
          "SELECT best_time_ms AS bestTimeMs FROM scores WHERE user_id = ? AND level = ?"
        ).bind(authUser.id, level).first();

        return jsonResponse(env, request, { ok: true, score });
      }

      if (url.pathname === "/api/leaderboard" && request.method === "GET") {
        const level = Number(url.searchParams.get("level") || 1);
        const limitRaw = Number(url.searchParams.get("limit") || 20);
        const limit = Math.max(1, Math.min(50, Number.isInteger(limitRaw) ? limitRaw : 20));

        if (!Number.isInteger(level) || level < 1 || level > 1000) {
          return jsonResponse(env, request, { ok: false, error: "Invalid level" }, 400);
        }

        const { results } = await env.DB.prepare(
          `SELECT u.username, s.best_time_ms AS timeMs
           FROM scores s
           JOIN users u ON u.id = s.user_id
           WHERE s.level = ?
           ORDER BY s.best_time_ms ASC, s.updated_at ASC
           LIMIT ?`
        ).bind(level, limit).all();

        return jsonResponse(env, request, {
          ok: true,
          level,
          entries: results || []
        });
      }

      if (url.pathname === "/api/creator" && request.method === "GET") {
        return jsonResponse(env, request, {
          ok: true,
          creator: {
            name: env.CREATOR_NAME || "TiltMaze Creator",
            bio: env.CREATOR_BIO || "Built TiltMaze with JavaScript and Cloudflare.",
            website: env.CREATOR_WEBSITE || "https://example.com"
          }
        });
      }

      return jsonResponse(env, request, { ok: false, error: "Not found" }, 404);
    } catch (error) {
      return jsonResponse(env, request, {
        ok: false,
        error: "Internal server error",
        detail: error.message
      }, 500);
    }
  }
};
