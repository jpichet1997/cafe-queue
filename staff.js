import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// 🌟 1. เพิ่ม getDoc และ setDoc สำหรับย้ายข้อมูลประวัติการขาย
import { getFirestore, collection, onSnapshot, query, orderBy, deleteDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// 🌟 2. ตัวแปรสำหรับระบบเสียงแจ้งเตือน
let previousCount = 0; 
const notificationSound = new Audio('https://actions.google.com/sounds/v1/alarms/ding.ogg'); 

onSnapshot(q, (snapshot) => {
    if (!requestListDiv) return;
    requestListDiv.innerHTML = '';

    // 🌟 3. สั่งให้เสียง "ติ๊งหน่อง" ดัง ถ้ามีออเดอร์ใหม่เพิ่มเข้ามา
    if (snapshot.size > previousCount && previousCount !== 0) {
        notificationSound.play().catch(e => console.log("เบราว์เซอร์บล็อกเสียง (ต้องคลิกหน้าจอ 1 ครั้งก่อน)"));
    }
    previousCount = snapshot.size; // อัปเดตจำนวนออเดอร์ล่าสุด

    // ปรับข้อความตอนว่างให้ดูเป็นกันเอง น่ารักขึ้น
    if (snapshot.empty) {
        requestListDiv.innerHTML = `
            <div style="text-align: center; color: #95a5a6; padding: 40px 20px;">
                <i class="fa-solid fa-mug-hot" style="font-size: 3.5rem; margin-bottom: 15px; color: #d1d8e0;"></i>
                <h3 style="margin: 0; color: #1e3f30; font-family: 'Mitr', sans-serif;">ว่างจ้า~ 🍵</h3>
                <p style="margin-top: 8px; font-size: 1.1rem; color: #7f8c8d;">ตอนนี้ยังไม่มีออเดอร์ใหม่ครับ พักซักนิดนึงนะ!</p>
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

        // ปรับเงื่อนไขสีและไอคอนให้ตรงกับธีมใหม่
        if (data.type === 'เรียกพนักงาน') {
            iconHtml = '<i class="fa-solid fa-hand-sparkles"></i>';
            borderColor = '#3498db'; // สีน้ำเงิน
        } else if (data.type === 'สั่งเครื่องดื่ม') { 
            iconHtml = '<i class="fa-solid fa-mug-hot"></i>'; 
            borderColor = '#27ae60'; // สีเขียวอเมซอน
        } else if (data.type === 'เก็บเงิน') {
            iconHtml = '<i class="fa-solid fa-file-invoice-dollar"></i>';
            borderColor = '#e74c3c'; // สีแดง
        } else {
            iconHtml = '<i class="fa-solid fa-bell"></i>';
            borderColor = '#95a5a6';
        }

        // ปรับสไตล์กล่องรายการอาหารให้ดูเหมือนกระดาษโน้ต 
        // 🌟 4. เพิ่มการแสดง "ยอดรวม" (totalPrice) ในบิล
        let orderDetailsHtml = '';
        if (data.type === 'สั่งเครื่องดื่ม' && data.items && data.items.length > 0) {
            orderDetailsHtml = `
                <div style="margin-top: 15px; padding: 15px; background: #fdf8f0; border-radius: 8px; border: 2px dashed #c68d5d;">
                    <div style="font-weight: 600; margin-bottom: 10px; color: #1e3f30; font-family: 'Mitr', sans-serif; display: flex; align-items: center; justify-content: space-between;">
                        <span><i class="fa-solid fa-clipboard-list"></i> รายการที่สั่ง:</span>
                        <span style="color: #e67e22; font-size: 1.2rem;">รวม ${data.totalPrice || 0} ฿</span>
                    </div>`;

            data.items.forEach(item => {
                orderDetailsHtml += `<div style="font-size: 1.05rem; color: #2c3e50; padding: 6px 0; border-bottom: 1px solid #eee;">• ${item}</div>`;
            });

            orderDetailsHtml += `</div>`;
        }

        const div = document.createElement('div');
        div.className = `request-item`;
        div.style.borderLeft = `6px solid ${borderColor}`;

        div.innerHTML = `
            <div class="req-info">
                <div class="table-box">
                    <div class="table-label">โต๊ะ</div>
                    <div class="table-number">${data.table || "-"}</div>
                </div>
                <div class="order-details">
                    <div class="order-type" style="color: ${borderColor};">
                        ${iconHtml} ${data.type}
                    </div>
                    <div class="order-time">
                        <i class="fa-regular fa-clock"></i> เวลา: ${timeString}
                    </div>
                    ${orderDetailsHtml}
                </div>
            </div>
            <button class="done-btn" onclick="markAsDone('${docId}')">
                <i class="fa-solid fa-check"></i> เสิร์ฟแล้ว
            </button>
        `;
        requestListDiv.appendChild(div);
    });
}, (error) => {
    console.error("🔥 โอ๊ะ! เกิดข้อผิดพลาดจาก Firebase:", error);
});

// 🌟 5. เปลี่ยนระบบปุ่มกด "เสิร์ฟแล้ว" เป็นการย้ายข้อมูลไปห้องประวัติ (history)
window.markAsDone = async function (docId) {
    try {
        const docRef = doc(db, "calls", docId);
        const docSnap = await getDoc(docRef); // อ่านข้อมูลเดิมก่อน
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            data.completedAt = new Date(); // แสตมป์เวลาที่เสิร์ฟเสร็จ
            
            // คัดลอกไปเก็บในคอลเลกชันใหม่ชื่อ "history"
            await setDoc(doc(db, "history", docId), data); 
            
            // ลบออกจากคิวหน้าพนักงาน
            await deleteDoc(docRef); 
        }
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}