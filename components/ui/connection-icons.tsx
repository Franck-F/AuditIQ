import React from 'react'
import Image from 'next/image'

interface ConnectionIconProps {
  type: string
  className?: string
}

export function ConnectionIcon({ type, className = "h-6 w-6" }: ConnectionIconProps) {
  const iconMap: Record<string, string> = {
    google_sheets: '/images/google-sheet.png',
    salesforce: '/images/salesforce--600.png',
    workday: '/images/workday_logo_herobutton.png',
    bamboohr: '/images/BambooHR-logo-green.png',
    hubspot: '/images/logo_hubspot.png',
    pipedrive: '/images/Pipedrive_Logo_Green.png',
    rest_api: '/images/API REST.png'
  }

  const imageSrc = iconMap[type] || iconMap.rest_api

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src={imageSrc}
        alt={type}
        width={48}
        height={48}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
