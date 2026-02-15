import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AIVI AI Studio — Premium AI Content Creation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 40%, #1b2838 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Glow effects */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '600px',
                        height: '300px',
                        background: 'radial-gradient(ellipse, rgba(34,211,238,0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '30%',
                        right: '20%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                    }}
                />

                {/* Title */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                    }}
                >
                    {/* Logo */}
                    <img
                        src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`}
                        width="160"
                        height="160"
                        alt="AIVI Logo"
                        style={{
                            borderRadius: '32px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            border: '4px solid rgba(255,255,255,0.1)',
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '110px',
                                fontWeight: 900,
                                letterSpacing: '-6px',
                                background: 'linear-gradient(to bottom, #ffffff 0%, #22d3ee 100%)',
                                backgroundClip: 'text',
                                color: 'transparent',
                                lineHeight: 1,
                            }}
                        >
                            AIVI
                        </div>
                        <div
                            style={{
                                fontSize: '36px',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.9)',
                                letterSpacing: '10px',
                                textTransform: 'uppercase' as const,
                            }}
                        >
                            AI Studio
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: '20px',
                            color: '#22d3ee',
                            fontWeight: 600,
                            letterSpacing: '4px',
                            textTransform: 'uppercase' as const,
                            padding: '8px 24px',
                            background: 'rgba(34,211,238,0.1)',
                            borderRadius: '100px',
                            border: '1px solid rgba(34,211,238,0.2)',
                            marginTop: '16px',
                        }}
                    >
                        Premium AI Content Creation
                    </div>
                </div>

                {/* Bottom accent line */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        width: '200px',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent 0%, #22d3ee 50%, transparent 100%)',
                    }}
                />
            </div>
        ),
        { ...size }
    )
}
