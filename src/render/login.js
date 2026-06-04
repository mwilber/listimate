import { html } from '../../vendor/arrow-core.mjs'
import { loadReferenceData, loginWithFirebase, state } from '../store.js'

export function LoginScreen() {
  return html`
    <main class="login-screen" aria-labelledby="login-title">
      <section class="login-panel">
        <h1 id="login-title">Listimate</h1>
        <p>Sign in with your Firebase account to load your grocery lists.</p>

        <form class="login-form" @submit="${(event) => { event.preventDefault(); loginWithFirebase() }}">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autocomplete="username"
            value="${() => state.ui.loginEmail}"
            disabled="${() => state.auth.status === 'signing-in'}"
            @input="${(event) => { state.ui.loginEmail = event.currentTarget.value }}"
          >

          <label for="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autocomplete="current-password"
            value="${() => state.ui.loginPassword}"
            disabled="${() => state.auth.status === 'signing-in'}"
            @input="${(event) => { state.ui.loginPassword = event.currentTarget.value }}"
          >

          ${() => state.auth.error ? html`
            <div class="login-error" role="alert">${() => state.auth.error}</div>
          ` : ''}

          <button class="login-submit" type="submit" disabled="${() => state.auth.status === 'signing-in'}">
            ${() => state.auth.status === 'signing-in' ? 'Signing in...' : 'Sign In'}
          </button>
          <button
            class="login-cancel"
            type="button"
            disabled="${() => state.auth.status === 'signing-in'}"
            @click="${loadReferenceData}"
          >
            Cancel and Load Reference Data
          </button>
        </form>
      </section>
    </main>
  `
}
