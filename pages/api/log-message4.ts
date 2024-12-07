import rateLimit from 'express-rate-limit';
import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

type ResponseData = {
  message: string;
  error?: string;
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ResponseData>
) {
  // 应用限流
  await new Promise((resolve) => limiter(request, response, resolve));

  // import VolcEngineSDK from "volcengine-sdk";
  const VolcEngineSDK = require("volcengine-sdk");
  const axios = require("axios");

  const { ApiInfo, ServiceInfo, Credentials, API, Request } = VolcEngineSDK;

  // 从环境变量获取安全凭证
  const AK = process.env.VOLC_ENGINE_AK;
  const SK = process.env.VOLC_ENGINE_SK;

  if (!AK || !SK) {
    throw new Error('Missing VOLC_ENGINE_AK or VOLC_ENGINE_SK environment variables');
  }

  // 翻译目标语言、翻译文本列表
  const { message } = request.body
  const imageBase64 = message;

  // api凭证
  const credentials = new Credentials(AK, SK, 'translate', 'cn-north-1');

  // 设置请求的 header、query、body
  const header = new Request.Header({
    'Content-Type': 'application/json'
  });
  const query = new Request.Query({
    'Action': 'TranslateImage',
    'Version': '2020-07-01'
  });
  // const compressedImage = compressImageSync(imageBase64, 50);
  // const base64Image = compressedImage.toString('base64');



  const body = new Request.Body({
    'TargetLanguage': 'zh',
    'Image': imageBase64
  });

  // 设置 service、api信息
  const serviceInfo = new ServiceInfo(
    'open.volcengineapi.com',
    header,
    credentials
  );
  const apiInfo = new ApiInfo('POST', '/', query, body);

  // 生成 API
  const api = API(serviceInfo, apiInfo);

  try {
    // 等待 axios 请求完成
    const axiosResponse = await axios.post(api.url, api.params, api.config);

    // 添加响应数据检查
    if (!axiosResponse.data || !axiosResponse.data.Image) {
      throw new Error('Invalid response data');
    }

    const compressedResBase64 = await compressImage(axiosResponse.data.Image, 50);

    // 添加超时处理
    const timeout = setTimeout(() => {
      response.status(504).json({ message: '处理超时' });
    }, 30000); // 30秒超时

    const resImage = "data:image/jpeg;base64," + compressedResBase64;
    clearTimeout(timeout);

    response.status(200).json({ message: resImage });
  } catch (error) {
    console.error('处理请求时出错:', error);
    // 更详细的错误信息
    response.status(500).json({
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}



async function compressImage(base64String: string, quality: number) {
  const inputBuffer = Buffer.from(base64String, 'base64');

  try {
    const outputBuffer = await sharp(inputBuffer)
      .jpeg({
        quality: quality,
        mozjpeg: true, // 使用 mozjpeg 编码器获得更好的压缩效果
        chromaSubsampling: '4:2:0', // 降低色度采样
        trellisQuantisation: true, // 使用网格量化
        overshootDeringing: true, // 过冲去振铃
        optimizeScans: true, // 优化扫描
        optimizeCoding: true, // 优化编码
        quantisationTable: 3 // 使用更激进的量化表
      })
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    // 手动清理
    inputBuffer.fill(0);

    return outputBuffer.toString('base64');
  } finally {
    // 确保资源被释放
    if (inputBuffer) inputBuffer.fill(0);
  }
}
