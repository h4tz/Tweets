import React from 'react'
import { Navigate } from 'react-router-dom'

/**
 * Kept as a real route so old links keep working: the landing page now hosts
 * both tabs, so there is nothing separate to render here.
 */
export default function RegisterPage() {
  return <Navigate to="/" replace />
}
