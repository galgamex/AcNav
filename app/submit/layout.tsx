import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '提交网站 - ACGN导航',
  description: '向ACGN导航提交您的优质网站，与更多用户分享有价值的网络资源。',
  keywords: '提交网站,网站收录,ACGN导航,网站推荐,资源分享',
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}