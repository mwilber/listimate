import { loadFirebase } from './firebase.js'

let servicesPromise = null

export async function getFirebaseServices(config = window.LISTIMATE_CONFIG) {
  if (!servicesPromise) {
    servicesPromise = initializeServices(config)
  }
  return servicesPromise
}

async function initializeServices(config) {
  const sdk = await loadFirebase()
  const app = sdk.initializeApp(config.firebase)
  const auth = sdk.getAuth(app)
  await sdk.setPersistence(auth, sdk.browserLocalPersistence)
  const credential = await sdk.signInWithEmailAndPassword(
    auth,
    config.auth.email,
    config.auth.password
  )
  const database = sdk.getDatabase(app, config.firebase.databaseURL)

  return {
    sdk,
    app,
    auth,
    database,
    user: credential.user,
    uid: credential.user.uid
  }
}
