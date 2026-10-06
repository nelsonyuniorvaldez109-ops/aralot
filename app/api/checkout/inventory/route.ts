import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isIP } from "node:net";
import {
  COOKIE,
  keyedHash,
  newSession,
  readSession,
  validCsrf,
} from "@/lib/checkout/session";
import {
  CheckoutError,
  normalizeOrder,
  readBody,
} from "@/lib/checkout/request";
import { buildWhatsAppUrl } from "@/lib/whatsapp-order";
import type { Receipt } from "@/components/checkout/receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);

    // Desarrollo local:
    // permite únicamente HTTP desde localhost/127.0.0.1.
    if (process.env.NODE_ENV === "development") {
      return (
        originUrl.protocol === "http:" &&
        (
          originUrl.hostname === "127.0.0.1" ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "::1"
        )
      );
    }

    // Producción: el origen debe coincidir exactamente
    // con el origen de la petición.
    const expectedOrigin = new URL(request.url).origin;

    return origin === expectedOrigin;
  } catch {
    return false;
  }
}

async function handle(request: NextRequest) {
  try {
    const secret = process.env.SUPABASE_SECRET_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!secret || !url) {
      throw new CheckoutError(503, "Checkout no disponible.");
    }

    const header = process.env.CHECKOUT_TRUSTED_IP_HEADER;

    const ip = header
      ? request.headers.get(header)?.trim()
      : process.env.NODE_ENV !== "production"
        ? "127.0.0.1"
        : undefined;

    if (!ip || !isIP(ip)) {
      throw new CheckoutError(503, "Checkout no disponible.");
    }

    const db = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    async function rpc(
      name: string,
      args: Record<string, unknown>,
    ) {
      const { data, error } = await db.rpc(name, args);

      if (error) {
        const errors: Record<string, [number, string]> = {
          ORDER_NOT_CONFIRMABLE: [409, "La reserva fue cancelada o ha vencido. Prepara otro pedido."],
          ORDER_CONFLICT: [
            409,
            "Este pedido ya contiene otros datos. Recupera o cancela la reserva antes de crear otro.",
          ],

          ORDER_NOT_FOUND: [
            404,
            "Pedido no disponible.",
          ],

          INSUFFICIENT_STOCK: [
            409,
            "El stock disponible cambió. Revisa tu carrito.",
          ],

          VARIANT_NOT_AVAILABLE: [
            409,
            "Un producto ya no está disponible. Revisa tu carrito.",
          ],

          INVALID_QUANTITY: [
            400,
            "Revisa las cantidades del pedido (máximo 20 por producto).",
          ],

          PICKUP_DISABLED: [
            409,
            "La recogida no está disponible actualmente.",
          ],

          RATE_LIMIT: [
            429,
            "Demasiadas solicitudes. Inténtalo más tarde.",
          ],
        };

        const known = Object.entries(errors).find(([key]) =>
          error.message.includes(key),
        );

        if (known) {
          throw new CheckoutError(...known[1]);
        }

        throw new CheckoutError(
          503,
          "No se pudo completar la solicitud. Puedes recuperar el pedido e intentarlo nuevamente.",
        );
      }

      return data;
    }

    const ipKey = keyedHash(secret, "ip:" + ip);

    for (
      const [key, limit] of [
        ["requests:global", 1000],
        ["requests:ip:" + ipKey, 60],
      ] as const
    ) {
      const allowed = await rpc("checkout_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window: 60,
      });

      if (!allowed) {
        throw new CheckoutError(
          429,
          "Demasiadas solicitudes. Inténtalo más tarde.",
        );
      }
    }

    let session = readSession(
      request.cookies.get(COOKIE)?.value,
      secret,
    );

    if (request.method === "POST") {
      if (
        !session ||
        !validCsrf(
          session,
          request.headers.get("x-checkout-csrf"),
        )
      ) {
        throw new CheckoutError(
          403,
          "Recarga el checkout para continuar.",
        );
      }

      if (!isAllowedOrigin(request)) {
        throw new CheckoutError(
          403,
          "Solicitud no permitida.",
        );
      }
    }

    session ??= newSession(secret);

    let order;

    if (request.method === "GET") {
      order = await rpc("checkout_read", {
        p_id: session.id,
        p_owner: session.owner,
      });
    } else {
      const body = await readBody(request);

      if (body?.action === "confirm") {
        if (body.checkoutId !== session.id) {
          throw new CheckoutError(409, "Recarga el checkout para recuperar el pedido actual.");
        }
        order = await rpc("checkout_confirm", {
          p_id: session.id,
          p_owner: session.owner,
        });
      } else if (body?.action === "cancel") {
        await rpc("checkout_release", {
          p_id: session.id,
          p_owner: session.owner,
          p_reason: "cancelled",
        });

        order = await rpc("checkout_read", {
          p_id: session.id,
          p_owner: session.owner,
        });
      } else if (body?.action === "new") {
        order = await rpc("checkout_read", {
          p_id: session.id,
          p_owner: session.owner,
        });

        if (order?.status === "reserved") {
          throw new CheckoutError(
            409,
            "Cancela la reserva actual antes de crear otro pedido.",
          );
        }

        session = newSession(secret);
        order = null;
      } else {
        const normalized = normalizeOrder(body);

        if (normalized.checkoutId !== session.id) {
          throw new CheckoutError(
            409,
            "Recarga el checkout para recuperar el pedido actual.",
          );
        }

        order = await rpc("checkout_reserve", {
          p_id: session.id,
          p_owner: session.owner,

          p_content: {
            customer: normalized.customer,
            items: normalized.items,
          },

          p_ip_key: ipKey,

          p_phone_key: keyedHash(
            secret,
            "phone:" + normalized.customer.phone,
          ),
        });
      }
    }

    let receipt: Receipt | undefined;

    if (order) {
      receipt = {
        id: order.id,

        date: new Date(
          order.created_at,
        ).toLocaleString("es-DO", {
          timeZone: "America/Santo_Domingo",
        }),

        customer: order.customer,
        items: order.items,

        subtotal: Number(order.subtotal),
        total: Number(order.total),

        deliveryFee: Number(order.delivery_fee),

        shippingMessage:
          order.shipping_message,

        whatsappNumber:
          order.whatsapp_number,

        status: order.status,

        expiresAt:
          order.expires_at,

        whatsappUrl: null,
      };

      receipt.whatsappUrl = buildWhatsAppUrl(
        receipt.whatsappNumber,
        receipt.items,
        receipt.customer,
        receipt,
        receipt.deliveryFee,
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        checkoutId: session.id,
        csrf: session.csrf,
        receipt: receipt ?? null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, private",
        },
      },
    );

    response.cookies.set(
      COOKIE,
      session.cookie,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "strict",

        path: "/",

        maxAge: 604800,
      },
    );

    return response;
  } catch (error) {
    const status =
      error instanceof CheckoutError
        ? error.status
        : 503;

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof CheckoutError
            ? error.message
            : "Checkout no disponible. Inténtalo nuevamente.",
      },
      {
        status,

        headers: {
          "Cache-Control": "no-store",

          ...(status === 429
            ? {
                "Retry-After": "60",
              }
            : {}),
        },
      },
    );
  }
}

export const GET = handle;
export const POST = handle;
