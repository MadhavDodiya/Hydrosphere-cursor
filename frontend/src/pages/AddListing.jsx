import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, FormField, FormActions } from "../components/Form.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createListing,
  updateListing,
  fetchListings,
} from "../services/listingService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

const TYPES = ["Green", "Blue", "Grey"];

/**
 * Create or edit a listing (seller only — route guarded).
 */
export default function AddListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [companyName, setCompanyName] = useState("");
  const [hydrogenType, setHydrogenType] = useState("Green");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const mine = await fetchListings({ seller: user.id });
        const found = mine.find((l) => l._id === id);
        if (cancelled) return;
        if (!found) {
          setError("Listing not found or not yours.");
          setLoading(false);
          return;
        }
        setCompanyName(found.companyName);
        setHydrogenType(found.hydrogenType);
        setPrice(String(found.price));
        setQuantity(String(found.quantity));
        setLocation(found.location);
        setDescription(found.description ?? "");
      } catch (err) {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, "Failed to load listing.");
          setError(msg);
          showToast(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, user?.id, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const desc = description.trim();
    if (desc.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    const p = Number(price);
    const q = Number(quantity);
    if (Number.isNaN(p) || p < 0) {
      setError("Enter a valid price (0 or greater).");
      return;
    }
    if (Number.isNaN(q) || q < 0 || !Number.isInteger(q)) {
      setError("Enter a valid whole-number quantity (0 or greater).");
      return;
    }

    setSubmitting(true);
    const body = {
      companyName: companyName.trim(),
      hydrogenType,
      price: p,
      quantity: q,
      location: location.trim(),
      description: desc,
    };
    try {
      if (isEdit) {
        await updateListing(id, body);
      } else {
        await createListing(body);
      }
      showToast(isEdit ? "Listing updated." : "Listing created.", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Save failed");
      setError(msg);
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Loader label="Loading listing" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Form title={isEdit ? "Edit listing" : "Add listing"} onSubmit={handleSubmit}>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <FormField label="Company name" id="companyName">
          <input
            id="companyName"
            required
            minLength={2}
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </FormField>
        <FormField label="Hydrogen type" id="hydrogenType">
          <select
            id="hydrogenType"
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={hydrogenType}
            onChange={(e) => setHydrogenType(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Price (USD)" id="price">
          <input
            id="price"
            type="number"
            min={0}
            step="0.01"
            required
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </FormField>
        <FormField label="Quantity (units)" id="quantity">
          <input
            id="quantity"
            type="number"
            min={0}
            step={1}
            required
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </FormField>
        <FormField label="Location" id="location">
          <input
            id="location"
            required
            minLength={2}
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </FormField>
        <FormField label="Description" id="description">
          <textarea
            id="description"
            required
            rows={5}
            minLength={10}
            maxLength={5000}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Supply terms, certifications, delivery, etc."
          />
        </FormField>
        <FormActions>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEdit ? "Update listing" : "Publish listing"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="min-h-[44px] rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </FormActions>
      </Form>
    </div>
  );
}
