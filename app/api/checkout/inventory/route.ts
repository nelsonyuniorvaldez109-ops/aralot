import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CheckoutItem = {
  variantId?: unknown;
  quantity?: unknown;
};

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no válido.",
        },
        { status: 400 }
      );
    }

    const requestBody = body as {
      checkoutId?: unknown;
      items?: unknown;
    };

    // Validar checkoutId
    if (
      typeof requestBody.checkoutId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        requestBody.checkoutId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Identificador de pedido no válido.",
        },
        { status: 400 }
      );
    }

    // Validar productos
    if (!Array.isArray(requestBody.items)) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no válido.",
        },
        { status: 400 }
      );
    }

    const rawItems = requestBody.items as CheckoutItem[];

    if (rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no válido.",
        },
        { status: 400 }
      );
    }

    const items = rawItems.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    }));

    const valid = items.every(
      (item) =>
        typeof item.variant_id === "string" &&
        item.variant_id.length > 0 &&
        Number.isInteger(item.quantity) &&
        Number(item.quantity) >= 1 &&
        Number(item.quantity) <= 20
    );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "El pedido contiene una variante o cantidad no válida.",
        },
        { status: 400 }
      );
    }

    // Variables privadas de Supabase
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const secretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      console.error(
        "Falta la configuración privada de Supabase."
      );

      return NextResponse.json(
        {
          success: false,
          error: "No se pudo procesar el pedido.",
        },
        { status: 500 }
      );
    }

    // Cliente de Supabase solamente del servidor
    const supabase = createClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Confirmar y descontar inventario
    const { data, error } = await supabase.rpc(
      "confirm_checkout_inventory",
      {
        p_checkout_id: requestBody.checkoutId,
        p_items: items,
      }
    );

    if (error) {
      console.error(
        "Error al confirmar inventario:",
        error.message
      );

      const stockProblem =
        error.message.includes("INSUFFICIENT_STOCK") ||
        error.message.includes("VARIANT_NOT_AVAILABLE");

      return NextResponse.json(
        {
          success: false,
          error: stockProblem
            ? "Uno de los productos ya no tiene suficientes unidades disponibles. Revisa tu carrito."
            : "No se pudo confirmar el inventario.",
        },
        {
          status: stockProblem ? 409 : 500,
        }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo confirmar el inventario.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyProcessed:
        data.already_processed === true,
    });
  } catch (error) {
    console.error(
      "Error procesando checkout:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "No se pudo procesar el pedido.",
      },
      { status: 500 }
    );
  }
}