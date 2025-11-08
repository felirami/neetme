import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authContext";
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { modal } from '@reown/appkit/react'
import { getSocialIconUrl, detectPlatformFromUrl, getPlatformSuggestions } from '../lib/socialIcons'
import imageCompression from 'browser-image-compression'
import { getDomain } from '../lib/utils'

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order: number;
}

export default function Dashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "" });
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; slug: string; url: string; iconUrl: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      // Check if user needs to set username
      if (!user.username || user.username.startsWith('temp_')) {
        router.push('/setup/username')
        return
      }
      setBio(user.bio || "")
      setUsername(user.username || "")
      setAvatarPreview(user.avatar || user.image || null)
      fetchLinks()
    } else if (!authLoading && !isConnected) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, isConnected])

  const fetchLinks = async () => {
    if (!user?.id || !address) return;
    try {
      const response = await fetch('/api/links', {
        headers: {
          "x-user-address": address,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url || !address) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-address": address,
        },
        body: JSON.stringify({ ...newLink, address }),
      });

      if (response.ok) {
        const link = await response.json();
        setLinks([...links, link]);
        setNewLink({ title: "", url: "", icon: "" });
        setCustomIconPreview(null);
        setShowAddLinkForm(false);
        setShowSuggestions(false);
        if (iconInputRef.current) {
          iconInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error("Error adding link:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!address) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-address": address,
        },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!address) return;
    
    // Validate username
    if (username.length < 5) {
      setUsernameError('Username must be at least 5 characters long')
      return
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      setUsernameError('Username can only contain lowercase letters, numbers, hyphens, and underscores')
      return
    }

    if (username === user.username) {
      setUsernameError('This is already your username')
      return
    }

    setIsSavingUsername(true)
    setUsernameError('')
    
    try {
      const response = await fetch("/api/user/username", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-address": address,
        },
        body: JSON.stringify({ username, address }),
      })

      const data = await response.json()

      if (!response.ok) {
        setUsernameError(data.error || 'Failed to update username')
        setIsSavingUsername(false)
        return
      }

      // Refresh user data (this will trigger useEffect to update username state)
      await refreshUser()
      setUsernameError('')
      // Show success message
      alert('Username updated successfully!')
    } catch (error) {
      console.error("Error updating username:", error)
      setUsernameError('An error occurred. Please try again.')
    } finally {
      setIsSavingUsername(false)
    }
  }

  const handleUpdateBio = async () => {
    if (!address) return;
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-address": address,
        },
        body: JSON.stringify({ bio, address }),
      });

      if (response.ok) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !address) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image is too large. Please select an image smaller than 5MB', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Compress image on client side
      const options = {
        maxSizeMB: 0.2, // 200KB max size
        maxWidthOrHeight: 400, // Max 400px width or height
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      const compressedFile = await imageCompression(file, options);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        try {
          // Upload compressed image
          const uploadResponse = await fetch('/api/upload/avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-address': address,
            },
            body: JSON.stringify({ imageData: base64data, address }),
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          const { avatarUrl } = await uploadResponse.json();

          // Update user avatar
          const updateResponse = await fetch('/api/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-user-address': address,
            },
            body: JSON.stringify({ avatar: avatarUrl, address }),
          });

          if (updateResponse.ok) {
            setAvatarPreview(avatarUrl);
            await refreshUser();
            setToast({ message: 'Profile picture updated successfully!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
          } else {
            throw new Error('Failed to update avatar');
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
          setToast({ message: 'Failed to upload profile picture. Please try again.', type: 'error' });
          setTimeout(() => setToast(null), 3000);
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      setToast({ message: 'Failed to process image. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      setIsUploadingAvatar(false);
    }
  };

  const handleCustomIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Validate file size (max 1MB before compression)
    if (file.size > 1 * 1024 * 1024) {
      setToast({ message: 'Image is too large. Please select an image smaller than 1MB', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsUploadingIcon(true);

    try {
      // Compress image to small icon size
      const options = {
        maxSizeMB: 0.05, // 50KB max size for icons
        maxWidthOrHeight: 64, // 64x64px max for icons
        useWebWorker: true,
        fileType: 'image/png',
      };

      const compressedFile = await imageCompression(file, options);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setCustomIconPreview(base64data);
        setNewLink({ ...newLink, icon: base64data });
        setIsUploadingIcon(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing icon:', error);
      setToast({ message: 'Failed to process icon. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      setIsUploadingIcon(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Disconnect using AppKit modal instance
      if (modal) {
        await modal.disconnect();
      }
      // Use window.location for full page reload to prevent redirect loops
      window.location.href = '/';
    } catch (error) {
      console.error('Error disconnecting:', error);
      // Still redirect even if disconnect fails
      window.location.href = '/';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <button
            onClick={() => open()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Wallet or Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <div className="flex gap-4">
              <a
                href={`/${username || user.username}`}
                target="_blank"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                View Profile
              </a>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Profile</h2>
            
            {/* Avatar Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarPreview || user.avatar || user.image || '/img/logo-128x128.png'}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max 5MB. Will be compressed to ~200KB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Username Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-500 dark:text-gray-400">{getDomain()}/</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                    setUsername(value)
                    setUsernameError('')
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="yourusername"
                  minLength={5}
                  maxLength={30}
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={isSavingUsername || username.length < 5 || username === user.username}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSavingUsername ? "Saving..." : "Update"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Minimum 5 characters. Only lowercase letters, numbers, hyphens, and underscores.
              </p>
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
              {user.username && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Current profile: <a href={`/${user.username}`} target="_blank" className="text-blue-600 hover:underline">{getDomain()}/{user.username}</a>
                  {username !== user.username && username.length >= 5 && (
                    <span className="ml-2 text-gray-500">→ Will change to: {getDomain()}/{username}</span>
                  )}
                </p>
              )}
            </div>

            {/* Bio Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                placeholder="Tell people about yourself..."
              />
            </div>
            <button
              onClick={handleUpdateBio}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Bio"}
            </button>
          </div>

          {/* Links Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Links</h2>
            
            {/* Quick Add Social Links */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-3">Quick Add Social Links</h3>
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Traditional Social</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { 
                      name: 'X (Twitter)', 
                      url: 'https://x.com/', 
                      color: 'bg-black hover:bg-gray-800',
                      slug: 'x',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'TikTok', 
                      url: 'https://www.tiktok.com/@', 
                      color: 'bg-black hover:bg-gray-800',
                      slug: 'tiktok',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'Instagram', 
                      url: 'https://www.instagram.com/', 
                      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                      slug: 'instagram',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'YouTube', 
                      url: 'https://www.youtube.com/@', 
                      color: 'bg-red-600 hover:bg-red-700',
                      slug: 'youtube',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'Facebook', 
                      url: 'https://www.facebook.com/', 
                      color: 'bg-blue-600 hover:bg-blue-700',
                      slug: 'facebook',
                      iconColor: 'FFFFFF'
                    },
                  ].map((social) => {
                    const iconUrl = `https://cdn.simpleicons.org/${social.slug}/${social.iconColor}`
                    return (
                      <button
                        key={social.name}
                        onClick={() => {
                          setShowAddLinkForm(true);
                          setNewLink({
                            title: social.name,
                            url: social.url,
                            icon: iconUrl,
                          });
                          setShowSuggestions(false);
                          // Scroll to the add link form after a brief delay to ensure it's rendered
                          setTimeout(() => {
                            document.getElementById('add-link-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        className={`${social.color} text-white p-4 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-2 text-sm font-medium shadow-md`}
                      >
                        <img 
                          src={iconUrl} 
                          alt={social.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Replace with fallback icon
                            const img = e.currentTarget;
                            img.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm';
                            fallback.textContent = social.name.charAt(0).toUpperCase();
                            img.parentElement?.insertBefore(fallback, img);
                          }}
                        />
                        <span className="text-xs">{social.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Web3 Platforms</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { 
                      name: 'Lens', 
                      url: 'https://lens.xyz/u/', 
                      color: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
                      slug: 'lens',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'Farcaster', 
                      url: 'https://farcaster.xyz/', 
                      color: 'bg-purple-600 hover:bg-purple-700',
                      slug: 'farcaster',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'OpenSea', 
                      url: 'https://opensea.io/', 
                      color: 'bg-blue-600 hover:bg-blue-700',
                      slug: 'opensea',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'Bluesky', 
                      url: 'https://bsky.app/profile/', 
                      color: 'bg-blue-500 hover:bg-blue-600',
                      slug: 'bluesky',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'ENS', 
                      url: 'https://app.ens.domains/', 
                      color: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600',
                      slug: 'ens',
                      iconColor: 'FFFFFF'
                    },
                  ].map((social) => {
                    const iconUrl = `https://cdn.simpleicons.org/${social.slug}/${social.iconColor}`
                    return (
                      <button
                        key={social.name}
                        onClick={() => {
                          setShowAddLinkForm(true);
                          setNewLink({
                            title: social.name,
                            url: social.url,
                            icon: iconUrl,
                          });
                          setShowSuggestions(false);
                          // Scroll to the add link form after a brief delay to ensure it's rendered
                          setTimeout(() => {
                            document.getElementById('add-link-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        className={`${social.color} text-white p-4 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-2 text-sm font-medium shadow-md`}
                      >
                        <img 
                          src={iconUrl} 
                          alt={social.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Replace with fallback icon
                            const img = e.currentTarget;
                            img.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm';
                            fallback.textContent = social.name.charAt(0).toUpperCase();
                            img.parentElement?.insertBefore(fallback, img);
                          }}
                        />
                        <span className="text-xs">{social.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Add New Link */}
            {!showAddLinkForm ? (
              <button
                onClick={() => {
                  setShowAddLinkForm(true)
                  setShowSuggestions(true)
                  setSuggestions(getPlatformSuggestions(''))
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Link
              </button>
            ) : (
              <div id="add-link-form" className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Add New Link</h3>
                  <button
                    onClick={() => {
                      setShowAddLinkForm(false)
                      setNewLink({ title: "", url: "", icon: "" })
                      setShowSuggestions(false)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* Title input with suggestions */}
                  <div className="relative z-50">
                    <input
                      type="text"
                      placeholder="Start typing platform name (e.g., GitHub, Instagram)..."
                      value={newLink.title}
                      onChange={(e) => {
                        const title = e.target.value
                        // Auto-detect icon from title if it's a known platform
                        const iconUrl = getSocialIconUrl(title)
                        
                        // Show suggestions if typing
                        if (title.length > 0) {
                          const platformSuggestions = getPlatformSuggestions(title)
                          setSuggestions(platformSuggestions)
                          setShowSuggestions(platformSuggestions.length > 0)
                        } else {
                          setSuggestions(getPlatformSuggestions(''))
                          setShowSuggestions(true)
                        }
                        
                        setNewLink({ 
                          ...newLink, 
                          title,
                          icon: iconUrl || newLink.icon
                        })
                      }}
                      onFocus={() => {
                        if (newLink.title.length === 0) {
                          setSuggestions(getPlatformSuggestions(''))
                          setShowSuggestions(true)
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow click events
                        setTimeout(() => setShowSuggestions(false), 200)
                      }}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                    />
                    
                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.slug}
                            type="button"
                            onMouseDown={(e) => {
                              // Prevent blur event from firing before click
                              e.preventDefault()
                            }}
                            onClick={() => {
                              setNewLink({
                                title: suggestion.name,
                                url: suggestion.url,
                                icon: suggestion.iconUrl,
                              })
                              setShowSuggestions(false)
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-left transition-colors"
                          >
                            <img 
                              src={suggestion.iconUrl} 
                              alt={suggestion.name}
                              className="w-6 h-6"
                              onError={(e) => {
                                // Replace with fallback
                                const img = e.currentTarget;
                                img.style.display = "none";
                                const fallback = document.createElement("div");
                                fallback.className = "w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs";
                                fallback.textContent = suggestion.name.charAt(0).toUpperCase();
                                img.parentElement?.insertBefore(fallback, img);
                              }}
                            />
                            <span className="font-medium">{suggestion.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="url"
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => {
                      const url = e.target.value
                      // Auto-detect platform and fill icon
                      const detected = detectPlatformFromUrl(url)
                      if (detected && !newLink.icon) {
                        setNewLink({ 
                          ...newLink, 
                          url,
                          title: detected.name || newLink.title,
                          icon: detected.iconUrl || newLink.icon
                        })
                        setShowSuggestions(false)
                      } else {
                        setNewLink({ ...newLink, url })
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                  />
                  
                  {/* Icon Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Icon (Optional)
                    </label>
                    
                    {/* Icon Preview */}
                    {(newLink.icon || customIconPreview) && (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        {customIconPreview || newLink.icon ? (
                          <img 
                            src={customIconPreview || newLink.icon} 
                            alt="Icon preview" 
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              // Replace with fallback
                              const img = e.currentTarget;
                              img.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className = "w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-sm";
                              fallback.textContent = newLink.title.charAt(0).toUpperCase() || "?";
                              img.parentElement?.insertBefore(fallback, img);
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {newLink.title.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {customIconPreview ? 'Custom icon' : 'Auto-detected icon'}
                          </span>
                        </div>
                        {(customIconPreview || newLink.icon) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomIconPreview(null);
                              setNewLink({ ...newLink, icon: "" });
                              if (iconInputRef.current) {
                                iconInputRef.current.value = '';
                              }
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Upload Custom Icon */}
                    <div className="flex items-center gap-2">
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCustomIconUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={isUploadingIcon}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isUploadingIcon ? 'Uploading...' : 'Upload Custom Icon'}
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Max 1MB, will be resized to 64x64px
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddLink}
                      disabled={isSaving || !newLink.title || !newLink.url}
                      className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSaving ? "Adding..." : "Add Link"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddLinkForm(false)
                        setNewLink({ title: "", url: "", icon: "" })
                        setCustomIconPreview(null)
                        setShowSuggestions(false)
                        if (iconInputRef.current) {
                          iconInputRef.current.value = '';
                        }
                      }}
                      className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Links */}
            <div className="space-y-3">
              {links.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No links yet. Add your first link above!
                </p>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{link.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{link.url}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={isSaving}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


