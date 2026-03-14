import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAXq6TUvsRoonGW1MK7osGcIc-0y0gRdg",
  authDomain: "smart-service-8b826.firebaseapp.com",
  projectId: "smart-service-8b826",
  storageBucket: "smart-service-8b826.firebasestorage.app",
  messagingSenderId: "1074078744968",
  appId: "1:1074078744968:web:6ad3922ca0ee13daba3a3d",
  measurementId: "G-S17ES6QV2M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const callsCollection = collection(db, "calls");
const requestListDiv = document.getElementById('requestList');

const q = query(callsCollection, orderBy("timestamp", "asc")); 

onSnapshot(q, (snapshot) => {
    if (!requestListDiv) return;
    requestListDiv.innerHTML = ''; 
    
    if (snapshot.empty) {
        requestListDiv.innerHTML = `
            <div style="text-align: center; color: #95a5a6; padding: 40px 20px;">
                <i class="fa-solid fa-mug-hot" style="font-size: 3rem; margin-bottom: 15px; color: #bdc3c7;"></i>
                <h3 style="margin: 0; color: #7f8c8d;">ว่างจ้า~</h3>
                <p style="margin-top: 5px;">ยังไม่มีคิวเรียกพนักงาน หรือออเดอร์ใหม่ครับ</p>
            </div>
        `;
        return;
    }

    snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const docId = docSnapshot.id; 

        let timeString = "เพิ่งเรียก";
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            timeString = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
        }

        let iconHtml = '';
        let borderColor = '#3498db'; 

        if(data.type === 'เรียกพนักงาน') {
            iconHtml = '<i class="fa-solid fa-hand-sparkles"></i>';
            borderColor = '#3498db'; 
        } else if(data.type === 'สั่งอาหาร') {
            iconHtml = '<i class="fa-solid fa-utensils"></i>';
            borderColor = '#e67e22'; // สีส้มสำหรับสั่งอาหาร
        } else if(data.type === 'เก็บเงิน') {
            iconHtml = '<i class="fa-solid fa-file-invoice-dollar"></i>';
            borderColor = '#e74c3c'; 
        } else {
            iconHtml = '<i class="fa-solid fa-bell"></i>';
        }

        // 🌟 สร้างรายการอาหารในบิล (ถ้ามี)
    // 🌟 ส่วนที่ใช้แสดงรายการเครื่องดื่มที่ลูกค้าสั่ง
let orderDetailsHtml = '';

// แก้ไขบรรทัดนี้: เช็กให้ชื่อตรงกับที่ลูกค้าส่งมา (สั่งเครื่องดื่ม)
if (data.type === 'สั่งเครื่องดื่ม' && data.items && data.items.length > 0) {
    orderDetailsHtml = `
        <div style="margin-top: 12px; padding: 12px; background: #e8f6f0; border-radius: 8px; border: 1px dashed #27ae60;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #27ae60;">
                <i class="fa-solid fa-clipboard-list"></i> รายการที่สั่ง:
            </div>`;
            
    data.items.forEach(item => {
        orderDetailsHtml += `<div style="font-size: 1rem; color: #2c3e50; padding: 5px 0; border-bottom: 1px solid #d1eadd;">• ${item}</div>`;
    });
    
    orderDetailsHtml += `</div>`;
}

        const div = document.createElement('div');
        div.className = `request-item`;
        div.style.borderLeft = `6px solid ${borderColor}`;
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'flex-start'; // เปลี่ยนเป็น flex-start เพื่อให้ปุ่มอยู่ด้านบนถ้าบิลยาว
        div.style.padding = '15px';
        div.style.marginBottom = '12px';
        div.style.backgroundColor = '#fff';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
        
        div.innerHTML = `
            <div style="display: flex; gap: 15px; width: 100%;">
                <div style="background-color: #f8f9fa; padding: 10px; border-radius: 8px; text-align: center; min-width: 65px; height: fit-content;">
                    <div style="font-size: 0.8rem; color: #7f8c8d;">โต๊ะ</div>
                    <div style="font-size: 1.6rem; font-weight: bold; color: #2c3e50;">${data.table || "-"}</div>
                </div>
                <div style="flex-grow: 1;">
                    <div style="font-size: 1.1rem; font-weight: 600; color: ${borderColor}; margin-bottom: 4px;">
                        ${iconHtml} ${data.type}
                    </div>
                    <div style="font-size: 0.85rem; color: #95a5a6;">
                        <i class="fa-regular fa-clock"></i> เวลา: ${timeString}
                    </div>
                    ${orderDetailsHtml} 
                </div>
            </div>
            <button class="done-btn" onclick="markAsDone('${docId}')" style="background-color: #2ecc71; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; margin-left: 15px; flex-shrink: 0;">
                <i class="fa-solid fa-check"></i> เสิร์ฟแล้ว
            </button>
        `;
        requestListDiv.appendChild(div);
    });
});

window.markAsDone = async function(docId) {
    try {
        await deleteDoc(doc(db, "calls", docId));
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}