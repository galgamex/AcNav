import * as cheerio from 'cheerio';

export interface WebsiteInfo {
  title?: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

// 获取网站信息
export async function fetchWebsiteInfo(url: string): Promise<WebsiteInfo> {
  const info: WebsiteInfo = {};

  try {
    // 确保URL格式正确
    const normalizedUrl = normalizeUrl(url);
    
    // 设置请求头，模拟浏览器访问
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 提取标题
    info.title = $('title').text().trim() || 
                 $('meta[property="og:title"]').attr('content')?.trim() || 
                 $('meta[name="twitter:title"]').attr('content')?.trim();

    // 提取描述
    info.description = $('meta[name="description"]').attr('content')?.trim() || 
                      $('meta[property="og:description"]').attr('content')?.trim() || 
                      $('meta[name="twitter:description"]').attr('content')?.trim();

    // 提取关键词
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      info.keywords = keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    }

    // 提取图标
    info.icon = extractIcon($, normalizedUrl);
    info.iconUrl = info.icon; // 设置iconUrl为icon的值

    // 提取Open Graph信息
    info.ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
    info.ogDescription = $('meta[property="og:description"]').attr('content')?.trim();
    info.ogImage = $('meta[property="og:image"]').attr('content')?.trim();

    // 如果没有获取到图标，尝试使用OG图片
    if (!info.icon && info.ogImage) {
      info.icon = info.ogImage;
      info.iconUrl = info.ogImage;
    }

  } catch (error) {
    console.error(`抓取网站信息失败 (${url}):`, error);
    
    // 返回基本信息
    info.title = extractDomainName(url);
    info.description = `来自 ${extractDomainName(url)} 的网站`;
  }

  return info;
}

// 标准化URL
function normalizeUrl(url: string): string {
  try {
    // 如果没有协议，默认添加https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch (error) {
    throw new Error(`无效的URL: ${url}`);
  }
}

// 提取网站图标
function extractIcon($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="mask-icon"]'
  ];

  for (const selector of selectors) {
    const href = $(selector).attr('href');
    if (href) {
      return resolveUrl(href, baseUrl);
    }
  }

  // 如果没有找到图标，尝试默认的favicon.ico
  try {
    const urlObj = new URL(baseUrl);
    return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
  } catch (error) {
    return undefined;
  }
}

// 解析相对URL为绝对URL
function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString();
  } catch (error) {
    return url;
  }
}

// 从URL提取域名
function extractDomainName(url: string): string {
  try {
    const urlObj = new URL(normalizeUrl(url));
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
}

// 验证URL是否可访问
export async function validateUrl(url: string): Promise<boolean> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const response = await fetch(normalizedUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error(`URL验证失败 (${url}):`, error);
    return false;
  }
}

// 提取网站截图（需要额外的服务支持）
export async function captureWebsiteScreenshot(url: string): Promise<string | null> {
  // 这里可以集成截图服务，如Puppeteer、Playwright等
  // 目前返回null，表示不支持截图功能
  console.log(`截图功能暂未实现: ${url}`);
  return null;
}