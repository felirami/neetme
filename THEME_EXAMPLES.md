/**
 * Pump.fun Inspired Theme - Usage Examples
 * 
 * This file demonstrates how to use the neon theme utilities
 * in your components.
 */

// Example Component showing all theme utilities
export function ThemeExamples() {
  return (
    <div className="min-h-screen bg-dark-gradient p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Typography Examples */}
        <section className="card-neon">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Typography Examples
          </h1>
          <p className="text-primary text-lg mb-2">
            Primary text - White (#FFFFFF)
          </p>
          <p className="text-secondary text-base mb-2">
            Secondary text - Gray (#9CA3AF)
          </p>
          <p className="text-tertiary text-sm mb-4">
            Tertiary text - Darker Gray (#6B7280)
          </p>
          <h2 className="text-2xl font-semibold text-neon text-glow mb-2">
            Neon Primary Text with Glow
          </h2>
          <p className="text-neon-secondary text-lg">
            Neon Secondary Text - Mint/Turquoise
          </p>
        </section>

        {/* Button Examples */}
        <section className="card-neon">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Button Styles
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-neon">
              Solid Neon Button
            </button>
            <button className="btn-neon-outline">
              Outline Neon Button
            </button>
            <button className="btn-neon-secondary">
              Secondary Neon Button
            </button>
          </div>
        </section>

        {/* Card Examples */}
        <section className="space-y-4">
          <div className="card-neon">
            <h3 className="text-xl font-semibold text-primary mb-2">
              Standard Card
            </h3>
            <p className="text-secondary">
              This card has a subtle border and hover effects.
            </p>
          </div>
          
          <div className="card-neon-glow">
            <h3 className="text-xl font-semibold text-primary mb-2">
              Glowing Card
            </h3>
            <p className="text-secondary">
              This card has a soft neon glow effect.
            </p>
          </div>
        </section>

        {/* Input Examples */}
        <section className="card-neon">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Input Styles
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Neon input with focus glow"
              className="input-neon w-full"
            />
            <textarea
              placeholder="Textarea with neon theme"
              className="input-neon w-full"
              rows={4}
            />
          </div>
        </section>

        {/* Link Examples */}
        <section className="card-neon">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Link Styles
          </h2>
          <a href="#" className="link-neon text-lg">
            Neon Link with Hover Glow
          </a>
        </section>

        {/* Custom Glow Examples */}
        <section className="card-neon">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Custom Glow Effects
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-dark-bg rounded-lg glow-neon">
              Small Glow Effect
            </div>
            <div className="p-4 bg-dark-bg rounded-lg glow-neon-md">
              Medium Glow Effect
            </div>
            <div className="p-4 bg-dark-bg rounded-lg glow-neon-lg">
              Large Glow Effect
            </div>
            <div className="p-4 bg-dark-bg rounded-lg glow-neon-secondary">
              Secondary Color Glow
            </div>
          </div>
        </section>

        {/* Animation Example */}
        <section className="card-neon">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Animations
          </h2>
          <div className="p-4 bg-neon-primary text-dark-bg rounded-lg animate-glow-pulse">
            Pulsing Glow Animation
          </div>
        </section>

      </div>
    </div>
  );
}

/**
 * Quick Reference:
 * 
 * Colors:
 * - bg-neon-primary, text-neon-primary (#6AFF7F)
 * - bg-neon-primary-alt, text-neon-primary-alt (#7CFF6B)
 * - bg-neon-secondary, text-neon-secondary (#A3FFD6)
 * - bg-dark-bg (#0b0c10)
 * - bg-dark-bg-alt (#0f1015)
 * - text-gray-primary (#FFFFFF)
 * - text-gray-secondary (#9CA3AF)
 * - text-gray-tertiary (#6B7280)
 * 
 * Backgrounds:
 * - bg-dark-gradient
 * - bg-dark-gradient-radial
 * 
 * Shadows:
 * - shadow-neon-sm
 * - shadow-neon-md
 * - shadow-neon-lg
 * - shadow-neon-secondary
 * 
 * Components:
 * - btn-neon (solid neon button)
 * - btn-neon-outline (outline neon button)
 * - btn-neon-secondary (secondary neon button)
 * - card-neon (standard card)
 * - card-neon-glow (glowing card)
 * - input-neon (neon-themed input)
 * - link-neon (neon link)
 * 
 * Utilities:
 * - glow-neon, glow-neon-md, glow-neon-lg, glow-neon-secondary
 * - text-glow, text-glow-secondary
 * - text-primary, text-secondary, text-tertiary
 * - text-neon, text-neon-secondary
 */

