export const config = {
  port: parseInt(process.env.PORT ?? "3000"),
  host: process.env.HOST ?? "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret-in-production",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? "change-this-refresh-secret",
  uploadDir: process.env.UPLOAD_DIR ?? "/uploads",
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiFootballKey: process.env.API_FOOTBALL_KEY ?? "",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  impulseLicenseKey: process.env.IMPULSE_LICENSE_KEY ?? "",
  // Kanonski javni URL sajta — koristi se za canonical linkove, OG tagove i sitemap.
  // Bez zavrsne kose crte.
  siteUrl: (process.env.SITE_URL ?? "https://fkmladostlucani.com").replace(/\/+$/, ""),
};
