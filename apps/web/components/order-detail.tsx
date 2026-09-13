import Image from "next/image";
import {
  DELIVERY_OPTIONS,
  formatXOF,
  OPERATOR_LABELS,
  ORDER_STATUS_LABELS,
  type DeliveryMethod,
  type Operator,
  type OrderStatus,
} from "@velyna/shared";
import type { Order } from "@/lib/api";

export const OrderDetail = ({ order }: { order: Order }) => (
  <div className="grid12" style={{ alignItems: "start" }}>
    <div style={{ gridColumn: "1 / span 7" }}>
      <p className="eyebrow" style={{ letterSpacing: "0.26em", marginBottom: 18 }}>
        Articles
      </p>
      {order.items.map((item) => (
        <div
          key={item.productRef}
          style={{
            display: "grid",
            gridTemplateColumns: "72px 1fr auto",
            gap: 16,
            alignItems: "center",
            padding: "16px 0",
            borderTop: "1px solid var(--line)",
          }}
        >
          <Image
            src={item.product.img}
            alt={item.productName}
            width={160}
            height={213}
            style={{ width: "100%", height: "auto", aspectRatio: "3 / 4", objectFit: "cover" }}
          />
          <div>
            <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 20 }}>
              {item.productName}
            </p>
            <p className="eyebrow" style={{ marginTop: 6, letterSpacing: "0.2em" }}>
              {item.product.capacity} × {item.quantity} — {formatXOF(item.unitPrice)}
            </p>
          </div>
          <span style={{ fontFamily: "var(--sans)", fontSize: 12, whiteSpace: "nowrap" }}>
            {formatXOF(item.unitPrice * item.quantity)}
          </span>
        </div>
      ))}

      <div style={{ marginTop: 30, borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <p className="eyebrow" style={{ letterSpacing: "0.26em", marginBottom: 16 }}>
          Livraison
        </p>
        <p className="lead" style={{ margin: 0 }}>
          {order.firstName} {order.lastName}
          <br />
          {order.address && (
            <>
              {order.address}
              <br />
            </>
          )}
          {order.municipality}, Abidjan
          <br />
          {order.phone}
          <br />
          {DELIVERY_OPTIONS[order.deliveryMethod as DeliveryMethod].label} —{" "}
          {DELIVERY_OPTIONS[order.deliveryMethod as DeliveryMethod].detail}
        </p>
        {order.instruction && (
          <p className="lead" style={{ marginTop: 12, fontStyle: "italic" }}>
            « {order.instruction} »
          </p>
        )}
      </div>
    </div>

    <aside style={{ gridColumn: "9 / span 4", borderTop: "1px solid var(--line)", paddingTop: 24 }}>
      <p className="eyebrow" style={{ marginBottom: 20, letterSpacing: "0.26em" }}>
        Récapitulatif
      </p>
      <div className="summary-row">
        <span>Numéro</span>
        <span>{order.number}</span>
      </div>
      <div className="summary-row">
        <span>Statut</span>
        <span>{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</span>
      </div>
      <div className="summary-row">
        <span>Sous-total</span>
        <span>{formatXOF(order.subTotal)}</span>
      </div>
      {order.discount > 0 && (
        <div className="summary-row">
          <span>Code {order.promoCode}</span>
          <span>−{formatXOF(order.discount)}</span>
        </div>
      )}
      <div className="summary-row">
        <span>Livraison</span>
        <span>{order.deliveryCost === 0 ? "Offerte" : formatXOF(order.deliveryCost)}</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <span>{formatXOF(order.total)}</span>
      </div>
      {order.payment && (
        <p className="eyebrow" style={{ marginTop: 10, letterSpacing: "0.18em" }}>
          Règlement —{" "}
          {OPERATOR_LABELS[order.payment.operator as Operator] ?? order.payment.operator}
        </p>
      )}
    </aside>
  </div>
);
