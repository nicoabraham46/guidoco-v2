import { Resend } from "resend";
import { formatARS } from "./format";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
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
}: SendOrderConfirmationEmailParams): Promise<void> {
  console.log("[email] Sending order confirmation →", { to, orderId });
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
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #000000; padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                          ¡Gracias por tu compra!
                        </h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 32px;">
                        <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.5;">
                          Tu pedido ha sido recibido correctamente y está siendo procesado.
                        </p>

                        <!-- Order Details -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 16px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                                    ID del pedido:
                                  </td>
                                  <td align="right" style="padding: 8px 0; color: #111827; font-size: 14px; font-family: monospace;">
                                    ${orderId.slice(0, 8)}...
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                                    Total:
                                  </td>
                                  <td align="right" style="padding: 8px 0; color: #111827; font-size: 18px; font-weight: 600; border-top: 1px solid #e5e7eb;">
                                    $${formatARS(total)}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Next Steps -->
                        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                          <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                            Próximos pasos:
                          </p>
                          <p style="margin: 8px 0 0; color: #1e3a8a; font-size: 14px; line-height: 1.5;">
                            Nos pondremos en contacto contigo pronto para coordinar el pago y la entrega.
                          </p>
                        </div>

                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                          Si tienes alguna pregunta, no dudes en contactarnos.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} Guidoco. Todos los derechos reservados.
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
        to,
        orderId,
        statusCode: error.statusCode,
        name: error.name,
        message: error.message,
      });
      return;
    }

    console.log("[email] Sent successfully →", { to, orderId, emailId: data?.id });
  } catch (err) {
    console.error("[email] Unexpected error sending confirmation:", {
      to,
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
