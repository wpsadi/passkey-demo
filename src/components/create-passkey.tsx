'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { startRegistration } from '@simplewebauthn/browser';

export function CreatePasskey() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreatePasskey = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/passkey/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create passkey challenge')
      }

      const data = await response.json()

      if (data.success) {
        setIsDialogOpen(true)
        // Custom code logic to handle passkey creation would go here
        // This is where you would use the data.options to create the passkey
        // and generate the attResp variable
        let attResp ;
        try {
          // Assuming data.options is of type RegistrationOptions
          attResp = await startRegistration({ optionsJSON: data.options });
        } catch (error: unknown) {
          // Handle the error as an unknown type first
          if (error instanceof Error) {
            if (error.name === 'InvalidStateError') {
              throw new Error('Error: Authenticator was probably already registered by user');
            } else {
              throw new Error(error.message);
            }
          } else {
            // Fallback for non-Error objects
            throw new Error('An unknown error occurred');
          }
        }
        // Verify the passkey
        await verifyPasskey(data.options.user.id, JSON.stringify(attResp))
      } else {
        throw new Error(data.msg || 'Failed to create passkey challenge')
      }
    } catch (error) {
      console.error('Error creating passkey:', error)
      toast.error('Failed to create passkey. Please try again.')
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  const verifyPasskey = async (passkeyId: string, attResp: string) => {
    try {
      const response = await fetch('/api/passkey/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passkeyId, data: attResp }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Passkey created successfully!')
      } else {
        toast.error('Failed to verify passkey. Please try again.')
      }

      // Regardless of success or failure, navigate to the profile page
      router.push('/profile')
    } catch (error) {
      console.error('Error verifying passkey:', error)
      toast.error('An error occurred while verifying the passkey.')
      router.push('/profile')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create a New Passkey</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleCreatePasskey} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Passkey'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creating Passkey</DialogTitle>
            <DialogDescription>
              Please follow your device&apos;s instructions to create a new passkey.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}