"use client";

import { useActionState, useState } from "react";
import { adjustInventory, type InventoryState } from "./actions";

const initialState: InventoryState = {};

export function AdjustInventory({
  inventoryId,
  currentQuantity,
  expectedUpdatedAt,
}: {
  inventoryId: string;
  currentQuantity: number;
  expectedUpdatedAt: string;
}) {
  const [open, setOpen] = useState(false);

  const [state, action, pending] = useActionState(
    adjustInventory,
    initialState
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 12px",
          border: "1px solid #d5d5d5",
          borderRadius: "6px",
          background: "#fff",
          color: "#111",
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        Ajustar stock
      </button>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="expected_updated_at" value={expectedUpdatedAt} />
      <input
        type="hidden"
        name="inventory_id"
        value={inventoryId}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="number"
          name="quantity"
          min="0"
          step="1"
          required
          autoFocus
          defaultValue={currentQuantity}
          aria-label="Nueva cantidad de inventario"
          style={{
            width: "100px",
            padding: "8px 10px",
            border: "1px solid #d5d5d5",
            borderRadius: "6px",
            fontFamily: "inherit",
            fontSize: "14px",
          }}
        />

        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "8px 12px",
            border: "1px solid #111",
            borderRadius: "6px",
            background: "#111",
            color: "#fff",
            cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {pending ? "Ajustando..." : "Guardar"}
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          style={{
            padding: "8px 12px",
            border: "1px solid #d5d5d5",
            borderRadius: "6px",
            background: "#fff",
            color: "#111",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
      </div>

      {state.error && (
        <small
          role="alert"
          style={{ display: "block", marginTop: "5px" }}
        >
          {state.error}
        </small>
      )}

      {state.success && (
        <small
          role="status"
          style={{ display: "block", marginTop: "5px" }}
        >
          {state.success}
        </small>
      )}
    </form>
  );
}