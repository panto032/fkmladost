"use node";

import { v, ConvexError } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

type LicenseWarning = {
  type: string;
  message: string;
  daysRemaining?: number;
  graceDaysRemaining?: number;
  daysPastExpiry?: number;
};

type LicenseInfo = {
  key: string;
  status: string;
  type?: string;
  customerName?: string;
  customerEmail?: string;
  expiresAt?: string;
  daysRemaining?: number;
};

type ProductInfo = {
  name: string;
};

type ValidateResponse = {
  valid: boolean;
  status?: string;
  error?: string;
  message?: string;
  warning?: LicenseWarning;
  license?: LicenseInfo;
  product?: ProductInfo;
};

/** Validate a license key against the external API */
export const validateLicense = action({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<ValidateResponse> => {
    const response = await fetch("https://fine-tern-568.convex.site/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: args.key }),
    });

    if (!response.ok) {
      throw new ConvexError({
        message: "Greška pri proveri licence",
        code: "EXTERNAL_SERVICE_ERROR",
      });
    }

    const data = (await response.json()) as ValidateResponse;

    // If valid, save to database
    if (data.valid && data.license) {
      await ctx.runMutation(internal.licenseStore.saveLicense, {
        key: args.key,
        status: data.license.status || data.status || "active",
        customerName: data.license.customerName,
        customerEmail: data.license.customerEmail,
        expiresAt: data.license.expiresAt,
        productName: data.product?.name,
      });
    }

    return data;
  },
});
