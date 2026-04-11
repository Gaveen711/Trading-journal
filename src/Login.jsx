import { useState } from "react";
import { signIn, signUp } from "./auth.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Consolidated handler to reduce repetition
  const handleAuth = async (type) => {
    setError("");
    setLoading(true);
    try {
      if (type === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Trading Journal Login</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        {error && <p style={{ color: "red", margin: 0, fontSize: '0.9rem' }}>{error}</p>}

        <button 
          disabled={loading}
          onClick={() => handleAuth("signIn")} 
          style={{
            padding: '0.75rem', 
            background: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Processing..." : "Sign In"}
        </button>

        <button 
          disabled={loading}
          onClick={() => handleAuth("signUp")} 
          style={{
            padding: '0.75rem', 
            background: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Sign Up
        </button>
      </div>
    </div> // Added the missing closing tag here
  );
}