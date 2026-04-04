import { config } from "./config.js";

interface LicenseResponse {
  valid: boolean;
  plan?: "monthly" | "yearly";
  expiresAt?: string;
  daysLeft?: number;
  reason?: "expired" | "suspended" | "invalid";
}

interface LicenseState {
  valid: boolean;
  checked: boolean;
  reason?: string;
  plan?: string;
  expiresAt?: string;
  daysLeft?: number;
}

const state: LicenseState = { valid: true, checked: false };

export async function verifyLicense(): Promise<void> {
  const key = config.impulseLicenseKey;

  if (!key) {
    console.warn("[IMPULSE] No IMPULSE_LICENSE_KEY set — skipping license check");
    state.valid = true;
    state.checked = true;
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("https://app.impulsee.dev/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[IMPULSE] License server returned ${res.status} — allowing access`);
      state.valid = true;
      state.checked = true;
      return;
    }

    const data = (await res.json()) as LicenseResponse;

    state.valid = data.valid;
    state.checked = true;
    state.plan = data.plan;
    state.expiresAt = data.expiresAt;
    state.daysLeft = data.daysLeft;
    state.reason = data.reason;

    if (data.valid) {
      console.log(
        `[IMPULSE] License valid — plan: ${data.plan}, expires: ${data.expiresAt}, days left: ${data.daysLeft}`
      );
    } else {
      console.warn(`[IMPULSE] License invalid — reason: ${data.reason}`);
    }
  } catch {
    // Network error / timeout — don't block
    console.warn("[IMPULSE] License check failed (offline/timeout) — allowing access");
    state.valid = true;
    state.checked = true;
  }
}

export function getLicenseState(): LicenseState {
  return { ...state };
}

export function isLicenseValid(): boolean {
  // If never checked (shouldn't happen), allow access
  if (!state.checked) return true;
  return state.valid;
}
