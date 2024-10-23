'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'

type FormData = {
  username: string
  email: string
  password: string
}

export function SignupPageComponent() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/profile')
        toast.success('Signup successful!')
        
      } else {
        setErrorMsg(result.message || 'An error occurred during signup.')
        toast.error('Signup failed. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrorMsg('An unexpected error occurred. Please try again.')
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register('username', { required: 'Username is required' })}
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  }
                })}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  }
                })}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}