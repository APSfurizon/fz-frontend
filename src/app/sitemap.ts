import type { MetadataRoute } from 'next'
import { APP_HOSTNAME } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `https://${APP_HOSTNAME}/nosecount`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `https://${APP_HOSTNAME}/login`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `https://${APP_HOSTNAME}/register`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `https://${APP_HOSTNAME}/home`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `https://${APP_HOSTNAME}/booking`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `https://${APP_HOSTNAME}/badge`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `https://${APP_HOSTNAME}/room`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `https://${APP_HOSTNAME}/upload-area`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `https://${APP_HOSTNAME}/user`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1,
        },
    ]
}