export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthSession {
  id: string
  deviceName: string
  ipAddress: string
  lastUsedAt: string
  createdAt: string
  isCurrent: boolean
}
