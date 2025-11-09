import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../lib/authContext";
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { modal } from '@reown/appkit/react'
import { getSocialIconUrl, detectPlatformFromUrl, getPlatformSuggestions } from '../lib/socialIcons'
import { getBrandColors } from '../lib/brandColors'
import imageCompression from 'browser-image-compression'
import { getDomain } from '../lib/utils'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Dynamically import markdown editor to avoid SSR issues
const MdEditor = dynamic(
  () => import('react-markdown-editor-lite'),
  { ssr: false }
)

// Dynamically import WYSIWYG markdown editor
// Load CSS separately to avoid Next.js build errors
const MDEditorWYSIWYG = dynamic(
  () => {
    // Load CSS files dynamically
    if (typeof window !== 'undefined') {
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = '/css/mdeditor.css';
      if (!document.querySelector(`link[href="${link1.href}"]`)) {
        document.head.appendChild(link1);
      }
      
      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = '/css/markdown-preview.css';
      if (!document.querySelector(`link[href="${link2.href}"]`)) {
        document.head.appendChild(link2);
      }
    }
    
    return import('@uiw/react-md-editor').then((mod) => mod.default);
  },
  { ssr: false }
)

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order: number;
  backgroundColor?: string | null;
  textColor?: string | null;
  iconColor?: string | null;
}

export default function Dashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [newLink, setNewLink] = useState({ 
    title: "", 
    url: "", 
    icon: "",
    backgroundColor: "",
    textColor: "",
    iconColor: ""
  });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [useFullEditor, setUseFullEditor] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If not connected, redirect to sign in (but wait a bit in case connection is still initializing)
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) {
          router.push('/auth/signin');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    // If connected but no user data yet, wait (user might still be loading)
    if (!user) {
      return;
    }

    // If user exists but needs to set username, redirect to setup
    if (!user.username || user.username.startsWith('temp_')) {
      router.push('/setup/username');
      return;
    }

    // User is connected and has username - load dashboard data
    setBio(user.bio || "");
    setAboutMe((user as any).aboutMe || "");
    // Only set name if it's not a wallet address
    const userName = user.name && !user.name.startsWith('0x') ? user.name : "";
    setName(userName);
    setUsername(user.username || "");
    setAvatarPreview(user.avatar || user.image || null);
    fetchLinks();
  }, [user, authLoading, isConnected, router]);

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
      // Get brand colors if not custom
      const brandColors = getBrandColors(newLink.title);
      const backgroundColor = newLink.backgroundColor || brandColors.backgroundColor;
      const textColor = newLink.textColor || brandColors.textColor;
      const iconColor = newLink.iconColor || brandColors.iconColor;

      const response = await fetch("/api/links", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-address": address,
        },
        body: JSON.stringify({ 
          ...newLink, 
          address,
          backgroundColor,
          textColor,
          iconColor
        }),
      });

      if (response.ok) {
        const link = await response.json();
        setLinks([...links, link]);
        setNewLink({ title: "", url: "", icon: "", backgroundColor: "", textColor: "", iconColor: "" });
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

  const handleUpdateLink = async (link: Link) => {
    if (!address) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-address": address,
        },
        body: JSON.stringify({ 
          ...link,
          address 
        }),
      });

      if (response.ok) {
        const updatedLink = await response.json();
        setLinks(links.map(l => l.id === link.id ? updatedLink : l));
        setEditingLink(null);
        setToast({ message: 'Link updated successfully!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error updating link:", error);
      setToast({ message: 'Failed to update link', type: 'error' });
      setTimeout(() => setToast(null), 3000);
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
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long')
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
        body: JSON.stringify({ bio, name, aboutMe, address }),
      });

      if (response.ok) {
        await refreshUser();
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
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
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Error disconnecting:', error);
      // Still redirect even if disconnect fails
      window.location.href = '/';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-primary mx-auto"></div>
          <p className="mt-4 text-gray-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isConnected) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-primary">Please sign in</h1>
              <button
                onClick={() => open()}
                className="btn-neon"
              >
                Connect Wallet or Sign In
              </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">Dashboard</h1>
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-primary hover:text-neon-primary transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            {/* Desktop Menu */}
            <div className="hidden sm:flex flex-row gap-4">
              <Link
                href="/"
                className="btn-neon-outline"
              >
                Home
              </Link>
              <a
                href={`/${username || user.username}`}
                target="_blank"
                className="btn-neon-outline"
              >
                View Profile
              </a>
              <button
                onClick={handleSignOut}
                className="px-4 py-3 sm:py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors min-h-[44px] flex items-center justify-center"
              >
                Sign Out
              </button>
            </div>
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="sm:hidden w-full flex flex-col gap-2 mt-2">
                <Link
                  href="/"
                  className="btn-neon-outline text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <a
                  href={`/${username || user.username}`}
                  target="_blank"
                  className="btn-neon-outline text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Profile
                </a>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Description */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-dark-bg-alt/50 border border-gray-tertiary/20 rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-center">
              <p className="text-sm sm:text-base text-gray-secondary leading-relaxed">
                Customize your <span className="text-neon-primary font-medium">NEET.me</span> profile page. Edit your title, bio, and manage your links here.
              </p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="card-neon p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-primary">Profile</h2>
            
            {/* Avatar Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-primary text-center">Profile Picture</label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarPreview || user.avatar || user.image || '/img/logo-128x128.png'}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-tertiary/30 object-cover"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-primary"></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center w-full">
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
                    className="btn-neon-outline"
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <p className="text-xs text-gray-tertiary mt-2 text-center">
                    Max 5MB. Will be compressed to ~200KB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Username Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-primary">Profile Link</label>
              <div className="space-y-3 mb-2">
                {/* Domain prefix - show separately on mobile */}
                <div className="sm:hidden">
                  <span className="text-gray-tertiary text-xs">{getDomain()}/</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="hidden sm:inline text-gray-tertiary text-sm flex-shrink-0">{getDomain()}/</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                        setUsername(value)
                        setUsernameError('')
                      }}
                      className="input-neon flex-1 min-w-0 min-h-[44px] text-sm sm:text-base"
                      placeholder="yourusername"
                      minLength={5}
                      maxLength={30}
                    />
                  </div>
                  <button
                    onClick={handleUpdateUsername}
                    disabled={isSavingUsername || username.length < 3 || username === user.username}
                    className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:whitespace-nowrap"
                  >
                    {isSavingUsername ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-tertiary mb-1 break-words">
                This will be your profile link: {getDomain()}/{username || 'yourusername'}
              </p>
              <p className="text-xs text-gray-tertiary mb-1">
                Minimum 3 characters. Only lowercase letters, numbers, hyphens, and underscores.
              </p>
              {usernameError && (
                <p className="text-red-400 text-sm mt-1">{usernameError}</p>
              )}
              {user.username && (
                <p className="text-sm text-gray-secondary mt-2">
                  Current profile: <a href={`/${user.username}`} target="_blank" className="text-neon-primary hover:text-neon-primary-alt link-neon">{getDomain()}/{user.username}</a>
                  {username !== user.username && username.length >= 5 && (
                    <span className="ml-2 text-gray-tertiary">→ Will change to: {getDomain()}/{username}</span>
                  )}
                </p>
              )}
            </div>

            {/* Title Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-primary">Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-neon w-full min-h-[44px]"
                placeholder="NEET maximum"
                maxLength={30}
              />
              <p className="text-xs text-gray-tertiary mt-1">
                This will be shown as the title on your profile page ({name.length}/30)
              </p>
            </div>

            {/* Bio Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-primary">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-neon w-full resize-y"
                rows={3}
                placeholder="Tell people about yourself..."
                maxLength={160}
              />
              <p className="text-xs text-gray-tertiary mt-1">
                {bio.length}/160 characters
              </p>
            </div>
            <button
              onClick={handleUpdateBio}
              disabled={isSaving}
              className="btn-neon w-full sm:w-auto disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {/* About Me Section */}
          {!loading && user && (
            <div className="card-neon p-4 sm:p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-primary">About Me</h2>
                {/* Full Editor toggle - hidden for now, keeping code for future development */}
                {/* <button
                  onClick={() => setUseFullEditor(!useFullEditor)}
                  className="btn-neon-outline text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  {useFullEditor ? '📝 Simple Editor' : '📄 Full Editor'}
                </button> */}
              </div>
              <p className="text-xs text-gray-tertiary mb-4">
                Write about yourself using Markdown. Use markdown syntax like **bold**, *italic*, # headings, and [links](url).
              </p>
              
              {/* Full Editor - hidden for now, keeping code for future development */}
              {false && useFullEditor ? (
                <div className="mb-4">
                  <MDEditorWYSIWYG
                    value={aboutMe}
                    onChange={(value) => setAboutMe(value || '')}
                    preview="edit" // Show only editor (no split view)
                    hideToolbar={false}
                    visibleDragbar={false}
                    height={500}
                    data-color-mode="dark"
                    textareaProps={{
                      placeholder: 'Start typing your markdown here... Use the toolbar above for formatting.',
                    }}
                  />
                  {aboutMe && (
                    <div className="mt-4 p-4 sm:p-6 bg-dark-bg-alt/50 border border-neon-primary/20 rounded-lg">
                      <p className="text-xs text-neon-primary mb-3 font-semibold flex items-center gap-2">
                        <span>✨</span> Live Preview
                      </p>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-primary mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-primary mb-2 mt-4" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 mt-3" {...props} />,
                            p: ({node, ...props}) => <p className="text-sm sm:text-base text-gray-secondary mb-2" {...props} />,
                            a: ({node, ...props}) => <a className="text-neon-primary hover:text-neon-primary-alt underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-secondary mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-secondary mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-sm sm:text-base" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            code: ({node, ...props}) => <code className="bg-dark-bg-alt px-1 py-0.5 rounded text-xs font-mono text-neon-primary" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-neon-primary/30 pl-4 italic text-gray-tertiary my-2" {...props} />,
                          }}
                        >
                          {aboutMe}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <textarea
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Write about yourself using Markdown...&#10;&#10;Example:&#10;# About Me&#10;&#10;This is my bio. I can use **bold**, *italic*, and [links](https://example.com)."
                    className="input-neon w-full min-h-[400px] sm:min-h-[500px] font-mono text-sm p-4 resize-y"
                    style={{ minHeight: '400px' }}
                  />
                  <p className="text-xs text-gray-tertiary mt-2">
                    💡 Tip: Use markdown syntax like **bold**, *italic*, # headings, and [links](url). Switch to Full Editor for formatting tools.
                  </p>
                </div>
              )}
              
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-tertiary">
                  Your content will be displayed on your profile page with markdown formatting.
                </p>
                <button
                  onClick={handleUpdateBio}
                  disabled={isSaving}
                  className="btn-neon-outline text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Save About Me"}
                </button>
              </div>
            </div>
          )}

          {/* Links Section */}
          <div className="card-neon p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-primary">Links</h2>
            
            {/* Quick Add Social Links */}
            <div className="mb-6 p-3 sm:p-4 bg-dark-bg-alt/50 border border-gray-tertiary/20 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm sm:text-base text-primary">Quick Add Social Links</h3>
              <div className="mb-4">
                <div className="text-xs text-gray-tertiary mb-2">Traditional Social</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { 
                      name: 'X (Twitter)', 
                      url: 'https://x.com/', 
                      color: 'bg-black hover:bg-gray-900 border-2 border-gray-700 hover:border-gray-600',
                      slug: 'x',
                      iconColor: 'FFFFFF'
                    },
                    { 
                      name: 'TikTok', 
                      url: 'https://www.tiktok.com/@', 
                      color: 'bg-black hover:bg-gray-900 border-2 border-gray-700 hover:border-gray-600',
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
                          const brandColors = getBrandColors(social.name);
                          setNewLink({
                            title: social.name,
                            url: social.url,
                            icon: iconUrl,
                            backgroundColor: brandColors.backgroundColor,
                            textColor: brandColors.textColor,
                            iconColor: brandColors.iconColor
                          });
                          setShowSuggestions(false);
                          // Scroll to the add link form after a brief delay to ensure it's rendered
                          setTimeout(() => {
                            document.getElementById('add-link-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        className={`${social.color} text-white p-4 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-2 text-sm font-medium shadow-md hover:shadow-neon-sm`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <img 
                            src={iconUrl} 
                            alt={social.name}
                            className="w-full h-full object-contain"
                            style={{ 
                              filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))'
                            }}
                            onError={(e) => {
                              // Replace with fallback icon
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-8 h-8 rounded bg-white/30 flex items-center justify-center text-white font-bold text-sm';
                              fallback.textContent = social.name.charAt(0).toUpperCase();
                              img.parentElement?.insertBefore(fallback, img);
                            }}
                          />
                        </div>
                        <span className="text-xs text-white font-medium drop-shadow-sm">{social.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-tertiary mb-2">Web3 Platforms</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
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
                          const brandColors = getBrandColors(social.name);
                          setNewLink({
                            title: social.name,
                            url: social.url,
                            icon: iconUrl,
                            backgroundColor: brandColors.backgroundColor,
                            textColor: brandColors.textColor,
                            iconColor: brandColors.iconColor
                          });
                          setShowSuggestions(false);
                          // Scroll to the add link form after a brief delay to ensure it's rendered
                          setTimeout(() => {
                            document.getElementById('add-link-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 100);
                        }}
                        className={`${social.color} text-white p-4 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-2 text-sm font-medium shadow-md hover:shadow-neon-sm`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <img 
                            src={iconUrl} 
                            alt={social.name}
                            className="w-full h-full object-contain"
                            style={{ 
                              filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))'
                            }}
                            onError={(e) => {
                              // Replace with fallback icon
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-8 h-8 rounded bg-white/30 flex items-center justify-center text-white font-bold text-sm';
                              fallback.textContent = social.name.charAt(0).toUpperCase();
                              img.parentElement?.insertBefore(fallback, img);
                            }}
                          />
                        </div>
                        <span className="text-xs text-white font-medium drop-shadow-sm">{social.name}</span>
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
                className="btn-neon w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Link</span>
              </button>
            ) : (
              <div id="add-link-form" className="mb-6 p-4 bg-dark-bg-alt/50 border border-gray-tertiary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary">Add New Link</h3>
                  <button
                    onClick={() => {
                      setShowAddLinkForm(false)
                      setNewLink({ title: "", url: "", icon: "", backgroundColor: "", textColor: "", iconColor: "" })
                      setShowSuggestions(false)
                    }}
                    className="text-gray-tertiary hover:text-neon-primary transition-colors"
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
                        // Auto-apply brand colors
                        const brandColors = getBrandColors(title)
                        
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
                          icon: iconUrl || newLink.icon,
                          // Apply brand colors if not already customized
                          backgroundColor: newLink.backgroundColor || brandColors.backgroundColor,
                          textColor: newLink.textColor || brandColors.textColor,
                          iconColor: newLink.iconColor || brandColors.iconColor
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
                      className="input-neon w-full min-h-[44px]"
                    />
                    
                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-dark-bg-alt border border-gray-tertiary/30 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.slug}
                            type="button"
                            onMouseDown={(e) => {
                              // Prevent blur event from firing before click
                              e.preventDefault()
                            }}
                            onClick={() => {
                              const brandColors = getBrandColors(suggestion.name);
                              setNewLink({
                                title: suggestion.name,
                                url: suggestion.url,
                                icon: suggestion.iconUrl,
                                backgroundColor: brandColors.backgroundColor,
                                textColor: brandColors.textColor,
                                iconColor: brandColors.iconColor,
                              })
                              setShowSuggestions(false)
                            }}
                            className="w-full px-4 py-3 hover:bg-dark-bg-alt/80 hover:border-neon-primary/30 flex items-center gap-3 text-left transition-colors text-primary"
                          >
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              <img 
                                src={suggestion.iconUrl} 
                                alt={suggestion.name}
                                className="w-full h-full object-contain"
                                style={{ 
                                  filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))'
                                }}
                                onError={(e) => {
                                  // Replace with fallback
                                  const img = e.currentTarget;
                                  img.style.display = "none";
                                  const fallback = document.createElement("div");
                                  fallback.className = "w-6 h-6 rounded bg-neon-primary/20 flex items-center justify-center text-neon-primary font-bold text-xs";
                                  fallback.textContent = suggestion.name.charAt(0).toUpperCase();
                                  img.parentElement?.insertBefore(fallback, img);
                                }}
                              />
                            </div>
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
                    className="input-neon w-full min-h-[44px]"
                  />
                  
                  {/* Icon Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-primary">
                      Icon (Optional)
                    </label>
                    
                    {/* Icon Preview */}
                    {(newLink.icon || customIconPreview) && (
                      <div className="flex items-center gap-3 p-3 bg-dark-bg-alt/50 border border-gray-tertiary/20 rounded-lg">
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
                              fallback.className = "w-8 h-8 rounded bg-neon-primary flex items-center justify-center text-dark-bg font-bold text-sm";
                              fallback.textContent = newLink.title.charAt(0).toUpperCase() || "?";
                              img.parentElement?.insertBefore(fallback, img);
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-neon-primary flex items-center justify-center text-dark-bg font-bold text-sm">
                            {newLink.title.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="text-sm text-gray-secondary">
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
                        className="btn-neon-outline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isUploadingIcon ? 'Uploading...' : 'Upload Custom Icon'}
                      </button>
                      <span className="text-xs text-gray-tertiary">
                        Max 1MB, will be resized to 64x64px
                      </span>
                    </div>
                  </div>
                  
                  {/* Color Customization */}
                  <div className="space-y-3 pt-3 border-t border-gray-tertiary/30">
                    <label className="block text-sm font-medium text-primary">
                      Customize Colors (Optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-tertiary mb-1">Background</label>
                        {(() => {
                          const brandColors = getBrandColors(newLink.title);
                          const isGradient = brandColors.isGradient || (brandColors.backgroundColor.includes('gradient') || brandColors.backgroundColor.includes('linear-gradient'));
                          const bgColor = newLink.backgroundColor || brandColors.backgroundColor;
                          const isCustomGradient = bgColor.includes('gradient') || bgColor.includes('linear-gradient');
                          
                          if (isGradient || isCustomGradient) {
                            return (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={bgColor}
                                  onChange={(e) => setNewLink({ ...newLink, backgroundColor: e.target.value })}
                                  placeholder="e.g., linear-gradient(45deg, #f09433, #bc1888)"
                                  className="w-full px-3 py-2 text-xs border border-gray-tertiary/30 rounded-lg bg-dark-bg-alt text-primary placeholder-gray-tertiary"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const brandColors = getBrandColors(newLink.title)
                                    setNewLink({ ...newLink, backgroundColor: brandColors.backgroundColor })
                                  }}
                                  className="w-full px-3 py-2 text-xs bg-dark-bg-alt border border-gray-tertiary/30 rounded hover:bg-dark-bg-alt/80 hover:border-neon-primary/50 text-primary transition-colors"
                                  title="Reset to brand color"
                                >
                                  Reset
                                </button>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={bgColor.startsWith('#') ? bgColor : `#${bgColor}`}
                                onChange={(e) => setNewLink({ ...newLink, backgroundColor: e.target.value })}
                                className="w-full h-10 rounded border border-gray-tertiary/30 cursor-pointer bg-dark-bg-alt"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const brandColors = getBrandColors(newLink.title)
                                  setNewLink({ ...newLink, backgroundColor: brandColors.backgroundColor })
                                }}
                                className="px-3 py-2 text-xs bg-dark-bg-alt border border-gray-tertiary/30 rounded hover:bg-dark-bg-alt/80 hover:border-neon-primary/50 text-primary transition-colors"
                                title="Reset to brand color"
                              >
                                Reset
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-tertiary mb-1">Text</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={newLink.textColor ? (newLink.textColor.startsWith('#') ? newLink.textColor : `#${newLink.textColor}`) : (getBrandColors(newLink.title).textColor.startsWith('#') ? getBrandColors(newLink.title).textColor : `#${getBrandColors(newLink.title).textColor}`)}
                            onChange={(e) => setNewLink({ ...newLink, textColor: e.target.value })}
                            className="w-full h-10 rounded border border-gray-tertiary/30 cursor-pointer bg-dark-bg-alt"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const brandColors = getBrandColors(newLink.title)
                              setNewLink({ ...newLink, textColor: brandColors.textColor })
                            }}
                            className="px-3 py-2 text-xs bg-dark-bg-alt border border-gray-tertiary/30 rounded hover:bg-dark-bg-alt/80 hover:border-neon-primary/50 text-primary transition-colors"
                            title="Reset to brand color"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-tertiary mb-1">Icon</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={newLink.iconColor || getBrandColors(newLink.title).iconColor || '000000'}
                            onChange={(e) => setNewLink({ ...newLink, iconColor: e.target.value.replace('#', '') })}
                            className="w-full h-10 rounded border border-gray-tertiary/30 cursor-pointer bg-dark-bg-alt"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const brandColors = getBrandColors(newLink.title)
                              setNewLink({ ...newLink, iconColor: brandColors.iconColor })
                            }}
                            className="px-3 py-2 text-xs bg-dark-bg-alt border border-gray-tertiary/30 rounded hover:bg-dark-bg-alt/80 hover:border-neon-primary/50 text-primary transition-colors"
                            title="Reset to brand color"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Preview */}
                    {newLink.title && (
                      <div className="mt-2 p-3 rounded-lg border border-gray-tertiary/30" 
                        style={{ 
                          background: newLink.backgroundColor || getBrandColors(newLink.title).backgroundColor,
                          color: newLink.textColor || getBrandColors(newLink.title).textColor
                        }}>
                        <div className="flex items-center gap-3">
                          {(newLink.icon || customIconPreview) && (
                            <img 
                              src={customIconPreview || newLink.icon || ''} 
                              alt="Preview"
                              className="w-6 h-6"
                              style={{ 
                                filter: newLink.iconColor && newLink.iconColor !== 'FFFFFF' && newLink.iconColor !== '000000'
                                  ? undefined
                                  : newLink.iconColor === 'FFFFFF' 
                                    ? 'brightness(0) invert(1)' 
                                    : undefined 
                              }}
                            />
                          )}
                          <span className="text-sm font-medium">{newLink.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddLink}
                      disabled={isSaving || !newLink.title || !newLink.url}
                      className="btn-neon flex-1 disabled:opacity-50"
                    >
                      {isSaving ? "Adding..." : "Add Link"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddLinkForm(false)
                        setNewLink({ title: "", url: "", icon: "", backgroundColor: "", textColor: "", iconColor: "" })
                        setCustomIconPreview(null)
                        setShowSuggestions(false)
                        if (iconInputRef.current) {
                          iconInputRef.current.value = '';
                        }
                      }}
                      className="btn-neon-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Links */}
            <div className="space-y-3 mt-6">
              {links.length === 0 ? (
                <p className="text-gray-tertiary text-center py-8">
                  No links yet. Add your first link above!
                </p>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 bg-dark-bg-alt/50 border border-gray-tertiary/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">{link.title}</h4>
                      <p className="text-sm text-gray-tertiary">{link.url}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={isSaving}
                      className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors min-h-[44px] flex items-center justify-center whitespace-nowrap"
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
                ? 'bg-neon-primary text-dark-bg shadow-neon-md'
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


