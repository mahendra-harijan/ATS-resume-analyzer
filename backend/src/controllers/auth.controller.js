const { z } = require("zod");

const authService = require("../services/auth.service");

const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1).max(72),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

function getClientMeta(req) {
  return {
    ip: (req.headers["x-forwarded-for"] && String(req.headers["x-forwarded-for"])) || req.ip || "",
    userAgent: req.headers["user-agent"] ? String(req.headers["user-agent"]) : "",
  };
}

async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid signup data" });

  const { name, email, password } = parsed.data;
  const meta = getClientMeta(req);
  const tokens = await authService.signup({ name, email, password, ip: meta.ip, userAgent: meta.userAgent });

  return res.status(201).json({
    success: true,
    user: { name, email },
    tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
  });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid login data" });

  const { email, password } = parsed.data;
  const meta = getClientMeta(req);
  const tokens = await authService.login({ email, password, ip: meta.ip, userAgent: meta.userAgent });

  return res.json({
    success: true,
    tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
  });
}

async function refresh(req, res) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid refresh data" });

  const meta = getClientMeta(req);
  const tokens = await authService.refresh({
    refreshToken: parsed.data.refreshToken,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return res.json({ success: true, tokens });
}

async function logout(req, res) {
  const parsed = logoutSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid logout data" });

  await authService.logout({ refreshToken: parsed.data.refreshToken });
  return res.json({ success: true });
}

module.exports = { signup, login, refresh, logout };

