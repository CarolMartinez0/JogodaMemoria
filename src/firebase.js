import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Substitua estes valores pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function registerUser(profile) {
  const credential = await signInAnonymously(auth);
  const user = credential.user;

  const userData = {
    uid: user.uid,
    tipoUsuario: profile.tipoUsuario,
    escola: profile.escola,
    anoLetivo: profile.anoLetivo,
    pontuacaoMaxima: profile.pontuacaoMaxima,
    participarRanking: profile.participarRanking,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", user.uid), userData, { merge: true });
  return { uid: user.uid, ...userData };
}
