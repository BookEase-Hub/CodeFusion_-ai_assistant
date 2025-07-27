"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Camera, X, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AppLayout } from "@/components/app-layout"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

export default function ProfilePage() {
  const { user, updateProfile, updateAvatar } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  })
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()

  // Avatar upload state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const imageRef = useRef<HTMLImageElement | null>(null)

  const getCroppedImage = () => {
    if (!imageRef.current || !crop.width || !crop.height) return null

    const canvas = document.createElement("canvas")
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    const pixelRatio = window.devicePixelRatio

    canvas.width = crop.width * scaleX * pixelRatio
    canvas.height = crop.height * scaleY * pixelRatio

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )

    return canvas.toDataURL("image/jpeg", 0.9)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setUploadedImage(reader.result as string)
      setAvatarDialogOpen(true)
    }
    reader.readAsDataURL(file)
    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const handleSaveAvatar = async () => {
    const croppedImageUrl = getCroppedImage()
    if (!croppedImageUrl) return

    setIsSubmitting(true)
    try {
      await updateAvatar(croppedImageUrl)
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      })
      setAvatarDialogOpen(false)
      setUploadedImage(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings</p>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Update your profile picture. This will be displayed on your profile and in comments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" asChild>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Avatar
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </Button>
                  {user.avatar && (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={async () => {
                        setIsSubmitting(true)
                        try {
                          await updateAvatar("")
                          toast({
                            title: "Avatar removed",
                            description: "Your avatar has been removed successfully.",
                          })
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "There was a problem removing your avatar. Please try again.",
                            variant: "destructive",
                          })
                        } finally {
                          setIsSubmitting(false)
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information. This information will be displayed publicly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      name="bio"
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-muted-foreground">Brief description for your profile.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setFormData({
                        name: user.name,
                        email: user.email,
                        bio: user.bio || "",
                      })
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user.name.toLowerCase().replace(/\s+/g, ".")} disabled />
                  <p className="text-sm text-muted-foreground">
                    Your username is automatically generated from your name.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Input id="account-type" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-created">Account Created</Label>
                  <Input id="account-created" value={new Date().toLocaleDateString()} disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-destructive/50 p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all of your content. This action cannot be undone.
                    </p>
                    <div className="mt-2">
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Avatar Crop Dialog */}
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crop Avatar</DialogTitle>
              <DialogDescription>
                Adjust the crop area to select the portion of the image you want to use as your avatar.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[60vh] overflow-hidden">
              {uploadedImage && (
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} circularCrop aspect={1}>
                  <Image
                    ref={imageRef}
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="max-w-full max-h-[50vh] object-contain"
                    width={500}
                    height={500}
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAvatarDialogOpen(false)
                  setUploadedImage(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
