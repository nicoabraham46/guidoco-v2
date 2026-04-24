import { Resend } from "resend";
import { formatARS } from "./format";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  product_id?: string | null;
  image_url?: string | null;
  slug?: string | null;
};

type SendAdminOrderNotificationParams = {
  orderId: string;
  total: number;
  customerEmail: string;
  items: OrderItem[];
};

type SendOrderConfirmationEmailParams = {
  to: string;
  orderId: string;
  total: number;
  items?: OrderItem[];
  customerName?: string;
};

export async function sendAdminOrderNotification({
  orderId,
  total,
  customerEmail,
  items,
}: SendAdminOrderNotificationParams): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("[email][admin] ADMIN_EMAIL env var not set — skipping notification");
    return;
  }

  console.log("[email][admin] Sending order notification →", { orderId, customerEmail });
  try {
    const itemsRows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${item.product_name}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">$${formatARS(item.unit_price)}</td>
          </tr>`
      )
      .join("");

    const { data, error } = await resend.emails.send({
      from: "Guidoco <onboarding@resend.dev>",
      to: adminEmail,
      subject: `Nuevo pedido #${orderId.slice(0, 8)} — $${formatARS(total)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Nuevo pedido</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="background-color: #1e40af; padding: 24px 32px;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Nuevo pedido recibido</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 140px;">ID del pedido:</td>
                            <td style="padding: 6px 0; color: #111827; font-size: 14px; font-family: monospace;">${orderId}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Cliente:</td>
                            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${customerEmail}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Total:</td>
                            <td style="padding: 6px 0; color: #111827; font-size: 18px; font-weight: 700;">$${formatARS(total)}</td>
                          </tr>
                        </table>

                        <h2 style="margin: 0 0 12px; color: #111827; font-size: 15px; font-weight: 600;">Productos</h2>
                        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                          <thead>
                            <tr style="background-color: #f9fafb;">
                              <th style="padding: 8px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Producto</th>
                              <th style="padding: 8px 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Cant.</th>
                              <th style="padding: 8px 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Precio unit.</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${itemsRows}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">Guidoco — notificación interna</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[email][admin] Resend API error:", {
        statusCode: error.statusCode,
        name: error.name,
        message: error.message,
      });
      return;
    }

    console.log("[email][admin] Sent successfully →", { orderId, emailId: data?.id });
  } catch (err) {
    console.error("[email][admin] Unexpected error:", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  total,
  items = [],
  customerName,
}: SendOrderConfirmationEmailParams): Promise<void> {
  console.log("[email] Sending order confirmation →", { to, orderId });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://guidoco-v2.vercel.app";

  const itemsHtml = items.map((item) => {
    const productUrl = item.slug ? `${baseUrl}/p/${item.slug}` : baseUrl;
    const imageHtml = item.image_url
      ? `<td style="padding: 16px; width: 80px; vertical-align: top;">
           <a href="${productUrl}" style="text-decoration: none;">
             <img src="${item.image_url}" alt="${item.product_name}" width="70" height="70" style="border-radius: 8px; object-fit: cover; display: block;" />
           </a>
         </td>`
      : `<td style="padding: 16px; width: 80px; vertical-align: top;">
           <div style="width: 70px; height: 70px; border-radius: 8px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
             <span style="color: #d1d5db; font-size: 24px;">📦</span>
           </div>
         </td>`;

    return `
      <tr>
        ${imageHtml}
        <td style="padding: 16px 16px 16px 0; vertical-align: top;">
          <a href="${productUrl}" style="text-decoration: none; color: #111827; font-size: 14px; font-weight: 600; display: block; margin-bottom: 4px;">
            ${item.product_name}
          </a>
          <p style="margin: 0; color: #6b7280; font-size: 13px;">
            Cantidad: ${item.quantity} × $${formatARS(item.unit_price)}
          </p>
        </td>
        <td style="padding: 16px 0; vertical-align: top; text-align: right;">
          <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">
            $${formatARS(item.unit_price * item.quantity)}
          </p>
        </td>
      </tr>`;
  }).join("");

  const greeting = customerName ? `¡Hola ${customerName}!` : "¡Hola!";

  try {
    const { data, error } = await resend.emails.send({
      from: "Guidoco <onboarding@resend.dev>",
      to,
      subject: "¡Gracias por tu compra! - Confirmación de pedido",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de pedido</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8ecf0;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 32px 16px;">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse;">

                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${baseUrl}" style="text-decoration: none;">
                          <img src="${baseUrl}/logo.png" alt="Guidoco" width="60" height="60" style="border-radius: 12px; display: block;" />
                        </a>
                      </td>
                    </tr>

                    <!-- Card principal -->
                    <tr>
                      <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">

                          <!-- Header rojo -->
                          <tr>
                            <td style="background-color: #C0392B; padding: 32px; text-align: center;">
                              <div style="font-size: 36px; margin-bottom: 12px;">✓</div>
                              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                                ¡Compra confirmada!
                              </h1>
                              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                                Tu pago fue procesado exitosamente
                              </p>
                            </td>
                          </tr>

                          <!-- Saludo -->
                          <tr>
                            <td style="padding: 32px 32px 16px;">
                              <p style="margin: 0; color: #111827; font-size: 16px; line-height: 1.6;">
                                ${greeting} Gracias por elegir <strong>Guidoco</strong>. Tu pedido ya está siendo preparado.
                              </p>
                            </td>
                          </tr>

                          <!-- Info del pedido -->
                          <tr>
                            <td style="padding: 0 32px 24px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 10px; overflow: hidden;">
                                <tr>
                                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280; font-size: 13px;">N° de pedido</span>
                                  </td>
                                  <td align="right" style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #111827; font-size: 13px; font-family: monospace; font-weight: 600;">#${orderId.slice(0, 8)}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 14px 16px;">
                                    <span style="color: #6b7280; font-size: 13px;">Estado</span>
                                  </td>
                                  <td align="right" style="padding: 14px 16px;">
                                    <span style="display: inline-block; background-color: #dcfce7; color: #166534; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;">Pagado ✓</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Productos -->
                          ${items.length > 0 ? `
                          <tr>
                            <td style="padding: 0 32px 8px;">
                              <h2 style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">Tus productos</h2>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 0 32px 24px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                                ${itemsHtml}
                              </table>
                            </td>
                          </tr>
                          ` : ""}

                          <!-- Total -->
                          <tr>
                            <td style="padding: 0 32px 32px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 10px; overflow: hidden;">
                                <tr>
                                  <td style="padding: 20px 24px;">
                                    <span style="color: rgba(255,255,255,0.7); font-size: 14px;">Total pagado</span>
                                  </td>
                                  <td align="right" style="padding: 20px 24px;">
                                    <span style="color: #ffffff; font-size: 22px; font-weight: 700;">$${formatARS(total)}</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Próximos pasos -->
                          <tr>
                            <td style="padding: 0 32px 32px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-radius: 10px; border: 1px solid #fde68a; overflow: hidden;">
                                <tr>
                                  <td style="padding: 20px;">
                                    <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">📦 Próximos pasos</p>
                                    <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6;">
                                      Nos pondremos en contacto por WhatsApp o email para coordinar el envío. Si tenés alguna consulta, no dudes en escribirnos.
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Botón WhatsApp -->
                          <tr>
                            <td align="center" style="padding: 0 32px 32px;">
                              <a href="https://wa.me/5491159599081" style="display: inline-block; background-color: #25D366; color: #ffffff; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                                💬 Contactanos por WhatsApp
                              </a>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 16px; text-align: center;">
                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                          <a href="${baseUrl}" style="color: #C0392B; text-decoration: none; font-weight: 600;">Guidoco</a> · Bernal Centro, Buenos Aires
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                          © ${new Date().getFullYear()} Guidoco Collectibles. Todos los derechos reservados.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[email] Resend API error:", {
        to, orderId, statusCode: error.statusCode, name: error.name, message: error.message,
      });
      return;
    }

    console.log("[email] Sent successfully →", { to, orderId, emailId: data?.id });
  } catch (err) {
    console.error("[email] Unexpected error sending confirmation:", {
      to, orderId, error: err instanceof Error ? err.message : String(err),
    });
  }
}
