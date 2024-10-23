'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

type UserData = {
  userId: string
  account: {
    email: string
    username: string
    $id: string
    $databaseId: string
    $collectionId: string
  }
}

type PasskeyData = {
  $id: string
  verified: boolean
  passkey: {
    challenge: string
    rp: {
      name: string
      id: string
    }
    user: {
      id: string
      name: string
      displayName: string
    }
  }
}

type UserApiResponse = {
  success: boolean
  userId: string
  account: UserData['account']
}

type PasskeysApiResponse = {
  success: boolean
  keys: {
    passkeys: PasskeyData[]
    total: number
  }
  msg: string
}

export default function ProfilePageComponent() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [passkeys, setPasskeys] = useState<PasskeyData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, passkeysResponse] = await Promise.all([
          fetch('/api/me'),
          fetch('/api/passkey/all')
        ])

        if (!userResponse.ok || !passkeysResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const userData: UserApiResponse = await userResponse.json()
        const passkeysData: PasskeysApiResponse = await passkeysResponse.json()

        if (userData.success && passkeysData.success) {
          setUserData({
            userId: userData.userId,
            account: userData.account
          })
          setPasskeys(passkeysData.keys.passkeys)
        } else {
          throw new Error('Data fetch was not successful')
        }
      } catch (err) {
        setError('An error occurred while fetching your data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSignOut = () => {
    router.push('/signout')
  }

  const handleCreatePasskey = () => {
    router.push('/new-passkey')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gray-100">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-24 mb-4" />
            <Skeleton className="w-full h-64" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
            <Button className="w-full mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold mb-2">User Information</h2>
              <p><strong>User ID:</strong> {userData?.userId}</p>
              <p><strong>Username:</strong> {userData?.account.username}</p>
              <p><strong>Email:</strong> {userData?.account.email}</p>
              <p><strong>Database ID:</strong> {userData?.account.$databaseId}</p>
              <p><strong>Collection ID:</strong> {userData?.account.$collectionId}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Passkeys</h2>
              {passkeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Display Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passkeys.map((passkey) => (
                      <TableRow key={passkey.$id}>
                        <TableCell>{passkey.$id}</TableCell>
                        <TableCell>{passkey.verified ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{passkey.passkey.user.displayName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No passkeys found.</p>
              )}
              <Button className="mt-4" onClick={handleCreatePasskey}>
                Create New Passkey
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}