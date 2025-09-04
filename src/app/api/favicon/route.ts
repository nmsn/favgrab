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
    const metascraperAuthor = (await import('metascraper-author')).default;
    const metascraperDate = (await import('metascraper-date')).default;
    const metascraperDescription = (await import('metascraper-description')).default;
    const metascraperImage = (await import('metascraper-image')).default;
    const metascraperLogo = (await import('metascraper-logo')).default;
    const metascraperPublisher = (await import('metascraper-publisher')).default;
    const metascraperTitle = (await import('metascraper-title')).default;
    const metascraperUrl = (await import('metascraper-url')).default;
    const metascraperLogoFavicon = (await import('metascraper-logo-favicon')).default;

    const scraper = metascraper([
      metascraperAuthor(),
      metascraperDate(),
      metascraperDescription(),
      metascraperImage(),
      metascraperLogo(),
      metascraperPublisher(),
      metascraperTitle(),
      metascraperUrl(),
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

      // 打印 metascraper 获取到的信息
      console.log('Metascraper 提取的元数据:', {
        url: url,
        metadata: metadata
      });

      return NextResponse.json({
        author: metadata.author,
        date: metadata.date,
        description: metadata.description,
        image: metadata.image,
        logo: metadata.logo,
        publisher: metadata.publisher,
        title: metadata.title,
        url: metadata.url,
        favicon: metadata.favicon
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