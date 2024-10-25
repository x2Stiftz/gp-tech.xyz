// ============ ตัวแปรและการตั้งค่าระบบ ============
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// ============ ตัวแปรการตั้งค่า GitHub ============
const GITHUB_TOKEN = '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'; // Personal Access Token จาก GitHub
const REPO_OWNER = 'x2Stiftz';
const REPO_NAME = 'gp-tech.xyz';
const FILE_PATH = 'courses.json';

let courses = [];

// ============ ฟังก์ชันจัดการ GitHub API ============
async function updateGitHubFile(content) {
    try {
        // 1. Get the current file's SHA
        const currentFileResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!currentFileResponse.ok) {
            throw new Error('Failed to fetch current file');
        }
        
        const currentFile = await currentFileResponse.json();

        // 2. Update the file
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update courses data',
                    content: btoa(content),
                    sha: currentFile.sha
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update file: ${errorData.message}`);
        }

        return true;
    } catch (error) {
        console.error('Error updating GitHub file:', error);
        alert(`เกิดข้อผิดพลาดในการอัพเดทข้อมูล: ${error.message}`);
        return false;
    }
}

async function loadCourses() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        const content = atob(data.sha ? data.content : '');
        courses = JSON.parse(content || '[]');
        
        updateCourseList();
        updateAdminCourseList();
    } catch (error) {
        console.error("Error loading courses:", error);
        courses = []; // ใช้ array ว่างถ้าโหลดข้อมูลไม่สำเร็จ
        updateCourseList();
        updateAdminCourseList();
    }
}

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
async function addCourses() {
    const courseNamesText = document.getElementById('courseNames').value;
    const courseDetailsText = document.getElementById('courseDetails').value;
    const deadline = document.getElementById('deadline').value;
    
    if (!courseNamesText || !courseDetailsText || !deadline) {
        alert('กรุณากรอกข้อมูลให้ครบ');
        return;
    }
    
    const courseNames = courseNamesText.split('\n\n').filter(name => name.trim());
    const courseDetails = courseDetailsText.split('\n\n').filter(detail => detail.trim());
    
    if (courseNames.length !== courseDetails.length) {
        alert('จำนวนรายวิชาและรายละเอียดไม่ตรงกัน\nกรุณาตรวจสอบการเว้นบรรทัดให้ถูกต้อง');
        return;
    }
    
    try {
        // เพิ่มรายวิชาใหม่
        const newCourses = courseNames.map((name, i) => ({
            id: Date.now() + i,
            name: name.trim(),
            details: courseDetails[i].trim(),
            deadline: deadline
        }));
        
        courses = [...courses, ...newCourses];
        
        // อัพเดทไฟล์บน GitHub
        const jsonData = JSON.stringify(courses, null, 2);
        const updated = await updateGitHubFile(jsonData);
        
        if (updated) {
            clearForm();
            alert(`เพิ่มรายวิชาสำเร็จ ${courseNames.length} รายวิชา`);
            await loadCourses(); // โหลดข้อมูลใหม่
        }
    } catch (error) {
        console.error("Error adding courses:", error);
        alert(`เกิดข้อผิดพลาดในการเพิ่มรายวิชา: ${error.message}`);
    }
}

async function editCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        const newDetails = prompt('แก้ไขรายละเอียด:', course.details);
        if (newDetails !== null) {
            try {
                await fetch(`http://localhost:3000/courses/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        details: newDetails
                    })
                });
                loadCourses();
            } catch (error) {
                console.error("Error updating course:", error);
                alert('เกิดข้อผิดพลาดในการแก้ไขรายวิชา');
            }
        }
    }
}

async function deleteCourse(id) {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        try {
            courses = courses.filter(course => course.id !== id);
            const jsonData = JSON.stringify(courses, null, 2);
            const updated = await updateGitHubFile(jsonData);
            
            if (updated) {
                alert('ลบรายวิชาสำเร็จ');
                loadCourses(); // โหลดข้อมูลใหม่
            } else {
                alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            alert('เกิดข้อผิดพลาดในการลบรายวิชา');
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

async function saveEditCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        const updatedData = {
            name: document.getElementById('editCourseName').value,
            details: document.getElementById('editCourseDetails').value,
            deadline: document.getElementById('editDeadline').value
        };
        
        try {
            // อัพเดทข้อมูลใน array
            Object.assign(course, updatedData);
            
            // อัพเดทไฟล์บน GitHub
            const jsonData = JSON.stringify(courses, null, 2);
            const updated = await updateGitHubFile(jsonData);
            
            if (updated) {
                cancelEdit();
                alert('บันทึกการแก้ไขเรียบร้อยแล้ว');
                loadCourses(); // โหลดข้อมูลใหม่
            } else {
                alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
            }
        } catch (error) {
            console.error("Error updating course:", error);
            alert('เกิดข้อผิดพลาดในการแก้ไขรายวิชา');
        }
    }
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
    checkRememberedLogin();
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showAdminFeatures();
        document.getElementById('publicView').style.display = 'none';
    }
    loadCourses();
});
