import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Form, FormField, FormActions } from "../components/Form.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    setSubmitting(true);
    try {
      await register(trimmed, email, password, role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Form title="Create your HydroSphere account" onSubmit={handleSubmit}>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <FormField label="Full name" id="su-name">
          <input
            id="su-name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </FormField>
        <FormField label="Email" id="su-email">
          <input
            id="su-email"
            type="email"
            required
            autoComplete="email"
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password (min 6 characters)" id="su-password">
          <input
            id="su-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormField label="I am a" id="su-role">
          <select
            id="su-role"
            className="w-full min-h-[44px] rounded border border-slate-300 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </FormField>
        <FormActions>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
          <Link to="/login" className="self-center text-sm text-sky-700 hover:underline">
            Already have an account?
          </Link>
        </FormActions>
      </Form>
    </div>
  );
}
