import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const callsRef = collection(db, "calls");


const menus = [
    {
        category: "กาแฟสด (Coffee)",
        items: [
            { name: "กาแฟเย็น อเมซอน (Signature)", price: "70 ฿" },
            { name: "แบล็คคอฟฟี่เย็น ", price: "60 ฿" },
            { name: "เอสเพรสโซ่เย็น ", price: "60 ฿" },
            { name: "คาปูชิโน่เย็น", price: "65 ฿" },
            { name: "ลาเต้เย็น", price: "70 ฿" }
        ]
    },
    {
        category: "ชา & เครื่องดื่มอื่นๆ (Tea & Others)",
        items: [
            { name: "ชานมเย็น", price: "55 ฿" },
            { name: "ชาเขียวนมเย็น", price: "55 ฿" },
            { name: "ดาร์คช็อคโกแลตเย็น", price: "60 ฿" },
            { name: "สตรอว์เบอร์รีชีสเค้กปั่น", price: "75 ฿" },
            { name: "เฟรชไลม์ฮันนี่ (น้ำผึ้งมะนาว)", price: "55 ฿" }
        ]
    },
    {
        category: "เบเกอรี่ & ของว่าง (Bakery)",
        items: [
            { name: "เค้กส้มหน้านิ่ม", price: "65 ฿" },
            { name: "แซนวิชแฮมชีส", price: "45 ฿" },
            { name: "บราวนี่ดาร์คช็อค", price: "55 ฿" },
            { name: "พายทูน่า", price: "40 ฿" }
        ]
    }
];

// ระบบตะกร้าเก็บออเดอร์
let cart = {};

// ฟังก์ชันเพิ่ม/ลด อาหาร
window.changeQty = (itemName, amount) => {
    if (!cart[itemName]) cart[itemName] = 0;
    cart[itemName] += amount;
    if (cart[itemName] <= 0) delete cart[itemName];
    renderMenu(); 
};

// เรนเดอร์เมนูแบบมีปุ่ม + / -
const renderMenu = () => {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    let html = '';
    menus.forEach(group => {
        html += `<h3 class="menu-category" style="background:#e8f6f0; color: #27ae60; padding:10px; border-radius:5px; border-left: 5px solid #2ecc71;">${group.category}</h3>`;
        group.items.forEach(item => {
            const qty = cart[item.name] || 0;
            html += `
                <div class="menu-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px;">
                    <div>
                        <div class="menu-name" style="font-weight:bold; color:#2c3e50;">${item.name}</div>
                        <div class="menu-price" style="font-size:0.85rem; color:#e67e22;">${item.price}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button onclick="changeQty('${item.name}', -1)" style="width:32px; height:32px; border-radius:8px; border:1px solid #e74c3c; background:#fff; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:1.1rem;">-</button>
                        <span style="font-weight:bold; width: 20px; text-align: center; font-size:1.1rem;">${qty}</span>
                        <button onclick="changeQty('${item.name}', 1)" style="width:32px; height:32px; border-radius:8px; border:none; background:#2ecc71; color:#fff; cursor:pointer; font-weight:bold; font-size:1.1rem;">+</button>
                    </div>
                </div>
            `;
        });
    });

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    if (totalItems > 0) {
        html += `
            <div style="position: sticky; bottom: -20px; background: white; padding: 15px 0; border-top: 2px solid #eee; text-align: center;">
                <button onclick="submitOrder()" style="background: #27ae60; color: white; border: none; padding: 15px 20px; border-radius: 8px; width: 100%; font-size: 1.1rem; font-weight: bold; cursor: pointer; font-family: inherit; box-shadow: 0 4px 6px rgba(39, 174, 96, 0.3);">
                    <i class="fa-solid fa-mug-hot"></i> สั่งเครื่องดื่ม (${totalItems} แก้ว/ชิ้น)
                </button>
            </div>
        `;
    }

    container.innerHTML = html;
};

// ฟังก์ชันกดปุ่มหน้าหลัก
window.sendRequest = async (type) => {
    const tableInput = document.getElementById('tableNumber');
    const tableNumber = tableInput ? tableInput.value.trim() : '';
    
    if (!tableNumber) {
        return Swal.fire({ icon: 'warning', title: 'เดี๋ยวก่อน', text: 'ระบุเลขโต๊ะก่อนครับ', confirmButtonColor: '#27ae60' });
    }

    if (type === 'ขอเมนู') {
        cart = {}; // เคลียร์ตะกร้า
        renderMenu(); 
        const modal = document.getElementById('menuModal');
        if (modal) modal.style.display = 'flex';
        return; 
    }

    submitToFirebase(tableNumber, type, null);
};

// ฟังก์ชันส่งออเดอร์เข้าบาร์น้ำ
window.submitOrder = () => {
    const tableInput = document.getElementById('tableNumber');
    const tableNumber = tableInput ? tableInput.value.trim() : '';
    
    const orderItems = Object.entries(cart).map(([name, qty]) => `${name} x${qty}`);
    
    submitToFirebase(tableNumber, 'สั่งเครื่องดื่ม', orderItems);
    closeMenu();
};

// ฟังก์ชันยิงเข้า Firebase
const submitToFirebase = async (table, type, itemsData) => {
    try {
        await addDoc(callsRef, {
            table: table,
            type: type,
            items: itemsData,
            timestamp: serverTimestamp()
        });
        
        Swal.fire({
            icon: 'success',
            title: 'รับออเดอร์แล้ว!',
            text: type === 'สั่งเครื่องดื่ม' ? `ส่งออเดอร์โต๊ะ ${table} เข้าบาร์น้ำเรียบร้อย` : `ส่งคำขอ "${type}" โต๊ะ ${table} เรียบร้อย`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        console.error("Firebase Error:", err);
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อระบบได้ ลองใหม่อีกครั้ง', 'error');
    }
}

window.closeMenu = () => {
    const modal = document.getElementById('menuModal');
    if (modal) modal.style.display = 'none';
};
// ดึงเลขโต๊ะจาก QR Code (URL Parameter)
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNo = urlParams.get('table');
    
    if (tableNo) {
        const tableInput = document.getElementById('tableNumber');
        if (tableInput) {
            tableInput.value = tableNo; // ใส่เลขโต๊ะออโต้
            tableInput.readOnly = true; // ล็อกไม่ให้ลูกค้ากดเปลี่ยนเลขเอง
            tableInput.style.backgroundColor = "#e9ecef"; // เปลี่ยนสีให้รู้ว่าล็อกอยู่
            tableInput.style.cursor = "not-allowed";
        }
    }
};