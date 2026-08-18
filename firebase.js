import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBINC7enpGKUsUCvLaBQAm24XmBMu3i18",
  authDomain: "my-project-6a0f8.firebaseapp.com",
  projectId: "my-project-6a0f8",
  storageBucket: "my-project-6a0f8.appspot.com",
  messagingSenderId: "715599675454",
  appId: "1:715599675454:web:711ddf68f36b699651516f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);