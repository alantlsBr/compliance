import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import sql from "mssql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const EVIDENCE_DIR = path.join(DATA_DIR, "evidencias");
const EMAIL_TO = process.env.COMPLAINT_EMAIL_TO || "alan.oliveira@fomentas.com.br";
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

type EvidenceFile = {
  name: string;
  type: string;
  size: number;
  content?: string;
};

type ComplaintPayload = {
  anonymous: boolean;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  harassment_types: string[];
  first_episode_date?: string;
  last_episode_date?: string;
  location?: string;
  description: string;
  aggressor_names: string;
  aggressor_role?: string;
  witness_names?: string;
  evidence_files?: EvidenceFile[];
  wants_contact: boolean;
  contact_channel?: string;
  declaration: boolean;
  authorization: boolean;
  captcha_token?: string;
};

type StoredComplaint = Omit<ComplaintPayload, "evidence_files" | "captcha_token"> & {
  id: string;
  protocol: string;
  status: "received";
  created_at: string;
  evidence_files: Array<{
    original_name: string;
    stored_name: string;
    type: string;
    size: number;
    path: string;
  }>;
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

async function ensureStorage() {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
}

function getSqlConfig(): sql.config {
  const server = process.env.SQLSERVER_HOST;
  const database = process.env.SQLSERVER_DATABASE;
  const user = process.env.SQLSERVER_USER;
  const password = process.env.SQLSERVER_PASSWORD;
  const port = Number(process.env.SQLSERVER_PORT || 1433);

  if (!server || !database || !user || !password) {
    throw new Error("Banco SQL Server não configurado. Revise as variáveis SQLSERVER_* no arquivo .env.");
  }

  return {
    server,
    database,
    user,
    password,
    port,
    options: {
      encrypt: String(process.env.SQLSERVER_ENCRYPT || "true").toLowerCase() === "true",
      trustServerCertificate:
        String(process.env.SQLSERVER_TRUST_CERTIFICATE || "false").toLowerCase() === "true",
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(getSqlConfig()).connect();
  }
  return poolPromise;
}

function generateProtocol() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `DEN-${yyyymmdd}-${suffix}`;
}

function validateComplaint(payload: ComplaintPayload) {
  if (!payload || typeof payload !== "object") return "Payload inválido.";
  if (!payload.anonymous && (!payload.reporter_name?.trim() || !payload.reporter_email?.trim())) {
    return "Nome e e-mail são obrigatórios quando a denúncia não é anônima.";
  }
  if (!Array.isArray(payload.harassment_types) || payload.harassment_types.length === 0) {
    return "Informe pelo menos um tipo de denúncia.";
  }
  if (!payload.description?.trim()) return "A descrição é obrigatória.";
  if (!payload.aggressor_names?.trim()) return "O nome do envolvido/agressor é obrigatório.";
  if (!payload.declaration || !payload.authorization) return "Declaração e autorização são obrigatórias.";
  if (process.env.RECAPTCHA_SECRET_KEY && !payload.captcha_token) return "Validação reCAPTCHA obrigatória.";
  const evidenceFiles = payload.evidence_files || [];
  const totalSize = evidenceFiles.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (totalSize > MAX_ATTACHMENT_BYTES) return "O tamanho total dos anexos não pode exceder 20MB.";
  return null;
}

async function validateCaptcha(token?: string, ip?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) formData.append("remoteip", ip);

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}
 
function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

async function saveEvidenceFiles(protocol: string, files: EvidenceFile[] = []) {
  const protocolDir = path.join(EVIDENCE_DIR, protocol);
  await fs.mkdir(protocolDir, { recursive: true });

  const savedFiles: StoredComplaint["evidence_files"] = [];
  for (const file of files) {
    if (!file.content) continue;
    const base64 = file.content.includes(",") ? file.content.split(",").pop() || "" : file.content;
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_ATTACHMENT_BYTES) continue;
    const storedName = `${crypto.randomBytes(6).toString("hex")}-${sanitizeFileName(file.name || "evidencia")}`;
    const filePath = path.join(protocolDir, storedName);
    await fs.writeFile(filePath, buffer);
    savedFiles.push({
      original_name: file.name,
      stored_name: storedName,
      type: file.type || "application/octet-stream",
      size: buffer.length,
      path: filePath,
    });
  }
  return savedFiles;
}

function dateOrNull(value?: string) {
  return value?.trim() ? new Date(`${value}T00:00:00`) : null;
}

async function saveComplaintToDatabase(record: StoredComplaint) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const complaintResult = await new sql.Request(transaction)
      .input("Id", sql.UniqueIdentifier, record.id)
      .input("Protocolo", sql.VarChar(40), record.protocol)
      .input("Anonima", sql.Bit, record.anonymous)
      .input("DenuncianteNome", sql.NVarChar(200), record.anonymous ? null : record.reporter_name || null)
      .input("DenuncianteEmail", sql.NVarChar(200), record.anonymous ? null : record.reporter_email || null)
      .input("DenuncianteTelefone", sql.NVarChar(50), record.anonymous ? null : record.reporter_phone || null)
      .input("TiposDenuncia", sql.NVarChar(500), record.harassment_types.join(", "))
      .input("PrimeiroEpisodio", sql.Date, dateOrNull(record.first_episode_date))
      .input("UltimoEpisodio", sql.Date, dateOrNull(record.last_episode_date))
      .input("LocalOcorrencia", sql.NVarChar(200), record.location || null)
      .input("Descricao", sql.NVarChar(sql.MAX), record.description)
      .input("Envolvidos", sql.NVarChar(500), record.aggressor_names)
      .input("CargoAreaEnvolvido", sql.NVarChar(200), record.aggressor_role || null)
      .input("Testemunhas", sql.NVarChar(500), record.witness_names || null)
      .input("DesejaContato", sql.Bit, record.wants_contact)
      .input("CanalContato", sql.NVarChar(100), record.contact_channel || null)
      .input("Declaracao", sql.Bit, record.declaration)
      .input("Autorizacao", sql.Bit, record.authorization)
      .input("Status", sql.VarChar(30), record.status)
      .query(`
        INSERT INTO dbo.ComplianceDenuncia (
          Id, Protocolo, Anonima, DenuncianteNome, DenuncianteEmail, DenuncianteTelefone,
          TiposDenuncia, PrimeiroEpisodio, UltimoEpisodio, LocalOcorrencia, Descricao,
          Envolvidos, CargoAreaEnvolvido, Testemunhas, DesejaContato, CanalContato,
          Declaracao, Autorizacao, Status
        )
        OUTPUT INSERTED.Codigo
        VALUES (
          @Id, @Protocolo, @Anonima, @DenuncianteNome, @DenuncianteEmail, @DenuncianteTelefone,
          @TiposDenuncia, @PrimeiroEpisodio, @UltimoEpisodio, @LocalOcorrencia, @Descricao,
          @Envolvidos, @CargoAreaEnvolvido, @Testemunhas, @DesejaContato, @CanalContato,
          @Declaracao, @Autorizacao, @Status
        );
      `);

    const complaintCode = complaintResult.recordset[0].Codigo as number;

    for (const file of record.evidence_files) {
      await new sql.Request(transaction)
        .input("DenunciaCodigo", sql.Int, complaintCode)
        .input("NomeOriginal", sql.NVarChar(255), file.original_name)
        .input("NomeArmazenado", sql.NVarChar(255), file.stored_name)
        .input("MimeType", sql.NVarChar(150), file.type)
        .input("TamanhoBytes", sql.BigInt, file.size)
        .input("CaminhoArquivo", sql.NVarChar(1000), file.path)
        .query(`
          INSERT INTO dbo.ComplianceAnexo (
            DenunciaCodigo, NomeOriginal, NomeArmazenado, MimeType, TamanhoBytes, CaminhoArquivo
          ) VALUES (
            @DenunciaCodigo, @NomeOriginal, @NomeArmazenado, @MimeType, @TamanhoBytes, @CaminhoArquivo
          );
        `);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

function buildEmailHtml(record: StoredComplaint) {
  const item = (label: string, value?: string | boolean | string[]) => {
    const formatted = Array.isArray(value) ? value.join(", ") : value;
    return `<p><strong>${label}:</strong> ${formatted || "Não informado"}</p>`;
  };

  return `
    <h2>Nova denúncia registrada</h2>
    ${item("Protocolo", record.protocol)}
    ${item("Data de registro", new Date(record.created_at).toLocaleString("pt-BR"))}
    ${item("Anônima", record.anonymous ? "Sim" : "Não")}
    ${item("Nome", record.anonymous ? "Não informado - denúncia anônima" : record.reporter_name)}
    ${item("E-mail", record.anonymous ? "Não informado - denúncia anônima" : record.reporter_email)}
    ${item("Telefone", record.anonymous ? "Não informado - denúncia anônima" : record.reporter_phone)}
    ${item("Tipos", record.harassment_types)}
    ${item("Primeiro episódio", record.first_episode_date)}
    ${item("Último episódio", record.last_episode_date)}
    ${item("Local", record.location)}
    ${item("Envolvido(s)/agressor(es)", record.aggressor_names)}
    ${item("Cargo/área do envolvido", record.aggressor_role)}
    ${item("Testemunhas", record.witness_names)}
    ${item("Deseja contato", record.wants_contact ? "Sim" : "Não")}
    ${item("Canal preferido", record.contact_channel)}
    <hr />
    <h3>Descrição</h3>
    <p style="white-space: pre-wrap;">${record.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    <hr />
    ${item("Anexos", record.evidence_files.length ? record.evidence_files.map((file) => file.original_name).join(", ") : "Nenhum")}
  `;
}

async function sendComplaintEmail(record: StoredComplaint) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    console.warn("SMTP não configurado. Denúncia registrada sem envio de e-mail.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: EMAIL_TO,
    subject: `Nova denúncia registrada - ${record.protocol}`,
    html: buildEmailHtml(record),
    attachments: record.evidence_files.map((file) => ({
      filename: file.original_name,
      path: file.path,
      contentType: file.type,
    })),
  });
}

async function startServer() {
  await ensureStorage();

  const app = express();
  const server = createServer(app);

  app.disable("x-powered-by");
  app.use(express.json({ limit: "30mb" }));
  app.set("trust proxy", true);

  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!err) {
      next();
      return;
    }

    const message = err instanceof Error ? err.message : "Erro inesperado ao processar a requisição.";
    if (message.toLowerCase().includes("request entity too large")) {
      res.status(413).json({ success: false, message: "O envio excedeu o tamanho máximo permitido." });
      return;
    }

    res.status(400).json({ success: false, message: "Requisição inválida. Verifique os dados enviados." });
  });

  app.get("/api/health", async (_req, res) => {
    try {
      await getPool();
      res.json({ success: true, database: "connected" });
    } catch (error) {
      res.status(500).json({ success: false, database: "error" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const payload = req.body as ComplaintPayload;
      const validationError = validateComplaint(payload);
      if (validationError) {
        res.status(400).json({ success: false, message: validationError });
        return;
      }

      const captchaOk = await validateCaptcha(payload.captcha_token, req.ip);
      if (!captchaOk) {
        res.status(400).json({ success: false, message: "Falha na validação reCAPTCHA. Atualize a página e tente novamente." });
        return;
      }

      const protocol = generateProtocol();
      const evidenceFiles = await saveEvidenceFiles(protocol, payload.evidence_files || []);
      const { captcha_token: _captchaToken, ...payloadWithoutCaptcha } = payload;
      const record: StoredComplaint = {
        ...payloadWithoutCaptcha,
        id: crypto.randomUUID(),
        protocol,
        status: "received",
        created_at: new Date().toISOString(),
        evidence_files: evidenceFiles,
      };

      await saveComplaintToDatabase(record);
      await sendComplaintEmail(record);

      res.status(201).json({ success: true, protocol });
    } catch (error) {
      console.error("Erro ao registrar denúncia:", error);
      res.status(500).json({ success: false, message: "Não foi possível registrar a denúncia." });
    }
  });

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.use("/api", (_req, res) => {
    res.status(404).json({ success: false, message: "Endpoint da API não encontrado." });
  });

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
