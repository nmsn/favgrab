import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // 动态导入 metascraper 相关模块
    const metascraper = (await import('metascraper')).default;
    const metascraperLogo = (await import('metascraper-logo')).default;
    const metascraperLogoFavicon = (await import('metascraper-logo-favicon')).default;

    const scraper = metascraper([
      metascraperLogo(),
      metascraperLogoFavicon()
    ]);

    // 创建 AbortController 来实现超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const metadata = await scraper({ html, url });

      return NextResponse.json({
        logo: metadata.logo,
        favicon: metadata.favicon,
        url: url
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);

      // 如果是超时错误，返回基本的 favicon URL
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const urlObj = new URL(url);
        const fallbackFavicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;

        return NextResponse.json({
          logo: null,
          favicon: fallbackFavicon,
          url: url,
          fallback: true
        });
      }

      throw fetchError;
    }

  } catch (error) {
    console.error('Error fetching favicon:', error);

    // 提供回退方案
    try {
      const urlObj = new URL(url);
      const fallbackFavicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;

      return NextResponse.json({
        logo: null,
        favicon: fallbackFavicon,
        url: url,
        fallback: true,
        error: 'Used fallback favicon'
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to fetch favicon and generate fallback' },
        { status: 500 }
      );
    }
  }
}