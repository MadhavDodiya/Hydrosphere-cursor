import { Link } from "react-router-dom";

export default function BillingCancel() {
  return (
    <div className="container py-5">
      <div className="bg-white rounded-4 border shadow-sm p-5 text-center">
        <h3 className="fw-bold mb-2">Checkout canceled</h3>
        <p className="text-muted mb-4">No charges were made. You can upgrade anytime from your dashboard.</p>
        <Link to="/dashboard/billing" className="btn btn-outline-primary rounded-pill px-4">
          Back to Billing
        </Link>
      </div>
    </div>
  );
}

