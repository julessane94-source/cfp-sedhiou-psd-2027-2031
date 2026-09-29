import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export default async function RecuPage({
  params,
}: {
  params: Promise<{ receiptNumber: string }>;
}) {
  const { receiptNumber } = await params;

  const receipt = await prisma.learnerReceipt.findUnique({
    where: {
      receiptNumber,
    },
    include: {
      payment: {
        include: {
          learner: true,
          enrollment: {
            include: {
              training: true,
            },
          },
          registeredBy: true,
        },
      },
    },
  });

  if (!receipt) {
    notFound();
  }

  const payment = receipt.payment;
  const enrollment = payment.enrollment;
  const learner = payment.learner;

  const netPayable = Number(enrollment.netPayable);
  const totalPaid = Number(payment.amount);

  const payments = await prisma.learnerPayment.aggregate({
    where: {
      enrollmentId: enrollment.id,
    },
    _sum: {
      amount: true,
    },
  });

  const totalPaidForEnrollment = Number(payments._sum.amount ?? 0);
  const balance = Math.max(0, netPayable - totalPaidForEnrollment);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value) + " FCFA";

  const paymentMethodLabels: Record<string, string> = {
    ESPECES: "Espèces",
    WAVE: "Wave",
    ORANGE_MONEY: "Orange Money",
    VIREMENT_BANCAIRE: "Virement bancaire",
    AUTRE: "Autre",
  };

  const registeredBy = `${payment.registeredBy.firstName} ${payment.registeredBy.lastName}`;

  return (
    <main className="receipt-page">
      <div className="receipt-actions print:hidden">
        <a href="/apprenants" className="receipt-back">
          ← Retour
        </a>

        <PrintButton />
      </div>

      <div className="receipt">
        <div className="receipt-logo">
          <img
            src="/logo-cfp-sedhiou.svg"
            alt="CFP Sédhiou"
            width={52}
            height={52}
          />
        </div>

        <div className="receipt-header">
          <div className="receipt-title">CFP SÉDHIOU</div>
          <div className="receipt-subtitle">
            Centre de Formation Professionnelle
          </div>

          <div className="receipt-type">REÇU DE PAIEMENT</div>

          <div className="receipt-number">
            N° {receipt.receiptNumber}
          </div>
        </div>

        <div className="receipt-line" />

        <section className="receipt-section">
          <div className="receipt-label">MATRICULE APPRENANT</div>
          <div className="receipt-matricule">{learner.matricule}</div>
        </section>

        <section className="receipt-info">
          <div>
            <span>Apprenant</span>
            <strong>
              {learner.firstName} {learner.lastName}
            </strong>
          </div>

          <div>
            <span>Formation</span>
            <strong>{enrollment.training.title}</strong>
          </div>

          <div>
            <span>Année académique</span>
            <strong>{enrollment.academicYear}</strong>
          </div>

          <div>
            <span>Niveau</span>
            <strong>{enrollment.level || "Non renseigné"}</strong>
          </div>
        </section>

        <div className="receipt-line" />

        <section className="amounts">
          <div className="amount-row">
            <span>Net à payer</span>
            <strong>{formatMoney(netPayable)}</strong>
          </div>

          <div className="amount-row paid">
            <span>Ce paiement</span>
            <strong>{formatMoney(totalPaid)}</strong>
          </div>

          <div className="amount-row total-paid">
            <span>Total payé</span>
            <strong>{formatMoney(totalPaidForEnrollment)}</strong>
          </div>

          <div className="amount-row balance">
            <span>Reste à payer</span>
            <strong>{formatMoney(balance)}</strong>
          </div>
        </section>

        <div className="receipt-line" />

        <section className="receipt-info payment-info">
          <div>
            <span>Mode de paiement</span>
            <strong>
              {paymentMethodLabels[payment.method] || payment.method}
            </strong>
          </div>

          <div>
            <span>Référence paiement</span>
            <strong>{payment.paymentReference}</strong>
          </div>
        </section>

        {payment.note && (
          <>
            <div className="receipt-line" />

            <section className="receipt-note">
              <span>Note</span>
              <strong>{payment.note}</strong>
            </section>
          </>
        )}

        <div className="receipt-line" />

        <footer className="receipt-footer">
          <div>
            Date :{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(payment.paidAt))}
          </div>

          <div>Enregistré par : {registeredBy}</div>

          <div className="receipt-thanks">
            Merci pour votre confiance.
          </div>

          <div className="receipt-system">
            CFP Sédhiou — Plateforme de gestion
          </div>
        </footer>
      </div>

      <style>{`
        .receipt-page {
          min-height: 100vh;
          background: #f1f5f9;
          padding: 24px;
        }

        .receipt-actions {
          width: 80mm;
          max-width: 100%;
          margin: 0 auto 16px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .receipt-back {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 8px;
          background: white;
          color: #334155;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
        }

        .receipt {
          width: 80mm;
          max-width: 100%;
          margin: 0 auto;
          background: white;
          color: #0f172a;
          padding: 7mm 5mm;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
        }

        .receipt-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 4px;
        }

        .receipt-logo img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .receipt-header {
          text-align: center;
        }

        .receipt-title {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .receipt-subtitle {
          margin-top: 2px;
          color: #64748b;
          font-size: 8.5px;
        }

        .receipt-type {
          margin-top: 10px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .receipt-number {
          margin-top: 3px;
          color: #64748b;
          font-size: 9px;
        }

        .receipt-line {
          border-top: 1px dashed #94a3b8;
          margin: 9px 0;
        }

        .receipt-section {
          margin-bottom: 7px;
        }

        .receipt-label {
          color: #2563eb;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .receipt-matricule {
          margin-top: 2px;
          color: #1d4ed8;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .receipt-info {
          display: grid;
          gap: 6px;
        }

        .receipt-info div {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .receipt-info span {
          color: #64748b;
          font-size: 9px;
        }

        .receipt-info strong {
          max-width: 58%;
          text-align: right;
          font-size: 10px;
          font-weight: 700;
        }

        .amounts {
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          overflow: hidden;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 7px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10px;
        }

        .amount-row:last-child {
          border-bottom: 0;
        }

        .amount-row strong {
          font-weight: 800;
        }

        .amount-row.paid {
          color: #15803d;
        }

        .amount-row.balance {
          color: #b91c1c;
        }

        .payment-info strong {
          font-size: 9.5px;
        }

        .receipt-note {
          display: grid;
          gap: 3px;
        }

        .receipt-note span {
          color: #64748b;
          font-size: 9px;
        }

        .receipt-note strong {
          font-size: 10px;
          font-weight: 600;
        }

        .receipt-footer {
          color: #64748b;
          font-size: 8.5px;
          line-height: 1.6;
          text-align: center;
        }

        .receipt-thanks {
          margin-top: 7px;
          color: #334155;
          font-weight: 700;
        }

        .receipt-system {
          margin-top: 3px;
          font-size: 7.5px;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            width: 80mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .mobile-header,
          .sidebar,
          .sidebar-overlay,
          .receipt-actions,
          .print-hidden {
            display: none !important;
          }

          .app-shell,
          .app-main,
          .app-content {
            display: block !important;
            width: 80mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .receipt-page {
            width: 80mm !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          .receipt {
            width: 80mm !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 5mm 4mm !important;
            box-shadow: none !important;
            border: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}
