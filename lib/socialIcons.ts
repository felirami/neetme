// Helper function to get Simple Icons URL for social media platforms
export function getSocialIconUrl(platformName: string): string | null {
  // Map common platform names to Simple Icons slugs
  const iconMap: Record<string, string> = {
    // Traditional Social
    'x': 'x',
    'twitter': 'x',
    'tiktok': 'tiktok',
    'instagram': 'instagram',
    'youtube': 'youtube',
    'facebook': 'facebook',
    'linkedin': 'linkedin',
    'github': 'github',
    'discord': 'discord',
    'snapchat': 'snapchat',
    'pinterest': 'pinterest',
    'reddit': 'reddit',
    'telegram': 'telegram',
    'whatsapp': 'whatsapp',
    'spotify': 'spotify',
    'apple': 'apple',
    'google': 'google',
    'microsoft': 'microsoft',
    'amazon': 'amazon',
    'netflix': 'netflix',
    'twitch': 'twitch',
    'vimeo': 'vimeo',
    'behance': 'behance',
    'dribbble': 'dribbble',
    'medium': 'medium',
    'tumblr': 'tumblr',
    'soundcloud': 'soundcloud',
    'bandcamp': 'bandcamp',
    // Web3 Social
    'lens': 'lens',
    'lensprotocol': 'lens',
    'farcaster': 'farcaster',
    'bluesky': 'bluesky',
    'bsky': 'bluesky',
    'friendtech': 'friendtech',
    'friend.tech': 'friendtech',
    'mirror': 'mirror',
    'ens': 'ens',
    // Web3 Marketplaces
    'opensea': 'opensea',
    'blur': 'blur',
    'rarible': 'rarible',
    'foundation': 'foundation',
    'superrare': 'superrare',
    'zora': 'zora',
    'manifold': 'manifold',
    'soundxyz': 'soundxyz',
    'sound.xyz': 'soundxyz',
    'audius': 'audius',
    'showtime': 'showtime',
    // Web3 Tools
    'etherscan': 'etherscan',
    'debank': 'debank',
    'zerion': 'zerion',
    'unstoppabledomains': 'unstoppabledomains',
    // Web3 Chains
    'ethereum': 'ethereum',
    'polygon': 'polygon',
    'base': 'base',
    'arbitrum': 'arbitrum',
    'optimism': 'optimism',
    'solana': 'solana',
    'avalanche': 'avalanche',
    'avax': 'avalanche',
    'bnbchain': 'bnbchain',
    'bsc': 'bnbchain',
    // Web3 DeFi
    'uniswap': 'uniswap',
    'aave': 'aave',
    'compound': 'compound',
    '1inch': '1inch',
    'coinbase': 'coinbase',
    'binance': 'binance',
  }

  // Normalize platform name
  const normalized = platformName.toLowerCase().trim()
  
  // Check if we have a mapping
  const slug = iconMap[normalized]
  if (slug) {
    // Use Simple Icons CDN - format: https://cdn.simpleicons.org/{slug}/{color}
    // We'll use a default color (can be customized per platform)
    return `https://cdn.simpleicons.org/${slug}/000000`
  }

  return null
}

// Helper function to detect social media platform from URL
export function detectPlatformFromUrl(url: string): { name: string; iconUrl: string | null } | null {
  if (!url) return null

  const urlLower = url.toLowerCase()
  
  // Map URL patterns to platform names
  const urlPatterns: Array<{ pattern: RegExp; name: string }> = [
    // Traditional Social
    { pattern: /(?:x\.com|twitter\.com)/, name: 'X (Twitter)' },
    { pattern: /tiktok\.com/, name: 'TikTok' },
    { pattern: /instagram\.com/, name: 'Instagram' },
    { pattern: /youtube\.com|youtu\.be/, name: 'YouTube' },
    { pattern: /facebook\.com/, name: 'Facebook' },
    { pattern: /linkedin\.com/, name: 'LinkedIn' },
    { pattern: /github\.com/, name: 'GitHub' },
    { pattern: /discord\.(?:com|gg)/, name: 'Discord' },
    { pattern: /snapchat\.com/, name: 'Snapchat' },
    { pattern: /pinterest\.com/, name: 'Pinterest' },
    { pattern: /reddit\.com/, name: 'Reddit' },
    { pattern: /t\.me|telegram\.org/, name: 'Telegram' },
    { pattern: /whatsapp\.com/, name: 'WhatsApp' },
    { pattern: /spotify\.com/, name: 'Spotify' },
    { pattern: /twitch\.tv/, name: 'Twitch' },
    { pattern: /vimeo\.com/, name: 'Vimeo' },
    { pattern: /behance\.net/, name: 'Behance' },
    { pattern: /dribbble\.com/, name: 'Dribbble' },
    { pattern: /medium\.com/, name: 'Medium' },
    { pattern: /tumblr\.com/, name: 'Tumblr' },
    { pattern: /soundcloud\.com/, name: 'SoundCloud' },
    { pattern: /bandcamp\.com/, name: 'Bandcamp' },
    // Web3 Social
    { pattern: /lens\.xyz/, name: 'Lens Protocol' },
    { pattern: /warpcast\.com|farcaster\.xyz/, name: 'Farcaster' },
    { pattern: /bsky\.app/, name: 'Bluesky' },
    { pattern: /friend\.tech/, name: 'Friend.tech' },
    { pattern: /mirror\.xyz/, name: 'Mirror' },
    { pattern: /ens\.domains/, name: 'ENS' },
    // Web3 Marketplaces
    { pattern: /opensea\.io/, name: 'OpenSea' },
    { pattern: /blur\.io/, name: 'Blur' },
    { pattern: /rarible\.com/, name: 'Rarible' },
    { pattern: /foundation\.app/, name: 'Foundation' },
    { pattern: /superrare\.com/, name: 'SuperRare' },
    { pattern: /zora\.co/, name: 'Zora' },
    { pattern: /manifold\.xyz/, name: 'Manifold' },
    { pattern: /sound\.xyz/, name: 'Sound.xyz' },
    { pattern: /audius\.co/, name: 'Audius' },
    { pattern: /showtime\.xyz/, name: 'Showtime' },
    // Web3 Tools
    { pattern: /etherscan\.io/, name: 'Etherscan' },
    { pattern: /debank\.com/, name: 'DeBank' },
    { pattern: /zerion\.io/, name: 'Zerion' },
    { pattern: /unstoppabledomains\.com/, name: 'Unstoppable Domains' },
    // Web3 Chains
    { pattern: /ethereum\.org/, name: 'Ethereum' },
    { pattern: /polygon\.technology/, name: 'Polygon' },
    { pattern: /base\.org/, name: 'Base' },
    { pattern: /arbitrum\.io/, name: 'Arbitrum' },
    { pattern: /optimism\.io/, name: 'Optimism' },
    { pattern: /solana\.com/, name: 'Solana' },
    { pattern: /avax\.network|avalanche\.network/, name: 'Avalanche' },
    { pattern: /bnbchain\.org/, name: 'BNB Chain' },
    // Web3 DeFi
    { pattern: /uniswap\.org/, name: 'Uniswap' },
    { pattern: /aave\.com/, name: 'Aave' },
    { pattern: /compound\.finance/, name: 'Compound' },
    { pattern: /1inch\.io/, name: '1inch' },
    { pattern: /coinbase\.com/, name: 'Coinbase' },
    { pattern: /binance\.com/, name: 'Binance' },
  ]

  for (const { pattern, name } of urlPatterns) {
    if (pattern.test(urlLower)) {
      const iconUrl = getSocialIconUrl(name.toLowerCase().replace(/[^a-z]/g, ''))
      return { name, iconUrl }
    }
  }

  return null
}

// Get all available platform suggestions
export function getPlatformSuggestions(query: string): Array<{ name: string; slug: string; url: string; iconUrl: string }> {
  const platforms = [
    // Traditional Social Media
    { name: 'X (Twitter)', slug: 'x', url: 'https://x.com/' },
    { name: 'TikTok', slug: 'tiktok', url: 'https://www.tiktok.com/@' },
    { name: 'Instagram', slug: 'instagram', url: 'https://www.instagram.com/' },
    { name: 'YouTube', slug: 'youtube', url: 'https://www.youtube.com/@' },
    { name: 'Facebook', slug: 'facebook', url: 'https://www.facebook.com/' },
    { name: 'LinkedIn', slug: 'linkedin', url: 'https://www.linkedin.com/in/' },
    { name: 'GitHub', slug: 'github', url: 'https://github.com/' },
    { name: 'Discord', slug: 'discord', url: 'https://discord.gg/' },
    { name: 'Snapchat', slug: 'snapchat', url: 'https://www.snapchat.com/add/' },
    { name: 'Pinterest', slug: 'pinterest', url: 'https://www.pinterest.com/' },
    { name: 'Reddit', slug: 'reddit', url: 'https://www.reddit.com/user/' },
    { name: 'Telegram', slug: 'telegram', url: 'https://t.me/' },
    { name: 'WhatsApp', slug: 'whatsapp', url: 'https://wa.me/' },
    { name: 'Spotify', slug: 'spotify', url: 'https://open.spotify.com/user/' },
    { name: 'Twitch', slug: 'twitch', url: 'https://www.twitch.tv/' },
    { name: 'Vimeo', slug: 'vimeo', url: 'https://vimeo.com/' },
    { name: 'Behance', slug: 'behance', url: 'https://www.behance.net/' },
    { name: 'Dribbble', slug: 'dribbble', url: 'https://dribbble.com/' },
    { name: 'Medium', slug: 'medium', url: 'https://medium.com/@' },
    { name: 'Tumblr', slug: 'tumblr', url: 'https://www.tumblr.com/blog/' },
    { name: 'SoundCloud', slug: 'soundcloud', url: 'https://soundcloud.com/' },
    { name: 'Bandcamp', slug: 'bandcamp', url: 'https://bandcamp.com/' },
    
    // Web3 Social Platforms
    { name: 'Lens Protocol', slug: 'lens', url: 'https://lens.xyz/u/' },
    { name: 'Farcaster', slug: 'farcaster', url: 'https://farcaster.xyz/' },
    { name: 'Bluesky', slug: 'bluesky', url: 'https://bsky.app/profile/' },
    { name: 'Friend.tech', slug: 'friendtech', url: 'https://friend.tech/' },
    { name: 'Mirror', slug: 'mirror', url: 'https://mirror.xyz/' },
    { name: 'ENS', slug: 'ens', url: 'https://app.ens.domains/' },
    
    // Web3 Marketplaces & NFT Platforms
    { name: 'OpenSea', slug: 'opensea', url: 'https://opensea.io/' },
    { name: 'Blur', slug: 'blur', url: 'https://blur.io/' },
    { name: 'Rarible', slug: 'rarible', url: 'https://rarible.com/' },
    { name: 'Foundation', slug: 'foundation', url: 'https://foundation.app/@' },
    { name: 'SuperRare', slug: 'superrare', url: 'https://superrare.com/' },
    { name: 'Zora', slug: 'zora', url: 'https://zora.co/' },
    { name: 'Manifold', slug: 'manifold', url: 'https://manifold.xyz/' },
    { name: 'Sound.xyz', slug: 'soundxyz', url: 'https://sound.xyz/' },
    { name: 'Audius', slug: 'audius', url: 'https://audius.co/' },
    { name: 'Showtime', slug: 'showtime', url: 'https://showtime.xyz/@' },
    
    // Web3 Tools & Explorers
    { name: 'Etherscan', slug: 'etherscan', url: 'https://etherscan.io/address/' },
    { name: 'DeBank', slug: 'debank', url: 'https://debank.com/profile/' },
    { name: 'Zerion', slug: 'zerion', url: 'https://app.zerion.io/' },
    { name: 'Unstoppable Domains', slug: 'unstoppabledomains', url: 'https://unstoppabledomains.com/' },
    
    // Web3 Chains & Protocols
    { name: 'Ethereum', slug: 'ethereum', url: 'https://ethereum.org/' },
    { name: 'Polygon', slug: 'polygon', url: 'https://polygon.technology/' },
    { name: 'Base', slug: 'base', url: 'https://base.org/' },
    { name: 'Arbitrum', slug: 'arbitrum', url: 'https://arbitrum.io/' },
    { name: 'Optimism', slug: 'optimism', url: 'https://www.optimism.io/' },
    { name: 'Solana', slug: 'solana', url: 'https://solana.com/' },
    { name: 'Avalanche', slug: 'avalanche', url: 'https://www.avax.network/' },
    { name: 'BNB Chain', slug: 'bnbchain', url: 'https://www.bnbchain.org/' },
    
    // Web3 DeFi & Exchanges
    { name: 'Uniswap', slug: 'uniswap', url: 'https://uniswap.org/' },
    { name: 'Aave', slug: 'aave', url: 'https://aave.com/' },
    { name: 'Compound', slug: 'compound', url: 'https://compound.finance/' },
    { name: '1inch', slug: '1inch', url: 'https://1inch.io/' },
    { name: 'Coinbase', slug: 'coinbase', url: 'https://www.coinbase.com/' },
    { name: 'Binance', slug: 'binance', url: 'https://www.binance.com/' },
  ]

  if (!query || query.trim() === '') {
    return platforms.map(p => ({
      ...p,
      iconUrl: `https://cdn.simpleicons.org/${p.slug}/000000`
    }))
  }

  const queryLower = query.toLowerCase()
  return platforms
    .filter(p => 
      p.name.toLowerCase().includes(queryLower) || 
      p.slug.toLowerCase().includes(queryLower)
    )
    .map(p => ({
      ...p,
      iconUrl: `https://cdn.simpleicons.org/${p.slug}/000000`
    }))
    .slice(0, 5) // Limit to 5 suggestions
}

