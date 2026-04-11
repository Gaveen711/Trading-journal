import { useState } from "react";
import { signIn, signUp,  } from "./auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
    } catch (err) {
      setError(err.message);
    }
  };
    return (
    <div>
      <h2>Trading Journal Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignUp}>Sign Up</button>
      
    </div>
  );
}
