// SM.MS API 配置
const SMMS_API_BASE_URL = 'https://sm.ms/api/v2';
const SMMS_API_TOKEN = 'dtjjrDw6kuSY1VWfmbPLoKVoTFbFh2cI';

// API响应接口
interface SmmsApiResponse<T = any> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  RequestId: string;
}

// 上传响应数据接口
interface UploadResponseData {
  file_id: number;
  width: number;
  height: number;
  filename: string;
  storename: string;
  size: number;
  path: string;
  hash: string;
  url: string;
  delete: string;
  page: string;
}

// 用户信息接口
interface UserProfileData {
  username: string;
  email: string;
  role: string;
  group_expire: string;
  email_verified: number;
  disk_usage: string;
  disk_usage_raw: number;
  disk_limit: string;
  disk_limit_raw: number;
}

// 上传历史记录接口
interface UploadHistoryItem {
  file_id: number;
  width: number;
  height: number;
  filename: string;
  storename: string;
  size: number;
  path: string;
  hash: string;
  created_at: string;
  url: string;
  delete: string;
  page: string;
}

// 创建API请求头
function createHeaders(): HeadersInit {
  return {
    'Authorization': SMMS_API_TOKEN,
    'Content-Type': 'multipart/form-data',
  };
}

// 上传图片
export async function uploadImage(file: File): Promise<UploadResponseData> {
  try {
    const formData = new FormData();
    formData.append('smfile', file);
    formData.append('format', 'json');

    const response = await fetch(`${SMMS_API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': SMMS_API_TOKEN,
      },
      body: formData,
    });

    const result: SmmsApiResponse<UploadResponseData> = await response.json();

    if (!result.success) {
      throw new Error(result.message || '上传失败');
    }

    return result.data;
  } catch (error) {
    console.error('SM.MS上传失败:', error);
    throw error;
  }
}

// 获取用户信息
export async function getUserProfile(): Promise<UserProfileData> {
  try {
    const response = await fetch(`${SMMS_API_BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Authorization': SMMS_API_TOKEN,
        'Content-Type': 'multipart/form-data',
      },
    });

    const result: SmmsApiResponse<UserProfileData> = await response.json();

    if (!result.success) {
      throw new Error(result.message || '获取用户信息失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取SM.MS用户信息失败:', error);
    throw error;
  }
}

// 获取上传历史
export async function getUploadHistory(page: number = 1): Promise<UploadHistoryItem[]> {
  try {
    const formData = new FormData();
    formData.append('page', page.toString());

    const response = await fetch(`${SMMS_API_BASE_URL}/upload_history`, {
      method: 'GET',
      headers: {
        'Authorization': SMMS_API_TOKEN,
      },
    });

    const result: SmmsApiResponse<UploadHistoryItem[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || '获取上传历史失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取SM.MS上传历史失败:', error);
    throw error;
  }
}

// 删除图片
export async function deleteImage(hash: string): Promise<boolean> {
  try {
    const response = await fetch(`${SMMS_API_BASE_URL}/delete/${hash}?format=json`, {
      method: 'GET',
      headers: {
        'Authorization': SMMS_API_TOKEN,
      },
    });

    const result: SmmsApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || '删除失败');
    }

    return true;
  } catch (error) {
    console.error('SM.MS删除图片失败:', error);
    throw error;
  }
}

// 清除IP临时上传历史
export async function clearTemporaryHistory(): Promise<boolean> {
  try {
    const response = await fetch(`${SMMS_API_BASE_URL}/clear?format=json`, {
      method: 'GET',
    });

    const result: SmmsApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || '清除失败');
    }

    return true;
  } catch (error) {
    console.error('清除SM.MS临时历史失败:', error);
    throw error;
  }
}

// 获取IP临时上传历史
export async function getTemporaryHistory(): Promise<UploadHistoryItem[]> {
  try {
    const response = await fetch(`${SMMS_API_BASE_URL}/history?format=json`, {
      method: 'GET',
    });

    const result: SmmsApiResponse<UploadHistoryItem[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || '获取临时历史失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取SM.MS临时历史失败:', error);
    throw error;
  }
}
