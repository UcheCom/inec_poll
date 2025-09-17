'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Download, Share2, Copy, Check } from 'lucide-react'

interface QRCodeProps {
    /** The URL to encode in the QR code */
    url: string
    /** Size of the QR code in pixels */
    size?: number
    /** Poll title for context */
    pollTitle?: string
}

/**
 * QRCode Component
 * 
 * Displays a QR code for poll sharing with download and copy functionality.
 * Features:
 * - High-quality SVG QR code generation
 * - Download as PNG functionality
 * - Copy URL to clipboard
 * - Share dialog integration
 * - Responsive design
 * 
 * @param url - The URL to encode in the QR code
 * @param size - Size of the QR code (default: 200)
 * @param pollTitle - Poll title for context
 */
export function QRCode({
    url,
    size = 200,
    pollTitle
}: QRCodeProps) {
    const [copied, setCopied] = useState(false)
    const [isShareSupported, setIsShareSupported] = useState(false)

    /**
     * Check if Web Share API is supported on the client side
     */
    useEffect(() => {
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator) {
            setIsShareSupported(true)
        }
    }, [])

    /**
     * Copies the poll URL to clipboard
     */
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy URL:', err)
        }
    }

    /**
     * Downloads the QR code as a PNG image
     */
    const downloadQRCode = () => {
        const svg = document.getElementById('qr-code-svg')
        if (!svg) return

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = size
        canvas.height = size

        const img = new Image()
        img.onload = () => {
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, size, size)
            ctx.drawImage(img, 0, 0, size, size)

            const link = document.createElement('a')
            link.download = `poll-qr-${pollTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'code'}.png`
            link.href = canvas.toDataURL()
            link.click()
        }

        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        img.src = url
    }

    /**
     * Opens native share dialog if available
     */
    const sharePoll = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: pollTitle || 'Poll',
                    text: `Check out this poll: ${pollTitle}`,
                    url: url
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            // Fallback to copy to clipboard
            copyToClipboard()
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share Poll
                </CardTitle>
                <CardDescription>
                    Scan the QR code or copy the link to share this poll
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <QRCodeSVG
                        id="qr-code-svg"
                        value={url}
                        size={size}
                        level="M"
                        includeMargin={true}
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>

                {/* URL Display */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Poll URL:</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={url}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="flex items-center gap-1"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={downloadQRCode}
                        variant="outline"
                        className="flex-1 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download QR Code
                    </Button>

                    {isShareSupported && (
                        <Button
                            onClick={sharePoll}
                            className="flex-1 flex items-center gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    )}
                </div>

                {/* Instructions */}
                <div className="text-xs text-gray-500 text-center">
                    <p>• Scan with your phone camera to open the poll</p>
                    <p>• Share the QR code image or URL with others</p>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * QRCodeButton Component
 * 
 * A compact button that opens a QR code modal/dialog
 */
export function QRCodeButton({ url, pollTitle }: { url: string; pollTitle?: string }) {
    const [showQR, setShowQR] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2"
            >
                <Share2 className="h-4 w-4" />
                Share QR
            </Button>

            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Share Poll</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowQR(false)}
                                >
                                    ×
                                </Button>
                            </div>
                            <QRCode url={url} {...(pollTitle && { pollTitle })} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
