"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool,
  type ICognitoUserAttributeData,
} from "amazon-cognito-identity-js"

interface AuthContextProps {
  user: CognitoUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  signUp: (username: string, password: string, attributes: ICognitoUserAttributeData[]) => Promise<void>
  verify: (username: string, code: string) => Promise<void>
  forgotPassword: (username: string) => Promise<void>
  confirmPassword: (username: string, newPassword: string, code: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  userPoolId: string
  clientId: string
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children, userPoolId, clientId }) => {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    })

    const cognitoUser = userPool.getCurrentUser()

    if (cognitoUser) {
      cognitoUser.getSession((err: any, session: any) => {
        if (err) {
          console.error(err)
          setUser(null)
        } else {
          setUser(cognitoUser)
        }
      })
    } else {
      setUser(null)
    }
  }, [clientId, userPoolId])

  const login = (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setIsLoading(true)
      const userPool = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
      })

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      })

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("login success:", result)
          setUser(cognitoUser)
          setIsLoading(false)
          resolve()
        },
        onFailure: (err) => {
          console.error("login failure:", err)
          setIsLoading(false)
          reject(err)
        },
      })
    })
  }

  const logout = () => {
    const userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    })

    const cognitoUser = userPool.getCurrentUser()

    if (cognitoUser) {
      cognitoUser.signOut()
      setUser(null)
    }
  }

  const signUp = (username: string, password: string, attributes: ICognitoUserAttributeData[]) => {
    return new Promise<void>((resolve, reject) => {
      const userPool = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
      })

      userPool.signUp(username, password, attributes, [], (err, result) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          console.log("sign up result", result)
          resolve()
        }
      })
    })
  }

  const verify = (username: string, code: string) => {
    return new Promise<void>((resolve, reject) => {
      const userPool = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
      })

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          console.log("verify result", result)
          resolve()
        }
      })
    })
  }

  const forgotPassword = (username: string) => {
    return new Promise<void>((resolve, reject) => {
      const userPool = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
      })

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          console.log("forgot password success", data)
          resolve()
        },
        onFailure: (err) => {
          console.error("forgot password failure", err)
          reject(err)
        },
      })
    })
  }

  const confirmPassword = (username: string, newPassword: string, code: string) => {
    return new Promise<void>((resolve, reject) => {
      const userPool = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
      })

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: (data) => {
          console.log("confirm password success", data)
          resolve()
        },
        onFailure: (err) => {
          console.error("confirm password failure", err)
          reject(err)
        },
      })
    })
  }

  const value: AuthContextProps = {
    user,
    login,
    logout,
    signUp,
    verify,
    forgotPassword,
    confirmPassword,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// -------------------------------------------------------------
// re-exports so the module exposes the named symbols v0 expects
// -------------------------------------------------------------
export { AuthProvider, useAuth }
