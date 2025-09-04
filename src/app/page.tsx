"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Background from "./background";

export default function Home() {
  const [url, setUrl] = useState("");
  const [favicon, setFavicon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [metascraperLoading, setMetascraperLoading] = useState(false);

  const getFavicon = async () => {
    if (!url) return;

    setLoading(true);
    setError("");
    setFavicon("");

    try {
      // 清理 URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = "https://" + cleanUrl;
      }

      // 验证 URL 格式
      const urlObj = new URL(cleanUrl);

      // 直接使用 Google 的 favicon 服务，这是最可靠的方式
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
      setFavicon(faviconUrl);

    } catch {
      setError("请输入有效的网址");
    } finally {
      setLoading(false);
    }
  };

  const getMetascraperData = async () => {
    if (!url) return;

    setMetascraperLoading(true);
    setError("");
    setMetadata(null);

    try {
      // 清理 URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = "https://" + cleanUrl;
      }

      // 验证 URL 格式
      new URL(cleanUrl);

      // 调用 metascraper API
      const response = await fetch(`/api/favicon?url=${encodeURIComponent(cleanUrl)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMetadata(data);

    } catch (err) {
      setError("获取网站元数据失败，请检查网址是否正确");
      console.error('Metascraper error:', err);
    } finally {
      setMetascraperLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getFavicon();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-orange-400 relative overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
      </div>

      {/* 导航栏 */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-800">🔍</span>
          </div>
          <span className="text-white font-semibold text-xl">Favgrab</span>
        </div>

        {/* <div className="hidden md:flex items-center space-x-8 text-white">
          <a href="#" className="hover:text-white/80 transition-colors">工具</a>
          <a href="#" className="hover:text-white/80 transition-colors">API</a>
          <a href="#" className="hover:text-white/80 transition-colors">帮助</a>
        </div> */}
      </nav>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            找到任何网站的 <span className="text-yellow-300">图标</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            输入任何网址，立即获取高质量的网站图标
          </p>
        </div>

        {/* 输入区域 */}
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="输入网址，例如：github.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-lg"
                />
                <Button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? "查找中..." : "获取图标"}
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={getMetascraperData}
                  disabled={metascraperLoading || !url.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  {metascraperLoading ? "获取中..." : "获取完整元数据"}
                </Button>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 结果显示区域 */}
        {favicon && (
          <Card className="w-full max-w-2xl mt-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">网站图标</h3>
                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-lg">
                    <img
                      src={favicon}
                      alt="Website favicon"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://www.google.com/s2/favicons?domain=${new URL(url.startsWith('http') ? url : 'https://' + url).hostname}&sz=32`;
                      }}
                    />
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(favicon);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'favicon.ico';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('下载失败:', error);
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  下载图标
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 元数据显示区域 */}
        {metadata && (
          <Card className="w-full max-w-4xl mt-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 text-center">网站元数据</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">字段</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metadata.title && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">标题</td>
                          <td className="py-3 px-4 text-gray-800">{metadata.title}</td>
                        </tr>
                      )}
                      {metadata.description && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">描述</td>
                          <td className="py-3 px-4 text-gray-800">{metadata.description}</td>
                        </tr>
                      )}
                      {metadata.author && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">作者</td>
                          <td className="py-3 px-4 text-gray-800">{metadata.author}</td>
                        </tr>
                      )}
                      {metadata.publisher && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">发布者</td>
                          <td className="py-3 px-4 text-gray-800">{metadata.publisher}</td>
                        </tr>
                      )}
                      {metadata.date && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">日期</td>
                          <td className="py-3 px-4 text-gray-800">{new Date(metadata.date).toLocaleDateString('zh-CN')}</td>
                        </tr>
                      )}
                      {metadata.url && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">URL</td>
                          <td className="py-3 px-4 text-gray-800">
                            <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {metadata.url}
                            </a>
                          </td>
                        </tr>
                      )}
                      {metadata.image && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">主图</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img src={metadata.image} alt="网站主图" className="w-16 h-16 object-cover rounded" />
                              <a href={metadata.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm">
                                查看原图
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                      {metadata.logo && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">Logo</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img src={metadata.logo} alt="网站Logo" className="w-8 h-8 object-contain" />
                              <a href={metadata.logo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm">
                                查看原图
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                      {metadata.favicon && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-600">Favicon</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img src={metadata.favicon} alt="网站Favicon" className="w-6 h-6 object-contain" />
                              <a href={metadata.favicon} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm">
                                查看原图
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/10 to-transparent"></div>
    </div>
  );
}
