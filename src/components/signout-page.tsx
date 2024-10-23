'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function SignoutPageComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sign-out', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        router.push('/signup')
      } else {
        console.error('Signout failed')
        setIsLoading(false)
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Signout error:', error)
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <Button onClick={() => setIsDialogOpen(true)} variant="destructive">
        Sign Out
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to sign out?</DialogTitle>
            <DialogDescription>
              You will be logged out of your account and redirected to the signup page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSignout} disabled={isLoading}>
              {isLoading ? 'Signing out...' : 'Sign out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}