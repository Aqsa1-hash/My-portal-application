import React, { useState, useEffect } from 'react'
import { db } from './firebase.js'
import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore"; 
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState('student')
  const [activeTab, setActiveTab] = useState('Announcement')

  const [notifInput, setNotifInput] = useState('')
  const [notifications, setNotifications] = useState([])

  const [grades, setGrades] = useState({
    itp: '',
    oop: '',
    calculus: '',
    english: ''
  })

  useEffect(() => {
    if (isLoggedIn) {
      fetchGrades()
    }
  }, [isLoggedIn])

  // Real-time chat 
  useEffect(() => {
    if (!isLoggedIn) return;

    const q = query(collection(db, "portalNotifications"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(msgs);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const fetchGrades = async () => {
    try {
      const docRef = doc(db, "grades", "classGrades") 
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGrades(docSnap.data())
      }
    } catch (error) {
      console.log("Error fetching: ", error)
    }
  }

  const handleSaveGrades = async () => {
    try {
      await setDoc(doc(db, "grades", "classGrades"), grades);
      setMessage('Grades Saved Successfully!')
    } catch (error) {
      setMessage('Error saving grades')
      console.log("Error saving: ", error)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifInput.trim()) return;

    try {
      await addDoc(collection(db, "portalNotifications"), {
        message: notifInput,
        sender: role,
        createdAt: serverTimestamp()
      });
      setNotifInput('');
    } catch (error) {
      console.error("Error sending notification: ", error);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()

    if (email === '' || password === '') {
      setMessage('Please fill all fields')
      return
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }

    const allowedSpecialChars = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?"
    for (let i = 0; i < password.length; i++) {
      if (!allowedSpecialChars.includes(password[i])) {
        setMessage('Password must contain only special characters')
        return
      }
    }

    setMessage('Login Successful!')
    setIsLoggedIn(true)
    setEmail('')
    setPassword('')
  }

  const tabs = [
    'Announcement',
    'Course Outline',
    'Course Material',
    'Assessments',
    'Submission',
    'Grade Book',
    'Attendance',
    'Student',
    'Teacher',
    'Notifications'
  ]

  const renderContent = () => {
    if (activeTab === 'Announcement') {
      return (
        <div>
          <p className="announcement-title">INTERNSHIP (AD4003-262-ACS-241-1)</p>
          <table className="content-table">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Description</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="no-data">No Announcement</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
    if (activeTab === 'Course Outline') {
      return (
        <div>
          <h3>Course Outline</h3>
          <ul className="outline-list">
            <li>Week 1: Introduction & Objectives</li>
            <li>Week 2: Company Orientation</li>
            <li>Week 3: Project Work</li>
          </ul>
        </div>
      )
    }
    if (activeTab === 'Course Material') {
      return (
        <div>
          <h3>Course Material</h3>
          <p>1. Internship Handbook.pdf</p>
          <p>2. Report Format.docx</p>
        </div>
      )
    }
    if (activeTab === 'Assessments') {
      return (
        <div>
          <h3>Assessments</h3>
          <p>Mid Term Report: 30%</p>
          <p>Final Report: 50%</p>
          <p>Presentation: 20%</p>
        </div>
      )
    }
    if (activeTab === 'Submission') {
      return (
        <div>
          <h3>Submission</h3>
          <button className="primary-btn">Upload Final Report</button>
        </div>
      )
    }
    if (activeTab === 'Grade Book') {
      return (
        <div>
          <h3>Grade Book</h3>
          <table className="gradebook-table">
            <tbody>
              <tr><td>Mid Term</td><td>28/30</td></tr>
              <tr><td>Final</td><td>Pending</td></tr>
            </tbody>
          </table>
        </div>
      )
    }
    if (activeTab === 'Attendance') {
      return (
        <div>
          <h3>Attendance</h3>
          <p>Total Days: 15</p>
          <p>Present: 14</p>
          <p>Absent: 1</p>
        </div>
      )
    }
    if (activeTab === 'Notifications') {
      return (
        <div>
          <h3>Areesha</h3>       

          {/* Chat Box Container */}
          <div style={{ 
            border: '1px solid #ccc', 
            height: '250px', 
            overflowY: 'scroll', 
            padding: '10px', 
            marginTop: '10px', 
            marginBottom: '15px',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {notifications.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>No messages yet.</p>
            ) : (
              notifications.map((item, index) => {
                const timeString = item.createdAt?.toDate 
                  ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : 'Just now';

                return (
                  <div key={index} style={{ 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    backgroundColor: item.sender === role ? '#dcf8c6' : '#fff',
                    alignSelf: item.sender === role ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <strong style={{ fontSize: '11px', color: '#555', display: 'block' }}>{item.sender.toUpperCase()}</strong>
                    <span>{item.message}</span>
                    <div style={{ fontSize: '9px', color: '#999', textAlign: 'right', marginTop: '4px' }}>
                      {timeString}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendNotification} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={notifInput}
              onChange={(e) => setNotifInput(e.target.value)}
              placeholder="Type message here..."
              style={{ padding: '8px', flex: '1', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="submit" className="primary-btn">Send</button>
          </form>
        </div>
      )
    }
    if (activeTab === 'Student' && role === 'student') {
      return (
        <div>
          <h3>Grades (Student View)</h3>
          <p>Grade in ITP: {grades.itp || 'Not Assigned'}</p>
          <p>Grade in OOP: {grades.oop || 'Not Assigned'}</p>
          <p>Grade in CALCULUS: {grades.calculus || 'Not Assigned'}</p>
          <p>Grade in FUNCTIONAL ENGLISH: {grades.english || 'Not Assigned'}</p>
        </div>
      )
    }
    if (activeTab === 'Teacher' && role === 'teacher') {
      return (
        <div>
          <h3>Manage Grades (Teacher View)</h3>
          <div className="form-group">
            <label>Grade in ITP: </label>
            <input
              type="text"
              value={grades.itp}
              onChange={(e) => setGrades({...grades, itp: e.target.value})}
              placeholder="Enter grade"
            />
          </div>
          <div className="form-group">
            <label>Grade in OOP: </label>
            <input
              type="text"
              value={grades.oop}
              onChange={(e) => setGrades({...grades, oop: e.target.value})}
              placeholder="Enter grade"
            />
          </div>
          <div className="form-group">
            <label>Grade in CALCULUS: </label>
            <input
              type="text"
              value={grades.calculus}
              onChange={(e) => setGrades({...grades, calculus: e.target.value})}
              placeholder="Enter grade"
            />
          </div>
          <div className="form-group">
            <label>Grade in FUNCTIONAL ENGLISH: </label>
            <input
              type="text"
              value={grades.english}
              onChange={(e) => setGrades({...grades, english: e.target.value})}
              placeholder="Enter grade"
            />
          </div>
          <button className="primary-btn" style={{marginTop: '10px'}} onClick={handleSaveGrades}>
            Save and Submit
          </button>
        </div>
      )
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>CUST Portal</h1>
          <h2>Login</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => { setRole('student'); setMessage(''); }}
              className="primary-btn"
              style={{ backgroundColor: role === 'student'? '#007bff' : '#6c757d' }}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => { setRole('teacher'); setMessage(''); }}
              className="primary-btn"
              style={{ backgroundColor: role === 'teacher'? '#007bff' : '#6c757d' }}
            >
              Teacher Login
            </button>
          </div>

          <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>
            {role === 'student'? 'Student Portal' : 'Teacher Portal'}
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email: </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div className="input-group">
              <label>Password: </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <button type="submit" className="primary-btn full-width">Login</button>
          </form>
          <p className="error-message">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div>
          <button className="icon-btn">☰</button>
          <button className="icon-btn">▦</button>
        </div>
        <span>
          <button className="icon-btn">🖨</button>
          <button className="icon-btn">⛶</button>
          <button className="icon-btn" onClick={() => setActiveTab('Notifications')}>🔔</button>
          <button className="icon-btn">👤 ({role.toUpperCase()})</button>
        </span>
      </div>

      <div className="breadcrumb">
        <span>🏠</span> &gt; <span>Internship</span> &gt; <span>Course News</span>
      </div>

      <br />

      <div className="tabs-container">
        {tabs.map((tab) => {
          if (role === 'student' && tab === 'Teacher') return null;
          if (role === 'teacher' && tab === 'Student') return null;

          return (
            <button
              key={'h-' + tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab? 'active-tab' : ''}`}
            >
              {activeTab === tab? <strong>{tab}</strong> : tab}
            </button>
          )
        })}
      </div>

      <br />

      <div className="content-card">
        {renderContent()}
      </div>

      <br />
      <div className="logout-wrapper">
        <button onClick={() => setIsLoggedIn(false)} className="logout-btn">Logout</button>
      </div>
    </div>
  )
}

export default App