import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, 
    serverTimestamp, query, orderBy, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 1. วาง Config ของคุณตรงนี้!
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const callsCollection = collection(db, "calls");

// ==========================================
// 🍔 ส่วนที่เพิ่มใหม่: ข้อมูลจำลองเมนูอาหาร (จัดเต็มและเป็นมืออาชีพ)
// ==========================================
const menuData = [
    {
        category: "🍳 มื้อเช้าแสนอร่อย & บรันช์ (6:00 - 11:30 น.)",
        items: [
            { name: "ชุดอาหารเช้าสไตล์อเมริกัน", price: "180 ฿" },
            { name: "เอ้กเบเนดิกต์ซอสดัตช์", price: "195 ฿" },
            { name: "แพนเค้กผลไม้รวม & ไซรัปแมคเปิล", price: "165 ฿" },
            { name: "โจ๊กหมูใส่ไข่ & เห็ดหอม", price: "95 ฿" }
        ]
    },
    {
        category: "🍝 อาหารจานเด็ด & พาสต้า",
        items: [
            { name: "พาสต้าคาร์โบนาร่าครีมเข้มข้น", price: "210 ฿" },
            { name: "พาสต้าอากลิโอ โอลิโอพริกกระเทียม", price: "190 ฿" },
            { name: "ข้าวผัดกระเพราเนื้อสับไข่ดาว", price: "135 ฿" },
            { name: "ข้าวผัดสับปะรดทรงเครื่อง", price: "160 ฿" },
            { name: "สเต็กไก่สไปซี่ & มันฝรั่งทอด", price: "230 ฿" }
        ]
    },
    {
        category: "🍲 ซุป & สลัดเพื่อสุขภาพ",
        items: [
            { name: "ซุปเห็ดทรัฟเฟิลหอมกรุ่น", price: "185 ฿" },
            { name: "ซุปมะเขือเทศครีมซอส", price: "155 ฿" },
            { name: "ซีซาร์สลัดไก่อบ", price: "175 ฿" },
            { name: "สลัดทูน่าพริกไทยดำ", price: "180 ฿" }
        ]
    },
    {
        category: "🥤 เครื่องดื่มเย็นฉ่ำ",
        items: [
            { name: "ชานมไทยเย็นสูตรเข้มข้น", price: "80 ฿" },
            { name: "กาแฟเอสเพรสโซ่เย็น", price: "95 ฿" },
            { name: "น้ำผลไม้คั้นสดตามฤดูกาล", price: "110 ฿" },
            { name: "เบียร์สิงห์เย็นๆ", price: "100 ฿" },
            { name: "ไวน์แดงออสเตรเลีย", price: "1,200 ฿" }
        ]
    },
    {
        category: "🍰 ของหวานแสนหวาน",
        items: [
            { name: "ช็อกโกแลตลาวา & ไอศกรีมวานิลลา", price: "140 ฿" },
            { name: "ชีสเค้กหน้าไหม้", price: "125 ฿" },
            { name: "พานาคอตต้าผลไม้รวม", price: "130 ฿" }
        ]
    }
];

// ฟังก์ชันสร้างรายการเมนูใส่ใน Popup
function renderMenu() {
    const menuContainer = document.getElementById('menuContainer');
    if (!menuContainer) return;
    
    let html = '';
    menuData.forEach(group => {
        html += `<h3 class="menu-category">${group.category}</h3>`;
        group.items.forEach(item => {
            html += `
                <div class="menu-item">
                    <span class="menu-name">${item.name}</span>
                    <span class="menu-price">${item.price}</span>
                </div>
            `;
        });
        html += `<div class="menu-divider"></div>`;
    });
    menuContainer.innerHTML = html;
}

// ==========================================
// ฝั่งลูกค้า: ส่งข้อมูล
// ==========================================
window.sendRequest = async function(type) {
    const tableNumber = document.getElementById('tableNumber').value;
    
    if(!tableNumber) {
        Swal.fire({
            icon: 'warning',
            title: 'อ๊ะ!',
            text: 'กรุณาระบุหมายเลขโต๊ะก่อนกดเรียกนะครับ',
            confirmButtonColor: '#3498db'
        });
        return;
    }

    // ถ้ากด "ขอเมนู" ให้สร้างเมนูและเปิดหน้าต่าง Popup
    if (type === 'ขอเมนู') {
        renderMenu(); // เรียกใช้ฟังก์ชันสร้างเมนูก่อนเปิด Popup
        const modal = document.getElementById('menuModal');
        if(modal) modal.style.display = 'flex';
    }

    try {
        await addDoc(callsCollection, {
            table: tableNumber,
            type: type,
            timestamp: serverTimestamp()
        });
        
        if (type !== 'ขอเมนู') {
            Swal.fire({
                icon: 'success',
                title: 'ส่งคำขอสำเร็จ!',
                text: `พนักงานกำลังไปที่โต๊ะ ${tableNumber} เพื่อ ${type} ครับ`,
                timer: 2500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error("Error adding document: ", error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่', 'error');
    }
}

window.closeMenu = function() {
    const modal = document.getElementById('menuModal');
    if(modal) modal.style.display = 'none';
}

// ==========================================
// ฝั่งพนักงาน: รับข้อมูล Real-time
// ==========================================
const requestListDiv = document.getElementById('requestList');
const q = query(callsCollection, orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
    requestListDiv.innerHTML = ''; 
    
    if (snapshot.empty) {
        requestListDiv.innerHTML = `
            <div style="text-align: center; color: #95a5a6; padding: 20px;">
                <i class="fa-solid fa-mug-hot" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>ตอนนี้ยังไม่มีคิวเรียกพนักงานครับ</p>
            </div>
        `;
        return;
    }

    snapshot.forEach((document) => {
        const data = document.data();
        const docId = document.id; 

        let iconHtml = '';
        if(data.type === 'เรียกพนักงาน') iconHtml = '<i class="fa-solid fa-hand-sparkles" style="color:#3498db;"></i>';
        if(data.type === 'ขอเมนู') iconHtml = '<i class="fa-solid fa-book-open" style="color:#f1c40f;"></i>';
        if(data.type === 'เก็บเงิน') iconHtml = '<i class="fa-solid fa-file-invoice-dollar" style="color:#e74c3c;"></i>';

        const div = document.createElement('div');
        div.className = `request-item ${data.type}`;
        
        div.innerHTML = `
            <div class="req-info">
                <strong>โต๊ะ ${data.table}</strong> 
                <span>${iconHtml} ${data.type}</span>
            </div>
            <button class="done-btn" onclick="markAsDone('${docId}')">
                <i class="fa-solid fa-check"></i> เรียบร้อย
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