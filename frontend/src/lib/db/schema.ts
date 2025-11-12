import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, decimal } from "drizzle-orm/pg-core";

// ========================================
// Tables Better-auth (créées automatiquement)
// ========================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ========================================
// Tables AuditIQ
// ========================================

export const auditSessions = pgTable("audit_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id),
  companyName: text("company_name"),
  sector: text("sector"),
  useCase: text("use_case"), // 'recruitment', 'scoring', 'customer_service'
  datasetSize: integer("dataset_size"),
  status: text("status").default("in_progress"),
  results: jsonb("results"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  reportGeneratedAt: timestamp("report_generated_at"),
});

export const fairnessMetrics = pgTable("fairness_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditSessionId: uuid("audit_session_id").references(() => auditSessions.id),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 5, scale: 4 }),
  thresholdPassed: boolean("threshold_passed"),
  groupAnalysis: jsonb("group_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditSessionId: uuid("audit_session_id").references(() => auditSessions.id),
  filename: text("filename").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  storagePath: text("storage_path"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  anonymized: boolean("anonymized").default(false),
});

// Types
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type AuditSession = typeof auditSessions.$inferSelect;
export type NewAuditSession = typeof auditSessions.$inferInsert;