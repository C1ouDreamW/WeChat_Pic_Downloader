(async function () {
  // 1. 获取公众号文章的正文容器，避免下载到头像或广告
  const content = document.getElementById('js_content') || document.body;

  // 2. 查找所有图片元素
  // 微信推文图片通常放在 data-src 中，也有部分在 src 中
  const images = Array.from(content.querySelectorAll('img'));

  console.log(`共找到 ${images.length} 张图片，开始下载...`);

  // 辅助函数：延时，防止浏览器卡死
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    // 优先获取 data-src (高清原图)，其次是 src
    let url = img.getAttribute('data-src') || img.src;

    if (!url || !url.startsWith('http')) continue;

    try {
      // 3. 智能判断文件扩展名
      let ext = 'jpg'; // 默认
      if (url.includes('wx_fmt=png') || url.includes('mmbiz_png')) {
        ext = 'png';
      } else if (url.includes('wx_fmt=gif') || url.includes('mmbiz_gif')) {
        ext = 'gif';
      } else if (url.includes('wx_fmt=jpeg')) {
        ext = 'jpg';
      }

      // 4. 使用 fetch 获取图片数据并转换为 Blob，从而强制触发下载
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      // 命名格式：img_序号.后缀
      a.download = `img_${i + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 释放内存
      URL.revokeObjectURL(objectUrl);

      console.log(`进度: ${i + 1}/${images.length} 下载完成`);

      // 每次下载间隔 300 毫秒，防止请求过快被浏览器拦截
      await sleep(300);

    } catch (err) {
      console.error(`图片 ${i + 1} 下载失败:`, err);
    }
  }
  console.log("全部下载任务结束！");
})();