import { useState } from "react";
import axios from "axios";
import Loader from "./Loader";
const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const stars = [1, 2, 3, 4, 5];

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setName("");
    setEmail("");
    setMessage("");
  };

  const validate = () => {
    if (message.trim().length < 1)
      return "Please write a short feedback (min 10 characters).";
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      setLoading(false);
      return;
    }

    const body = {
      rating,
      name: name.trim() || "unknown",
      email: email.trim() || "unknown",
      message: message.trim(),
    };

    try {
      const sendRequest = async () => {
        await axios
          .post(
            "https://algosprint-vxi4.onrender.com/api/v1/user/feedback",
            body
          )
          .then((res) => {
            console.log(res);
            setLoading(false);
          });
      };
      sendRequest();
    } catch (err) {
      setError(err);
      setLoading(false);
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-w-md bg-zinc-200 dark:bg-zinc-100 shadow-md rounded-lg p-6 transition-all duration-105 animate-in">
      <h3 className="text-xl font-semibold mb-1 text-black">
        Feedback for AlgoSprint
      </h3>
      <p className="text-sm text-gray-700 mb-4">
        Help us improve — quick feedback takes 30 seconds.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your rating
          </label>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center"
              role="radiogroup"
              aria-label="Star rating"
            >
              {stars.map((s) => {
                const filled = hoverRating ? s <= hoverRating : s <= rating;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-pressed={rating === s}
                    aria-label={`${s} star`}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        filled ? "text-yellow-400" : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.386-2.46a1 1 0 00-1.175 0l-3.386 2.46c-.784.57-1.838-.197-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.05 9.401c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
                    </svg>
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-gray-600">
              {rating > 0 ? `${rating} / 5` : "No rating yet"}
            </div>
          </div>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 text-gray-700 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-slate-400 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-700"
          />

          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border rounded-md border-slate-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-700"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feedback
          </label>
          <textarea
            rows={4}
            placeholder="What did you like? What can be improved?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-400 rounded-md focus:ring-2 focus:ring-indigo-200 text-black focus:border-indigo-700"
          />
          <div className="text-xs text-gray-400 mt-1">
            Minimum 10 characters — optional
          </div>
        </div>

        {/* Error / Success */}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex text-sm items-center px-4 py-2 rounded-md text-white ${
              loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none`}
          >
            {loading ? <Loader /> : null}
            Submit feedback
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setError(null);
              setSuccess(null);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            Reset
          </button>

          <div className="ml-auto text-sm text-gray-700">
            We respect your privacy.
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
