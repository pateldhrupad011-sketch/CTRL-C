import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function app() {
    const existing = getApps()[0];
    if (existing) return existing;

    const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
        .replace(/^"|"$/g, "")
        .replace(/\\n/g, "\n");

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        }),
    });
}

export function db() {
    return getFirestore(app());
}