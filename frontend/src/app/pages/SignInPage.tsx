import { useState, type FormEvent } from 'react'

import { SectionIntro } from '../components/SectionIntro'
import type { AuthResult, MockAccount, PageId } from '../types'

type SignInPageProps = {
  existingAccount: MockAccount | null
  onLogin: (identifier: string, password: string) => AuthResult
  onOpenPage: (page: PageId) => void
}

export function SignInPage({ existingAccount, onLogin, onOpenPage }: SignInPageProps) {
  const [signInIdentifier, setSignInIdentifier] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = onLogin(signInIdentifier.trim(), signInPassword)

    if (!result.success) {
      setSignInError(result.message ?? 'Sign-in failed.')
      return
    }

    setSignInError('')
  }

  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h2>Sign in</h2>
        </div>
        <p className="section-copy">
          Use the account created in this frontend session. Backend auth is not connected yet.
        </p>
      </section>

      <section className="auth-single">
        <article className="panel auth-panel">
          <SectionIntro
            title="Sign in"
            detail="The mock sign-in checks the account created in this frontend session."
          />

          <form className="form-stack" onSubmit={handleLogin}>
            <label className="field">
              <span>ID or email</span>
              <input
                type="text"
                value={signInIdentifier}
                onChange={(event) => setSignInIdentifier(event.target.value)}
                placeholder="traveler_user or Jane@example.com"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={signInPassword}
                onChange={(event) => setSignInPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </label>

            {signInError ? <p className="field-error">{signInError}</p> : null}

            <button type="submit" className="button-primary">
              Sign in
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => onOpenPage('create-account')}
            >
              Create account
            </button>
          </form>

          <div className="callout subtle signin-state">
            <strong>Current mock account</strong>
            {existingAccount ? (
              <div className="summary-list">
                <span>Name: {existingAccount.firstName + ' ' + existingAccount.lastName}</span>
                <span>ID: {existingAccount.userId}</span>
                <span>Email: {existingAccount.email}</span>
              </div>
            ) : (
              <p>
                No account has been created in this frontend session yet. Use the create account
                button below the sign-in form first.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
