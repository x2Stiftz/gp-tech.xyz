import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCLqGNmjwxt8I2CZlbLBhty5q6NobMs1CY",
    authDomain: "gp-tech-23b6f.firebaseapp.com",
    projectId: "gp-tech-23b6f",
    storageBucket: "gp-tech-23b6f.appspot.com",
    messagingSenderId: "741771831529",
    appId: "1:741771831529:web:4b2650b556804aec90e878",
    measurementId: "G-P3R4KJ53FQ"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 3. แก้ไขฟังก์ชันจัดการข้อมูลให้ใช้ Firebase

// ฟังก์ชันโหลดข้อมูลรายวิชา
async function loadCourses() {
    const coursesRef = ref(db, 'courses');
    onValue(coursesRef, (snapshot) => {
        const data = snapshot.val();
        courses = data ? Object.values(data) : [];
        updateCourseList();
        if (isAdmin()) {
            updateAdminCourseList();
        }
    });
}

// แก้ไขฟังก์ชัน saveCourses
async function saveCourses() {
    const coursesRef = ref(db, 'courses');
    await set(coursesRef, Object.assign({}, ...courses.map(course => ({[course.id]: course}))));
}

// แก้ไขฟังก์ชัน addCourses
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
    
    courseNames.forEach((name, index) => {
        const course = {
            name: name.trim(),
            details: courseDetails[index].trim(),
            deadline: deadline,
            id: Date.now() + Math.random()
        };
        courses.push(course);
    });
    
    await saveCourses();
    clearForm();
    alert(`เพิ่มรายวิชาสำเร็จ ${courseNames.length} รายวิชา`);
}

// แก้ไขฟังก์ชัน deleteCourse
async function deleteCourse(id) {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        courses = courses.filter(course => course.id !== id);
        await saveCourses();
    }
}

// แก้ไขฟังก์ชัน saveEditCourse
async function saveEditCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        course.name = document.getElementById('editCourseName').value;
        course.details = document.getElementById('editCourseDetails').value;
        course.deadline = document.getElementById('editDeadline').value;
        
        await saveCourses();
        cancelEdit();
        alert('บันทึกการแก้ไขเรียบร้อยแล้ว');
    }
}

// เพิ่มการโหลดข้อมูลเมื่อเริ่มต้น
document.addEventListener('DOMContentLoaded', function() {
    checkRememberedLogin();
    loadCourses(); // โหลดข้อมูลจาก Firebase
    
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showAdminFeatures();
        document.getElementById('publicView').style.display = 'none';
    }
});