import { createContext, useContext } from 'react'

// Create auth context for managing user sessions
interface AuthContextType {
  user: any | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)
export { AuthContext }

