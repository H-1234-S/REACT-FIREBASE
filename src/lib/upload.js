/**
 * 文件上传服务
 * 
 * 功能：
 * - 将图片文件上传到 Firebase Storage
 * - 返回文件的下载 URL
 * 
 * [用户选择图片] -> [Firebase Storage] -> [返回下载 URL]
 */
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

/**
 * 上传文件到 Firebase Storage
 * @param {File} file - 要上传的文件对象
 * @returns {Promise<string>} - 文件的下载 URL
 */
const upload = async (file) => {
  const date = new Date();
  // 使用时间戳 + 文件名作为存储路径
  const storageRef = ref(storage, `images/${date + file.name}`);

  // 创建上传任务
  const uploadTask = uploadBytesResumable(storageRef, file);

  // 返回 Promise，处理上传结果
  return new Promise((resolve, reject) => {
    // 监听上传状态变化
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // 计算上传进度百分比
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      // 上传失败回调
      (error) => {
        reject("Something went wrong!" + error.code);
      },
      // 上传成功回调
      () => {
        // 获取文件的下载 URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // [Firebase Storage] -> [返回下载 URL]
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
