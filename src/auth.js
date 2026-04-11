import { auth } from "./firebase";
import {  createUserWithEmailAndPassword,  signInWithEmailAndPassword,  signOut,} from "firebase/auth";

// Sign Up with Email
export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Sign In with Email
export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Sign Out
export const logout = () => signOut(auth);