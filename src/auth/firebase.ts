import * as admin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';

// Inicializa el SDK de Firebase Admin
// Usa credenciales de service account si están definidas, si no, usa applicationDefault
let credential: admin.credential.Credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT,
    ) as admin.ServiceAccount;
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Firebase Admin SDK inicializado con Service Account');
  } catch (error) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    credential = admin.credential.applicationDefault();
  }
} else {
  console.log(
    '⚠️ FIREBASE_SERVICE_ACCOUNT no encontrado, usando applicationDefault()',
  );
  credential = admin.credential.applicationDefault();
}

const appOptions: AppOptions = {
  credential,
  projectId: 'melodia09-4dfd6',
};

// Solo inicializar si no hay apps existentes
if (!admin.apps.length) {
  admin.initializeApp(appOptions);
}

export default admin;
