// ============ ตัวแปรและการตั้งค่าระบบ ============
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

let courses = JSON.parse(localStorage.getItem('courses')) || [];

// ============ ฟังก์ชันจัดการการล็อกอิน ============
function showLogin() {
    document.getElementById('loginPage').style.display = 'block';
}

function hideLogin() {
    document.getElementById('loginPage').style.display = 'none';
}

function checkRememberedLogin() {
    const remembered = JSON.parse(localStorage.getItem('rememberedLogin') || '{}');
    if (remembered.username && remembered.password) {
        document.getElementById('username').value = remembered.username;
        document.getElementById('password').value = remembered.password;
        document.getElementById('rememberMe').checked = true;
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        if (rememberMe) {
            localStorage.setItem('rememberedLogin', JSON.stringify({ username, password }));
        } else {
            localStorage.removeItem('rememberedLogin');
        }
        
        localStorage.setItem('isLoggedIn', 'true');
        hideLogin();
        showAdminFeatures();
        document.getElementById('publicView').style.display = 'none'; // ซ่อนหน้าหลัก
        alert('เข้าสู่ระบบสำเร็จ');
    } else {
        alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    hideAdminFeatures();
    document.getElementById('loginButton').style.display = 'inline-block';
    document.getElementById('logoutButton').style.display = 'none';
    document.getElementById('publicView').style.display = 'block'; // แสดงหน้าหลัก
    updateCourseList();
}

function isAdmin() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// ============ ฟังก์ชันจัดการหน้าแอดมิน ============
function showAdminFeatures() {
    document.getElementById('adminMenu').style.display = 'block';
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'inline-block';
    showManageCourses(); // แสดงหน้าจัดการรายวิชาทันที
}

function hideAdminFeatures() {
    document.getElementById('adminMenu').style.display = 'none';
    document.getElementById('addCoursePanel').style.display = 'none';
    document.getElementById('manageCoursePanel').style.display = 'none';
}

function showAddCourse() {
    document.getElementById('addCoursePanel').style.display = 'block';
    document.getElementById('manageCoursePanel').style.display = 'none';
}

function showManageCourses() {
    document.getElementById('addCoursePanel').style.display = 'none';
    document.getElementById('manageCoursePanel').style.display = 'block';
    updateAdminCourseList();
}

// ============ ฟังก์ชันจัดการรายวิชา ============
function addCourses() {
    const courseNamesText = document.getElementById('courseNames').value;
    const courseDetailsText = document.getElementById('courseDetails').value;
    const deadline = document.getElementById('deadline').value;
    
    if (!courseNamesText || !courseDetailsText || !deadline) {
        alert('กรุณากรอกข้อมูลให้ครบ');
        return;
    }
    
    // แยกรายวิชาและรายละเอียดตามการเว้น 2 บรรทัด
    const courseNames = courseNamesText.split('\n\n').filter(name => name.trim());
    const courseDetails = courseDetailsText.split('\n\n').filter(detail => detail.trim());
    
    // ตรวจสอบจำนวนรายการว่าตรงกัน
    if (courseNames.length !== courseDetails.length) {
        alert('จำนวนรายวิชาและรายละเอียดไม่ตรงกัน\nกรุณาตรวจสอบการเว้นบรรทัดให้ถูกต้อง');
        return;
    }
    
    // เพิ่มรายวิชาพร้อมรายละเอียด
    courseNames.forEach((name, index) => {
        const course = {
            name: name.trim(),
            details: courseDetails[index].trim(),
            deadline: deadline,
            id: Date.now() + Math.random()
        };
        courses.push(course);
    });
    
    saveCourses();
    updateAdminCourseList();
    clearForm();
    
    // แสดงสรุปการเพิ่มรายวิชา
    alert(`เพิ่มรายวิชาสำเร็จ ${courseNames.length} รายวิชา`);
}

function editCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        const newDetails = prompt('แก้ไขรายละเอียด:', course.details);
        if (newDetails !== null) {
            course.details = newDetails;
            saveCourses();
            updateAdminCourseList();
        }
    }
}

function editDeadline(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        const newDeadline = prompt('แก้ไขกำหนดส่ง (รูปแบบ: YYYY-MM-DDThh:mm):', course.deadline);
        if (newDeadline !== null) {
            course.deadline = newDeadline;
            saveCourses();
            updateAdminCourseList();
        }
    }
}

function deleteCourse(id) {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        courses = courses.filter(course => course.id !== id);
        saveCourses();
        updateAdminCourseList();
    }
}

function saveCourses() {
    localStorage.setItem('courses', JSON.stringify(courses));
}

function clearForm() {
    document.getElementById('courseNames').value = '';
    document.getElementById('courseDetails').value = '';
    document.getElementById('deadline').value = '';
}

// เพิ่มฟังก์ชันช่วยแสดงตัวอย่างการกรอกข้อมูล
function showInputExample() {
    const exampleFormat = 
        'ตัวอย่างการกรอกข้อมูล:\n\n' +
        'วิธีการกรอกชื่อวิชา:\n' +
        'วิชาคณิตศาสตร์\n\n' +
        'วิชาภาษาไทย\n\n' +
        'วิธีการกรอกรายละเอียด:\n' +
        'เนื้อหาคณิตศาสตร์ บทที่ 1-3\n\n' +
        'เนื้อหาภาษาไทย บทที่ 1-2\n\n' +
        '* หมายเหตุ: เว้น 2 บรรทัดระหว่างแต่ละวิชา';
    
    alert(exampleFormat);
}

function showEditCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        // ซ่อนหน้าอื่นๆ
        document.getElementById('manageCoursePanel').style.display = 'none';
        document.getElementById('addCoursePanel').style.display = 'none';
        
        // สร้างและแสดงฟอร์มแก้ไข
        const editPanel = document.createElement('div');
        editPanel.id = 'editCoursePanel';
        editPanel.className = 'admin-panel';
        editPanel.innerHTML = `
            <h2>แก้ไขรายวิชา: ${course.name}</h2>
            <div class="form-group">
                <label>ชื่อวิชา:</label>
                <input type="text" id="editCourseName" value="${course.name}">
            </div>
            <div class="form-group">
                <label>รายละเอียด:</label>
                <textarea id="editCourseDetails" rows="6">${course.details}</textarea>
            </div>
            <div class="form-group">
                <label>กำหนดส่ง:</label>
                <input type="datetime-local" id="editDeadline" value="${course.deadline}">
            </div>
            <button onclick="saveEditCourse(${course.id})" class="save-button">บันทึกการแก้ไข</button>
            <button onclick="cancelEdit()" class="cancel-button">ยกเลิก</button>
        `;
        
        // แทรกฟอร์มแก้ไขเข้าไปในหน้า
        document.querySelector('.container').appendChild(editPanel);
    }
}

// ============ ฟังก์ชันอัพเดทการแสดงผล ============
function updateCourseList() {
    const courseList = document.getElementById('courseList');
    if (!courseList) return;
    
    courseList.innerHTML = '';
    
    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';
        courseElement.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
            </div>
            <div class="course-content">
                <p>${course.details}</p>
                <p class="deadline">กำหนดส่ง: ${new Date(course.deadline).toLocaleString('th-TH')}</p>
            </div>
        `;
        courseList.appendChild(courseElement);
    });
}

function saveEditCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        course.name = document.getElementById('editCourseName').value;
        course.details = document.getElementById('editCourseDetails').value;
        course.deadline = document.getElementById('editDeadline').value;
        
        saveCourses();
        cancelEdit();
        updateAdminCourseList();
        alert('บันทึกการแก้ไขเรียบร้อยแล้ว');
    }
}

function cancelEdit() {
    const editPanel = document.getElementById('editCoursePanel');
    if (editPanel) {
        editPanel.remove();
    }
    document.getElementById('manageCoursePanel').style.display = 'block';
}   

// ============ อัพเดทฟังก์ชัน updateAdminCourseList ============
function updateAdminCourseList() {
    const adminCourseList = document.getElementById('adminCourseList');
    if (!adminCourseList) return;
    
    adminCourseList.innerHTML = '';
    
    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item admin-course-item';
        courseElement.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
            </div>
            <div class="course-content">
                <p>${course.details}</p>
                <p class="deadline">กำหนดส่ง: ${new Date(course.deadline).toLocaleString('th-TH')}</p>
                <div class="button-group">
                    <button onclick="showEditCourse(${course.id})" class="edit-button">แก้ไขรายวิชา</button>
                    <button onclick="deleteCourse(${course.id})" class="delete-button">ลบรายวิชา</button>
                </div>
            </div>
        `;
        adminCourseList.appendChild(courseElement);
    });
}

// ============ การทำงานเมื่อโหลดหน้า ============
document.addEventListener('DOMContentLoaded', function() {
    // เช็คสถานะการล็อกอิน
    checkRememberedLogin();
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showAdminFeatures();
        document.getElementById('publicView').style.display = 'none';
    } else {
        updateCourseList();
    }
});