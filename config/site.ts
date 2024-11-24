import { SiteConfig } from "@/types/siteConfig";

const OPEN_SOURCE_URL = 'https://xxx'

const baseSiteConfig = {
  name: "Mlink",
  description:
    "Website offering features such as website snapshot saving, automatic URL categorization, website summary generation, fast website search, and cloud storage.",
  url: "https://xxx",
  ogImage: "https://xxx",
  metadataBase: '/',
  keywords: ["automatic URL categorization", "website summary generation", " fast website search", "website snapshot saving"],
  authors: [
    {
      name: "Mlink",
      url: "https://twitter.com/xiaobaiyuntian",
      twitter: 'https://twitter.com/xiaobaiyuntian',
    }
  ],
  creator: '@Mlink',
  openSourceURL: 'https://xxx',
  themeColors: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  nextThemeColor: 'dark', // next-theme option: system | dark | light
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/logo.png",
  },
  headerLinks: [
    // { name: 'repo', href: OPEN_SOURCE_URL, icon: BsGithub },
    // { name: 'twitter', href: "https://twitter.com/weijunext", icon: BsTwitterX },
    // { name: 'buyMeCoffee', href: "https://www.buymeacoffee.com/weijunext", icon: SiBuymeacoffee }
  ],
  footerLinks: [
    // { name: 'email', href: "mailto:weijunext@gmail.com", icon: MdEmail },
    // { name: 'twitter', href: "https://twitter.com/weijunext", icon: BsTwitterX },
    // { name: 'github', href: "https://github.com/weijunext/", icon: BsGithub },
    // { name: 'buyMeCoffee', href: "https://www.buymeacoffee.com/weijunext", icon: SiBuymeacoffee },
    // { name: 'juejin', href: "https://juejin.cn/user/26044008768029", icon: SiJuejin },
    // { name: 'weChat', href: "https://weijunext.com/make-a-friend", icon: BsWechat }
  ],
  footerProducts: [
    // { url: 'https://phcopilot.ai/', name: 'Product Hunt Copilot' },
    { url: '/privacy', name: 'Privacy Policy' },
    { url: '/terms-of-service', name: 'Terms and Conditions' },
    // { url: 'https://smartexcel.cc/', name: 'Smart Excel' },
    // { url: 'https://landingpage.weijunext.com/', name: 'Landing Page Boilerplate' },
    // { url: 'https://weijunext.com/', name: 'J实验室' },
    // { url: 'https://nextjscn.org/', name: 'Next.js 中文文档' },
    // { url: 'https://nextjs.weijunext.com/', name: 'Next.js Practice' },
    // { url: 'https://github.com/weijunext/indie-hacker-tools', name: 'Indie Hacker Tools' },
  ]
}

export const siteConfig: SiteConfig = {
  ...baseSiteConfig,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseSiteConfig.url,
    title: baseSiteConfig.name,
    images: [`${baseSiteConfig.url}/og.png`],
    description: baseSiteConfig.description,
    siteName: baseSiteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    site: baseSiteConfig.url,
    title: baseSiteConfig.name,
    description: baseSiteConfig.description,
    images: [`${baseSiteConfig.url}/og.png`],
    creator: baseSiteConfig.creator,
  },
}
