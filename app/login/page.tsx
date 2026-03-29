'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import { CIALogo } from '@/components/cia-logo'
import { ParticleBackground } from '@/components/particle-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { Auth } from './amplifyClient'

export default function LoginPage() {
  const router = useRouter()
  const { login, setLoading, isLoading } = useStore()

  const [formData, setFormData] = useState({
    accountId: '',
    username: '',
    password: '',
  })

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsAuthenticating(true)
    setLoading(true)

    try {
      // Use Cognito via Amplify Auth
      const user = await Auth.signIn(formData.username, formData.password)

      // You can extract anything you want from `user` here
      const username = user.username
      const accountId = formData.accountId || 'default-account-id'

      // Keep your existing store API compatible
      login(accountId, username)

      router.push('/chat')
    } catch (err: any) {
      console.error('Amplify Auth signIn error:', err)
      let message = 'Authentication failed. Please check your credentials.'

      if (err?.message) {
        message = err.message
      }

      setError(message)
    } finally {
      setIsAuthenticating(false)
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-radial-glow" />
      <ParticleBackground />

      {/* Login Card */}
      <div
        className={`
          relative z-10 w-full max-w-md mx-4 p-8
          bg-card/90 backdrop-blur-sm border border-border rounded-xl
          animate-fade-in
        `}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <CIALogo size="lg" />
        </div>

        {isAuthenticating ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">
              Authenticating with Amazon Cognito...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AWS Account ID (optional, for your own app context) */}
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-foreground">
                AWS Account ID
              </Label>
              <Input
                id="accountId"
                type="text"
                placeholder="123456789012"
                value={formData.accountId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, accountId: e.target.value }))
                }
                className="
                  bg-surface border-border
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                  placeholder:text-muted-foreground/50
                "
              />
            </div>

            {/* Cognito Username (or email, depending on pool config) */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username / Email
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="user@example.com"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="
                  bg-surface border-border
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                  placeholder:text-muted-foreground/50
                "
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="
                  bg-surface border-border
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                  placeholder:text-muted-foreground/50
                "
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-500 whitespace-pre-line">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="
                w-full py-6 text-base font-semibold
                bg-gradient-to-r from-primary to-aws-orange-hover
                hover:from-aws-orange-hover hover:to-primary
                text-primary-foreground
                transition-all duration-300 animate-glow btn-press
              "
              disabled={isLoading}
            >
              Sign in with Cognito
            </Button>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Lock className="w-4 h-4" />
              <span>Secured by Amazon Cognito</span>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
