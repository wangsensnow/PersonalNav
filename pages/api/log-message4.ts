import type { NextApiRequest, NextApiResponse } from 'next';
type ResponseData = {
  message: string
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ResponseData>
) {
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

  const compressedImage2 = await compressImage(imageBase64, 50);
  console.log("压缩后", compressedImage2.slice(0, 100));

  const body = new Request.Body({
    'TargetLanguage': 'zh',
    'Image': compressedImage2
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
    const resImage = "data:image/jpeg;base64," + axiosResponse.data.Image;

    // 返回响应
    response.status(200).json({ message: resImage });
  } catch (error) {
    console.error('处理请求时出错:', error);
    response.status(500).json({ message: '服务器内部错误' });
  }
}


// 同步压缩图片函数
function compressImageSync(base64String: string, quality: number) {
  // 将 Base64 字符串解码为 Buffer 对象
  const inputBuffer = Buffer.from(base64String, 'base64');
  const sharp = require('sharp');
  // 使用 sharp 压缩图片并返回压缩后的 Buffer 对象
  const outputBuffer = sharp(inputBuffer)
    .jpeg({ quality: quality })
    .toBuffer();

  return outputBuffer;
}


async function compressImage(base64String: string, quality: number) {
  // 将 Base64 字符串解码为 Buffer 对象
  const inputBuffer = Buffer.from(base64String, 'base64');
  const sharp = require('sharp');
  // 使用 sharp 压缩图片
  const outputBuffer = await sharp(inputBuffer)
    .jpeg({ quality: quality })
    .toBuffer();

  // 将压缩后的 Buffer 对象转换为 Base64 字符串
  const compressedBase64 = outputBuffer.toString('base64');

  return compressedBase64;
}
