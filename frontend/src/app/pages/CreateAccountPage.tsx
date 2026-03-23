import { useState, type FormEvent } from 'react'
import { SectionIntro } from '../components/SectionIntro'
import type { MockAccount, PageId } from '../types'

type CreateAccountPageProps = {
  onCreateAccount: (account: MockAccount) => void
  onOpenPage: (page: PageId) => void
}

type RuleTone = 'success' | 'error'

export function CreateAccountPage({
  onCreateAccount,
  onOpenPage,
}: CreateAccountPageProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')
  const [email, setEmail] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordCheckTouched, setPasswordCheckTouched] = useState(false)
  const [createError, setCreateError] = useState('')

  const hasPasswordInteraction = passwordTouched || password.length > 0
  const isMinLengthValid = password.length >= 8
  const isMixedPatternValid = /[A-Za-z]/.test(password) && /\d/.test(password)
  const isRepeatedDigitValid = !/(\d)\1\1/.test(password)
  const passwordsMatch = password === passwordCheck
  const shouldShowMismatch =
    passwordCheckTouched && passwordCheck.length > 0 && !passwordsMatch

  const getRuleTone = (isValid: boolean): RuleTone => {
    if (!hasPasswordInteraction) {
      return isValid ? 'success' : 'error'
    }

    return isValid ? 'success' : 'error'
  }

  const passwordRules = [
    { label: 'Minimum 8 characters', tone: getRuleTone(isMinLengthValid) },
    { label: 'Mix letters and numbers', tone: getRuleTone(isMixedPatternValid) },
    { label: 'No three identical digits in a row', tone: getRuleTone(isRepeatedDigitValid) },
  ]

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordTouched(true)
    setPasswordCheckTouched(true)

    if (!firstName || !lastName || !userId || !password || !passwordCheck || !email) {
      setCreateError('Fill in every account field before creating the profile.')
      return
    }

    if (!isMinLengthValid || !isMixedPatternValid || !isRepeatedDigitValid) {
      setCreateError('Password rules must all pass before the account can be created.')
      return
    }

    if (!passwordsMatch) {
      setCreateError('Password and password check must match.')
      return
    }

    setCreateError('')

    onCreateAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userId: userId.trim(),
      email: email.trim(),
      password,
    })
  }

  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h2>Create account</h2>
        </div>
        <p className="section-copy">
          This is a frontend-only account shell. It validates password rules locally until backend
          auth is added.
        </p>
      </section>

      <section className="auth-single">
        <article className="panel auth-panel">
          <SectionIntro
            title="Create account"
            detail="Use this form to prepare the user profile fields before real backend auth is wired in."
          />

          <form className="form-stack" onSubmit={handleCreateAccount}>
            <div className="field-grid">
              <label className="field">
                <span>First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Jane"
                />
              </label>

              <label className="field">
                <span>Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Doe"
                />
              </label>
            </div>

            <label className="field">
              <span>ID</span>
              <input
                type="text"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="traveler_user"
              />
            </label>

            <div className="password-rule-list password-rule-list--spaced" aria-live="polite">
              {passwordRules.map((rule) => (
                <div key={rule.label} className="rule-item">
                  <span className={`rule-dot rule-dot--${rule.tone}`} aria-hidden="true" />
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setPasswordTouched(true)}
                placeholder="Create a secure password"
              />
            </label>

            <label className="field">
              <span>Password check</span>
              <input
                type="password"
                value={passwordCheck}
                onChange={(event) => setPasswordCheck(event.target.value)}
                onFocus={() => setPasswordCheckTouched(true)}
                placeholder="Enter the same password again"
              />
            </label>
            {shouldShowMismatch ? <p className="field-error">Passwords do not match.</p> : null}

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Jane@example.com"
              />
            </label>

            {createError ? <p className="field-error">{createError}</p> : null}

            <div className="hero-actions">
              <button type="submit" className="button-primary">
                Create account
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => onOpenPage('sign-in')}
              >
                Go to Sign In
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  )
}
