
import { CustomerProfile, ScalpReportRecord, ScalpImages } from '../types';
import { db, storage, isFirebaseConfigured } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { idbSaveCustomer, idbGetCustomer } from './indexedDbService';

const COLLECTION_NAME = 'customers';

// --- Image Upload Helper (Conditional) ---
const processImagesForCloud = async (
  images: ScalpImages, 
  customerId: string, 
  timestamp: number, 
  suffix: 'before' | 'after'
): Promise<ScalpImages> => {
  // 如果沒有設定 Firebase 或不打算上傳雲端，直接回傳原始 Base64 (本機模式)
  if (!isFirebaseConfigured) return images;

  const processed: ScalpImages = { ...images };
  const imageKeys: (keyof ScalpImages)[] = ['whiteLight', 'polarizedLight', 'custom'];

  for (const key of imageKeys) {
    const content = images[key];
    if (content && content.startsWith('data:image')) {
      try {
        const filePath = `customers/${customerId}/reports/${timestamp}/${key}_${suffix}.jpg`;
        const storageRef = ref(storage, filePath);
        await uploadString(storageRef, content, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        processed[key] = downloadURL;
      } catch (error) {
        console.error(`Cloud upload failed for ${key}:`, error);
      }
    }
  }
  return processed;
};

// --- Main Service Methods ---

export const saveCustomer = async (customer: CustomerProfile): Promise<void> => {
  // 1. 優先存入平板本地 IndexedDB (確保照片即時保存)
  await idbSaveCustomer(customer);

  // 2. 如果有 Firebase，同步到雲端
  if (isFirebaseConfigured) {
    try {
      const customerRef = doc(db, COLLECTION_NAME, customer.id);
      await setDoc(customerRef, customer, { merge: true });
    } catch (e) {
      console.warn("Cloud sync failed, data is safe in local storage.");
    }
  }
};

export const findCustomerByPhone = async (phone: string): Promise<CustomerProfile | undefined> => {
  // 1. 優先從平板本地讀取 (速度最快)
  const localCustomer = await idbGetCustomer(phone);
  if (localCustomer) return localCustomer;

  // 2. 本地沒有才找雲端
  if (isFirebaseConfigured) {
    try {
      const customerRef = doc(db, COLLECTION_NAME, phone);
      const docSnap = await getDoc(customerRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as CustomerProfile;
        // 同步回本地
        await idbSaveCustomer(cloudData);
        return cloudData;
      }
    } catch (e) {
      console.error("Cloud lookup error", e);
    }
  }
  return undefined;
};

export const addReportToCustomer = async (phone: string, report: ScalpReportRecord): Promise<void> => {
  // 1. 取得現有資料
  const customer = await findCustomerByPhone(phone);
  if (!customer) throw new Error("Customer not found");

  // 2. 更新本地 (含大檔案 Base64 照片)
  if (!customer.history) customer.history = [];
  customer.history.push(report);
  await idbSaveCustomer(customer);

  // 3. 同步雲端 (如果已設定)
  if (isFirebaseConfigured) {
    try {
      const reportForCloud = { ...report };
      // 雲端模式下，將照片轉換為 URL 再存入 Firestore
      reportForCloud.data.observation.images = await processImagesForCloud(
        report.data.observation.images, phone, report.timestamp, 'before'
      );
      if (report.data.observationAfter) {
        reportForCloud.data.observationAfter.images = await processImagesForCloud(
          report.data.observationAfter.images, phone, report.timestamp, 'after'
        );
      }
      
      const customerRef = doc(db, COLLECTION_NAME, phone);
      await updateDoc(customerRef, {
        history: arrayUnion(reportForCloud)
      });
    } catch (e) {
      console.error("Cloud sync failed during report addition", e);
    }
  }
};

export const updateCustomerReport = async (phone: string, reportId: string, updatedReport: ScalpReportRecord): Promise<void> => {
  const customer = await findCustomerByPhone(phone);
  if (customer) {
    customer.history = customer.history.map(r => r.id === reportId ? updatedReport : r);
    await idbSaveCustomer(customer);
    
    // 如果有雲端，則同樣需要同步邏輯 (略，同 addReport)
  }
};
