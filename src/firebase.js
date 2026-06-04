const FIREBASE_VERSION = '12.13.0'

export function hasFirebaseConfig(config = window.LISTIMATE_CONFIG) {
  const firebase = config?.firebase || {}
  return Boolean(
    firebase.apiKey &&
    firebase.authDomain &&
    firebase.databaseURL &&
    firebase.projectId &&
    firebase.appId
  )
}

export async function loadFirebase() {
  const [appModule, authModule, databaseModule] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database.js`)
  ])

  return {
    initializeApp: appModule.initializeApp,
    getAuth: authModule.getAuth,
    setPersistence: authModule.setPersistence,
    browserLocalPersistence: authModule.browserLocalPersistence,
    signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
    getDatabase: databaseModule.getDatabase,
    ref: databaseModule.ref,
    onValue: databaseModule.onValue,
    set: databaseModule.set
  }
}
