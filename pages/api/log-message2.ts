import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse<ResponseData>
) {
  // import VolcEngineSDK from "volcengine-sdk";
  const VolcEngineSDK = require("volcengine-sdk");
  const axios = require("axios");

  const { ApiInfo, ServiceInfo, Credentials, API, Request } = VolcEngineSDK;

  // 设置安全凭证 AK、SK
  const AK = 'AKLTNTA0M2ViZTdjMmRmNDI2YTg3ODA2ZmEyYzRkMTBhZTE';
  const SK = 'TWpGalpUTTJOakZoTXpZeU5EZGhaV0psWWpsbVpqRXlZemcxTVdRell6WQ==';

  // 翻译目标语言、翻译文本列表
  const toLang = 'zh';
  const textList = ['Hello world', 'こんにちは世界'];

  // api凭证
  const credentials = new Credentials(AK, SK, 'translate', 'cn-north-1');

  // 设置请求的 header、query、body
  const header = new Request.Header({
    'Content-Type': 'application/json'
  });
  const query = new Request.Query({
    'Action': 'TranslateText',
    'Version': '2020-06-01'
  });
  const body = new Request.Body({
    'TargetLanguage': toLang,
    'TextList': textList
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
  // console.log(api.url, api.params, api.config);

  // 获取 API 数据，发送请求
  axios.post(api.url, api.params, api.config)
    .then((res: { data: any }) => {
      console.log(res.data);
    })
    .catch((err: Error) => {
      console.log('err', err);
    });

  try {
    // 返回固定的响应
    response.status(200).json({ message: '123' })
  } catch (error) {
    console.error('处理请求时出错:', error)
    response.status(500).json({ message: '服务器内部错误' })
  }
} 