// Brand colors for social media platforms
export interface BrandColors {
  backgroundColor: string; // Hex color or gradient class
  textColor: string; // Hex color
  iconColor: string; // Hex color for Simple Icons
  isGradient?: boolean; // If true, backgroundColor is a gradient class
}

// Get default brand colors for a platform
export function getBrandColors(platformName: string): BrandColors {
  const normalized = platformName.toLowerCase().trim()
  
  const brandMap: Record<string, BrandColors> = {
    // Traditional Social
    'x': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'twitter': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'tiktok': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'instagram': { 
      backgroundColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      textColor: '#FFFFFF',
      iconColor: 'FFFFFF',
      isGradient: true
    },
    'youtube': { backgroundColor: '#FF0000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'facebook': { backgroundColor: '#1877F2', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'linkedin': { backgroundColor: '#0A66C2', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'github': { backgroundColor: '#181717', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'discord': { backgroundColor: '#5865F2', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'snapchat': { backgroundColor: '#FFFC00', textColor: '#000000', iconColor: '000000' },
    'pinterest': { backgroundColor: '#BD081C', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'reddit': { backgroundColor: '#FF4500', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'telegram': { backgroundColor: '#0088CC', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'whatsapp': { backgroundColor: '#25D366', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'spotify': { backgroundColor: '#1DB954', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'twitch': { backgroundColor: '#9146FF', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'vimeo': { backgroundColor: '#1AB7EA', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'behance': { backgroundColor: '#1769FF', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'dribbble': { backgroundColor: '#EA4C89', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'medium': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'tumblr': { backgroundColor: '#001935', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'soundcloud': { backgroundColor: '#FF3300', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'bandcamp': { backgroundColor: '#629AA0', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    
    // Web3 Social
    'lens': { backgroundColor: '#00501E', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'lensprotocol': { backgroundColor: '#00501E', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'farcaster': { backgroundColor: '#8A63D2', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'bluesky': { backgroundColor: '#00A8E8', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'bsky': { backgroundColor: '#00A8E8', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'friendtech': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'friend.tech': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'mirror': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'ens': { backgroundColor: '#5298FF', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    
    // Web3 Marketplaces
    'opensea': { backgroundColor: '#2081E2', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'blur': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'rarible': { backgroundColor: '#FEDA03', textColor: '#000000', iconColor: '000000' },
    'foundation': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'superrare': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'zora': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'manifold': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'soundxyz': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'sound.xyz': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'audius': { backgroundColor: '#313131', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'showtime': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    
    // Web3 Tools
    'etherscan': { backgroundColor: '#21325B', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'debank': { backgroundColor: '#1C1C1E', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'zerion': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'unstoppabledomains': { backgroundColor: '#2E65F5', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    
    // Web3 Chains
    'ethereum': { backgroundColor: '#627EEA', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'polygon': { backgroundColor: '#8247E5', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'base': { backgroundColor: '#0052FF', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'arbitrum': { backgroundColor: '#28A0F0', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'optimism': { backgroundColor: '#FF0420', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'solana': { backgroundColor: '#9945FF', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'avalanche': { backgroundColor: '#E84142', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'avax': { backgroundColor: '#E84142', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'bnbchain': { backgroundColor: '#F3BA2F', textColor: '#000000', iconColor: '000000' },
    'bsc': { backgroundColor: '#F3BA2F', textColor: '#000000', iconColor: '000000' },
    
    // Web3 DeFi
    'uniswap': { backgroundColor: '#FF007A', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'aave': { backgroundColor: '#B6509E', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'compound': { backgroundColor: '#00D395', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    '1inch': { backgroundColor: '#000000', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'coinbase': { backgroundColor: '#0052FF', textColor: '#FFFFFF', iconColor: 'FFFFFF' },
    'binance': { backgroundColor: '#F3BA2F', textColor: '#000000', iconColor: '000000' },
  }
  
  // Try exact match first
  if (brandMap[normalized]) {
    return brandMap[normalized]
  }
  
  // Try partial match (e.g., "x (twitter)" -> "x")
  for (const [key, value] of Object.entries(brandMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }
  
  // Default fallback
  return {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    iconColor: '000000'
  }
}

// Convert hex color to RGB for opacity support
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Check if color is dark (for determining text color)
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance < 0.5
}

