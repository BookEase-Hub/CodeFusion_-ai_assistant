"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Lock, CheckCircle, AlertCircle, HelpCircle, Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"

interface CardPaymentFormProps {
  onBack?: () => void
  onSuccess?: () => void
}

interface CardState {
  number: string
  expiry: string
  cvc: string
  country: string
}

interface ValidationState {
  number: "incomplete" | "complete" | "invalid"
  expiry: "incomplete" | "complete" | "invalid"
  cvc: "incomplete" | "complete" | "invalid"
}

export default function BillingPage({ onBack, onSuccess }: CardPaymentFormProps) {
  const [cardData, setCardData] = useState<CardState>({
    number: "",
    expiry: "",
    cvc: "",
    country: "Kenya",
  })

  const [validation, setValidation] = useState<ValidationState>({
    number: "incomplete",
    expiry: "incomplete",
    cvc: "incomplete",
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const expiryRef = useRef<HTMLInputElement>(null)
  const cvcRef = useRef<HTMLInputElement>(null)

  const daysLeftInTrial = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const trialProgress = ((14 - daysLeftInTrial) / 14) * 100

  const countries = [
    "Kenya",
    "South Africa",
    "Nigeria",
    "Ghana",
    "Uganda",
    "Tanzania",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
  ]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : v
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "")
    return v.length >= 2 ? `${v.substring(0, 2)}/${v.substring(2, 4)}` : v
  }

  const validateCardNumber = (number: string): "incomplete" | "complete" | "invalid" => {
    const cleaned = number.replace(/\s/g, "")
    if (cleaned.length === 0) return "incomplete"
    if (cleaned.length < 16) return "incomplete"
    return /^\d+$/.test(cleaned) ? "complete" : "invalid"
  }

  const validateExpiry = (expiry: string): "incomplete" | "complete" | "invalid" => {
    if (expiry.length < 5) return "incomplete"
    const [month, year] = expiry.split("/")
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(`20${year}`, 10)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (monthNum < 1 || monthNum > 12 || yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return "invalid"
    }
    return "complete"
  }

  const validateCVC = (cvc: string): "incomplete" | "complete" | "invalid" => {
    if (cvc.length < 3) return "incomplete"
    return /^\d{3,4}$/.test(cvc) ? "complete" : "invalid"
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) {
      setCardData((prev) => ({ ...prev, number: formatted }))
      setValidation((prev) => ({ ...prev, number: validateCardNumber(formatted) }))
      if (formatted.replace(/\s/g, "").length === 16) {
        expiryRef.current?.focus()
      }
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    if (formatted.length <= 5) {
      setCardData((prev) => ({ ...prev, expiry: formatted }))
      setValidation((prev) => ({ ...prev, expiry: validateExpiry(formatted) }))
      if (formatted.length === 5) {
        cvcRef.current?.focus()
      }
    }
  }

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 4) {
      setCardData((prev) => ({ ...prev, cvc: value }))
      setValidation((prev) => ({ ...prev, cvc: validateCVC(value) }))
    }
  }

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "")
    if (cleaned.startsWith("4")) return "visa"
    if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "mastercard"
    return "unknown"
  }

  const isFormValid = () =>
    validation.number === "complete" && validation.expiry === "complete" && validation.cvc === "complete" && cardData.country

  const handleSubmit = async () => {
    if (!isFormValid()) return
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate payment processing
    setIsProcessing(false)
    setIsSubscribed(true)
    onSuccess?.()
  }

  const getValidationIcon = (state: "incomplete" | "complete" | "invalid") => {
    if (state === "complete") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (state === "invalid") return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  const getValidationMessage = (field: keyof ValidationState) => {
    const state = validation[field]
    const fieldNames = { number: "Card number", expiry: "Expiry date", cvc: "Security code" }
    if (state === "complete") return `${fieldNames[field]} is complete`
    if (state === "invalid") return `${fieldNames[field]} is invalid`
    return `${fieldNames[field]} is incomplete`
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* Trial Card */}
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">14-Day Free Trial</CardTitle>
          <CardDescription>
            Unlimited access to all Premium features. {daysLeftInTrial} days left in your trial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Trial Progress</span>
              <span>{daysLeftInTrial} / 14 days remaining</span>
            </div>
            <Progress value={trialProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Premium Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Benefits</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Unlimited generations",
            "Unlimited code generation",
            "Mermaid architecture diagrams",
            "Explanations for debugging & code optimization",
            "Automated testing",
            "Full API integrations (GitHub, Swagger, Firebase)",
            "Priority support",
            "Early access to new features",
            "Advanced analytics",
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </CardTitle>
          <CardDescription>Enter your card details to complete your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <div className="relative">
              <Input
                id="card-number"
                placeholder="1234 1234 1234 1234"
                value={cardData.number}
                onChange={handleCardNumberChange}
                className={`pr-20 ${
                  validation.number === "invalid" ? "border-red-500" : validation.number === "complete" ? "border-green-500" : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {getValidationIcon(validation.number)}
                {getCardType(cardData.number) === "visa" && (
                  <div className="w-8 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded font-bold">VISA</div>
                )}
                {getCardType(cardData.number) === "mastercard" && (
                  <div className="w-8 h-5 bg-red-600 text-white text-xs flex items-center justify-center rounded font-bold">MC</div>
                )}
              </div>
            </div>
            <p className={`text-xs ${validation.number === "invalid" ? "text-red-500" : validation.number === "complete" ? "text-green-500" : "text-gray-500"}`}>
              {getValidationMessage("number")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <div className="relative">
                <Input
                  ref={expiryRef}
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={handleExpiryChange}
                  className={`${validation.expiry === "invalid" ? "border-red-500" : validation.expiry === "complete" ? "border-green-500" : ""}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon(validation.expiry)}</div>
              </div>
              <p className={`text-xs ${validation.expiry === "invalid" ? "text-red-500" : validation.expiry === "complete" ? "text-green-500" : "text-gray-500"}`}>
                {getValidationMessage("expiry")}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="cvc">Security Code (CVC)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent><p>3-digit code on back of card</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  ref={cvcRef}
                  id="cvc"
                  placeholder="123"
                  value={cardData.cvc}
                  onChange={handleCVCChange}
                  className={`${validation.cvc === "invalid" ? "border-red-500" : validation.cvc === "complete" ? "border-green-500" : ""}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon(validation.cvc)}</div>
              </div>
              <p className={`text-xs ${validation.cvc === "invalid" ? "text-red-500" : validation.cvc === "complete" ? "text-green-500" : "text-gray-500"}`}>
                {getValidationMessage("cvc")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={cardData.country} onValueChange={(value) => setCardData((prev) => ({ ...prev, country: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid() || isProcessing || isSubscribed} className="flex-1">
                {isProcessing ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Processing...</>
                ) : isSubscribed ? (
                  <><Check className="h-4 w-4 mr-2" />Premium active – enjoy benefits!</>
                ) : (
                  <><Lock className="h-4 w-4 mr-2" />Pay $15/month</>
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 text-center px-4">
              By clicking &quot;Pay $15/month&quot;, you&apos;ll start your Premium plan subscription of $15/month, with a renewal date of the same date each month.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
