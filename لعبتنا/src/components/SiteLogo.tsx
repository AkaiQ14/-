export const LOGO_SRC = '/images/logo.png'
export const LOGO_ALT = 'لعبتنا'

export type SiteLogoVariant = 'header' | 'hero' | 'hero-feature' | 'play' | 'footer'

interface SiteLogoProps {
  variant?: SiteLogoVariant
  className?: string
}

export default function SiteLogo({ variant = 'header', className = '' }: SiteLogoProps) {
  return (
    <span className={`site-logo-wrap site-logo-wrap--${variant} ${className}`.trim()}>
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        className="site-logo"
        draggable={false}
        decoding="async"
      />
    </span>
  )
}
