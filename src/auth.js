import { loadFirebase } from './firebase.js'

let servicesPromise = null
let services = null

export async function getFirebaseServices(config = window.LISTIMATE_CONFIG) {
  if (!servicesPromise) {
    servicesPromise = initializeServices(config)
  }
  return servicesPromise
}

export async function signIn(email, password, config = window.LISTIMATE_CONFIG) {
  services = await getFirebaseServices(config)
  const credential = await services.sdk.signInWithEmailAndPassword(
    services.auth,
    email,
    password
  )

  return {
    ...services,
    user: credential.user,
    uid: credential.user.uid
  }
}

async function initializeServices(config) {
  const sdk = await loadFirebase()
  const app = sdk.initializeApp(config.firebase)
  const auth = sdk.getAuth(app)
  await sdk.setPersistence(auth, sdk.browserLocalPersistence)
  const database = sdk.getDatabase(app, config.firebase.databaseURL)

  return {
    sdk,
    app,
    auth,
    database
  }
}
