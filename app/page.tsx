"use client"
import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [remember, setRemember] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        const res = await signIn('credentials', { redirect: false, email, password })
        setLoading(false)
        if (res && (res as any).ok) {
            try {
                if (remember) {
                    localStorage.setItem('rememberEmail', email)
                } else {
                    localStorage.removeItem('rememberEmail')
                }
            } catch (err) {
                console.log(err)
            }
            router.push('/dashboard')
        } else {
            setError('Invalid credentials')
        }
    }

    useEffect(() => {
        try {
            const saved = localStorage.getItem('rememberEmail')
            if (saved) {
                setEmail(saved)
                setRemember(true)
            }
        } catch (err) {
            console.log(err)
        }
    }, [])

    return (
        <main className="h-screen box-border py-12 md:py-20 overflow-hidden">
            <div className="h-full w-full max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden md:grid md:grid-cols-2">
                <div className="p-12 h-full flex items-center">
                    <div className="w-full max-w-md mx-auto">
                        <h1 className="text-2xl font-semibold mb-4">Welcome Back</h1>
                        {error && <p className="text-red-600 mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="inline-flex items-center text-sm">
                                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <span className="ml-2 text-gray-700">Remember me</span>
                                </label>
                            </div>
                            <div>
                                <button disabled={loading} type="submit" className="w-full bg-[#1A56DB] hover:bg-[#1547b8] text-white py-2 rounded-md">{loading ? 'Signing in...' : 'Sign in'}</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="text-white p-8 flex flex-col justify-center h-full bg-[#1C64F2]">
                    <h2 className="text-4xl font-semibold mb-3">ticktock</h2>
                    <p className="text-base opacity-95 font-light">
                        Introducing ticktock, our cutting-edge web application designed to revolutionize how you manage employee work hours. With ticktock, you can effortlessly track and monitor employee attendance and productivity from anywhere, anytime, using any internet-conneced device.
                    </p>
                </div>
            </div>
        </main>
    )
}
