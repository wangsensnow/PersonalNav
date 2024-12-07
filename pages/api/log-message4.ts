import rateLimit from 'express-rate-limit';
import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

type ResponseData = {
  message: string;
  error?: string;
}

// 创建单个 Sharp 实例复用
const sharpInstance = sharp();

// 降低限流阈值，增加内存保护
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 限制每个IP 15分钟内最多50个请求
  message: '请求过于频繁，请稍后再试'
});

// 设置最大图片大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // 限制请求体大小为10mb
    }
  }
}

// 图片压缩处理函数
async function compressImage(base64String: string, quality: number): Promise<string> {
  try {
    // 将 Base64 字符串解码为 Buffer 对象
    const inputBuffer = Buffer.from(base64String, 'base64');

    if (inputBuffer.length > 10 * 1024 * 1024) { // 10MB
      throw new Error('图片大小超过限制');
    }

    console.log("压缩前大小:", Math.round(inputBuffer.length / 1024), "KB");

    // 使用复用的 sharp 实例处理图片
    const outputBuffer = await sharp(inputBuffer)
      .jpeg({
        quality: quality,
        mozjpeg: true,
        quantisationTable: 3
      })
      .resize(900, 900, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .grayscale()
      .toBuffer();

    console.log("压缩后大小:", Math.round(outputBuffer.length / 1024), "KB");

    // 转换为 Base64 并清理 Buffer
    const compressedBase64 = outputBuffer.toString('base64');

    // 清理 Buffer
    inputBuffer.fill(0);
    outputBuffer.fill(0);

    return compressedBase64;
  } catch (error) {
    console.error('图片压缩失败:', error);
    throw error;
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ResponseData>
) {
  try {
    // 应用限流
    await new Promise((resolve, reject) => {
      limiter(request, response, (error: any) => {
        if (error) reject(error);
        resolve(true);
      });
    });

    const VolcEngineSDK = require("volcengine-sdk");
    const axios = require("axios");

    const { ApiInfo, ServiceInfo, Credentials, API, Request } = VolcEngineSDK;

    // 从环境变量获取安全凭证
    const AK = process.env.VOLC_ENGINE_AK;
    const SK = process.env.VOLC_ENGINE_SK;

    if (!AK || !SK) {
      throw new Error('缺少必要的环境变量配置');
    }

    const { message } = request.body;
    if (!message) {
      throw new Error('缺少必要的请求参数');
    }

    // 压缩上传的图片
    const compressedReqBase64 = await compressImage(message, 50);

    // 设置API请求参数
    const credentials = new Credentials(AK, SK, 'translate', 'cn-north-1');
    const header = new Request.Header({
      'Content-Type': 'application/json'
    });
    const query = new Request.Query({
      'Action': 'TranslateImage',
      'Version': '2020-07-01'
    });
    const body = new Request.Body({
      'TargetLanguage': 'zh',
      'Image': compressedReqBase64
    });

    const serviceInfo = new ServiceInfo(
      'open.volcengineapi.com',
      header,
      credentials
    );
    const apiInfo = new ApiInfo('POST', '/', query, body);
    const api = API(serviceInfo, apiInfo);

    // 设置请求超时
    const axiosResponse = await axios.post(api.url, api.params, {
      ...api.config,
      timeout: 30000 // 30秒超时
    });

    if (!axiosResponse.data || !axiosResponse.data.Image) {
      throw new Error('API返回数据格式错误');
    }

    // 压缩返回的图片
    const compressedResBase64 = await compressImage(axiosResponse.data.Image, 50);
    const resImage = "data:image/jpeg;base64," + compressedResBase64;

    // 记录内存使用情况
    const memoryUsage = process.memoryUsage();
    console.log('Memory usage:', {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
    });

    response.status(200).json({ message: resImage });
  } catch (error) {
    console.error('请求处理失败:', error);
    response.status(500).json({
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    });
  } finally {
    // 建议在处理完大量数据后手动触发垃圾回收
    if (global.gc) {
      global.gc();
    }
  }
}
