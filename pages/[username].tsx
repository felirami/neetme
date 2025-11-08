import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";
import Link from "next/link";

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
  }>;
}

export default function ProfilePage({ user, links }: ProfilePageProps) {
  const displayName = user.name && !user.name.startsWith('0x') ? user.name : user.username;
  const avatarUrl = user.avatar || user.image || '/img/logo-128x128.png';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-6 text-center">
            <div className="mb-6">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
            {user.bio && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">{user.bio}</p>
            )}
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <span>@{user.username}</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No links yet. Check back soon!
                </p>
              </div>
            ) : (
              links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 hover:shadow-2xl transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center gap-4">
                    {link.icon ? (
                      <img
                        src={link.icon}
                        alt={link.title}
                        className="w-12 h-12 rounded-lg object-contain"
                        onError={(e) => {
                          // Replace with fallback
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.className = "w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg";
                          fallback.textContent = link.title.charAt(0).toUpperCase();
                          img.parentElement?.insertBefore(fallback, img);
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {link.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{link.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {link.url}
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400"
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
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
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
    },
  });

  return {
    props: {
      user,
      links,
    },
  };
};

