import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";
import { getBrandColors } from "../lib/brandColors";
import Link from "next/link";
import { useAuth } from "../lib/authContext";
import { useAppKitAccount } from '@reown/appkit/react'

interface ProfilePageProps {
  user: {
    username: string;
    name: string | null;
    bio: string | null;
    avatar: string | null;
    image: string | null;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    iconColor?: string | null;
  }>;
}

export default function ProfilePage({ user, links }: ProfilePageProps) {
  const { user: authUser } = useAuth();
  const { isConnected } = useAppKitAccount();
  // Check if logged-in user is viewing their own profile
  const isOwnProfile = isConnected && authUser && authUser.username === user.username;
  
  // Use name if it exists and is not a wallet address, otherwise use username
  const displayTitle = user.name && !user.name.startsWith('0x') && user.name.trim() !== '' 
    ? user.name 
    : user.username;
  const avatarUrl = user.avatar || user.image || '/img/logo-128x128.png';

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Navigation bar for own profile */}
      {isOwnProfile && (
        <div className="border-b border-gray-tertiary/20 bg-dark-bg-alt/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-primary animate-pulse"></div>
                <span className="text-sm sm:text-sm font-medium text-gray-secondary">Viewing your profile</span>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm text-neon-primary hover:text-neon-primary-alt bg-dark-bg hover:bg-dark-bg-alt border border-neon-primary/30 hover:border-neon-primary/50 rounded-lg transition-all duration-200 font-medium w-full sm:w-auto"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="card-neon-glow p-6 sm:p-8 mb-6 text-center">
            <div className="mb-4 sm:mb-6">
              <img
                src={avatarUrl}
                alt={displayTitle}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 border-neon-primary"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-primary">{displayTitle}</h1>
            {user.bio && (
              <p className="text-sm sm:text-base text-secondary px-4">{user.bio}</p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3 sm:space-y-4">
            {links.length === 0 ? (
              <div className="card-neon p-6 sm:p-8 text-center">
                <p className="text-gray-secondary text-sm sm:text-base">
                  No links yet. Check back soon!
                </p>
              </div>
            ) : (
              links.map((link) => {
                // Get colors: custom or brand default
                const brandColors = getBrandColors(link.title);
                const backgroundColor = link.backgroundColor || brandColors.backgroundColor;
                const textColor = link.textColor || brandColors.textColor;
                const iconColor = link.iconColor || brandColors.iconColor;
                
                // Check if background is a gradient
                const isGradient = backgroundColor.includes('gradient') || backgroundColor.includes('linear-gradient');
                
                // Build icon URL with color if using Simple Icons
                let iconUrl = link.icon;
                if (iconUrl && iconUrl.includes('cdn.simpleicons.org') && iconColor) {
                  // Update icon color in Simple Icons URL
                  iconUrl = iconUrl.replace(/\/[0-9A-Fa-f]{6}/, `/${iconColor}`);
                }
                
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-lg shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[60px] flex items-center ${isGradient ? '' : ''}`}
                    style={{
                      background: backgroundColor,
                      color: textColor
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={link.title}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain flex-shrink-0"
                          style={{
                            filter: iconColor && iconColor !== 'FFFFFF' && iconColor !== '000000' 
                              ? `brightness(0) saturate(100%) invert(${iconColor === 'FFFFFF' ? 1 : 0})` 
                              : undefined
                          }}
                          onError={(e) => {
                            // Replace with fallback
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className = "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0";
                            fallback.style.backgroundColor = textColor === '#FFFFFF' || textColor === '#000000' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
                            fallback.style.color = textColor;
                            fallback.textContent = link.title.charAt(0).toUpperCase();
                            img.parentElement?.insertBefore(fallback, img);
                          }}
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0"
                          style={{
                            backgroundColor: textColor === '#FFFFFF' || textColor === '#000000' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                            color: textColor
                          }}
                        >
                          {link.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-semibold mb-1 truncate" style={{ color: textColor }}>
                          {link.title}
                        </h3>
                        <p 
                          className="text-xs sm:text-sm truncate"
                          style={{ 
                            color: textColor,
                            opacity: 0.8
                          }}
                        >
                          {link.url}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                        style={{ color: textColor, opacity: 0.7 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </a>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-gray-tertiary hover:text-neon-primary text-sm transition-colors"
            >
              Create your own NeetMeTree →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const username = context.params?.username as string;

  if (!username) {
    return {
      notFound: true,
    };
  }

  // Don't allow access to temporary usernames
  if (username.startsWith('temp_')) {
    return {
      notFound: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      name: true,
      bio: true,
      avatar: true,
      image: true,
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  const links = await prisma.link.findMany({
    where: {
      user: {
        username,
      },
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
      url: true,
      icon: true,
      backgroundColor: true,
      textColor: true,
      iconColor: true,
    },
  });

  return {
    props: {
      user,
      links,
    },
  };
};

