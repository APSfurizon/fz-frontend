import type { MetadataRoute } from 'next'
import { APP_HOSTNAME } from './_lib/constants'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/debug', '/*/debug',
                '/admin', '/*/admin',
                '/recover', "/*/recover",
                "/user/order/link", "/*/user/order/link"
            ],
        },
        sitemap: `https://${APP_HOSTNAME}/sitemap.xml`,
    }
}