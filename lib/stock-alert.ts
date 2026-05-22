// ============================================================
// lib/stock-alert.ts
// ============================================================
// Sends low stock alert emails to the admin via Resend.
// Called from the webhook after stock is decremented.
// ============================================================

import { resend } from '@/lib/email';
const LOW_STOCK_THRESHOLD = parseInt(
  process.env.LOW_STOCK_THRESHOLD ?? '5',
  10,
);

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
}

export { LOW_STOCK_THRESHOLD };

export async function sendLowStockAlert(
  products: LowStockProduct[],
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  Skipping stock alert — RESEND_API_KEY not set.');
    return;
  }

  const adminEmail =
    process.env.ADMIN_ALERT_EMAIL ?? process.env.EMAIL_TEST_ADDRESS;
  if (!adminEmail) {
    console.warn('⚠️  Skipping stock alert — ADMIN_ALERT_EMAIL not set.');
    return;
  }

  const from = process.env.EMAIL_FROM_DOMAIN
    ? `MyStore Alerts <alerts@${process.env.EMAIL_FROM_DOMAIN}>`
    : 'MyStore Alerts <onboarding@resend.dev>';

  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0);

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const rows = products
    .map(
      (p) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;color:#374151;">
          ${p.name}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;text-align:center;">
          <span style="
            display:inline-block;
            padding:2px 10px;
            border-radius:9999px;
            font-size:12px;
            font-weight:600;
            background:${p.stock === 0 ? '#FEE2E2' : '#FEF9C3'};
            color:${p.stock === 0 ? '#DC2626' : '#854D0E'};
          ">
            ${p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
          </span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;text-align:right;">
          <a href="${baseUrl}/admin/products/${p.id}"
            style="font-size:13px;color:#1E3A5F;font-weight:600;text-decoration:none;">
            Update →
          </a>
        </td>
      </tr>`,
    )
    .join('');

  const subject =
    outOfStock.length > 0
      ? `🚨 ${outOfStock.length} product${outOfStock.length !== 1 ? 's' : ''} out of stock — MyStore`
      : `⚠️ Low stock alert — ${lowStock.length} product${lowStock.length !== 1 ? 's' : ''} running low`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Stock Alert</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1E3A5F;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">
                My<span style="color:#F97316;">Store</span>
                <span style="font-size:13px;font-weight:400;opacity:0.7;margin-left:8px;">Stock Alert</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0F172A;">
                ${outOfStock.length > 0 ? '🚨 Stock Alert' : '⚠️ Low Stock Warning'}
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;">
                ${
                  outOfStock.length > 0
                    ? `${outOfStock.length} product${outOfStock.length !== 1 ? 's are' : ' is'} out of stock and need restocking immediately.`
                    : `${lowStock.length} product${lowStock.length !== 1 ? 's are' : ' is'} running low (${LOW_STOCK_THRESHOLD} or fewer units remaining).`
                }
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="background:#F8FAFC;">
                    <th style="padding:8px 0;text-align:left;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Product</th>
                    <th style="padding:8px 0;text-align:center;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Stock</th>
                    <th style="padding:8px 0;text-align:right;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Action</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <div style="margin-top:28px;text-align:center;">
                <a href="${baseUrl}/admin/products"
                  style="display:inline-block;background:#1E3A5F;color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
                  Manage Inventory
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:16px 32px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                © ${new Date().getFullYear()} MyStore · This is an automated inventory alert.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: adminEmail,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Stock alert email error:', error);
    } else {
      console.log(
        `✅ Stock alert sent to ${adminEmail} for ${products.length} product(s)`,
      );
    }
  } catch (err) {
    console.error('❌ Failed to send stock alert:', err);
  }
}
