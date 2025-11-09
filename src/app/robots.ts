import type { MetadataRoute } from 'next'
import { APP_HOSTNAME } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/debug',
                '/admin',
                '/recover',
                "/user/order/link",
            ],
        },
        sitemap: `https://${APP_HOSTNAME}/sitemap.xml`,
    }
}