import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updatePassword, 
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD56wg4VTUGMagXDQE-LSWW-3bxdim3blw",
  authDomain: "danzuhub-config.firebaseapp.com",
  projectId: "danzuhub-config",
  storageBucket: "danzuhub-config.appspot.com",
  messagingSenderId: "655147266582",
  appId: "1:655147266582:web:3552106a054a65ef1c3b37",
  measurementId: "G-BPRY0M8CV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const errorMessageEl = document.getElementById('error-message');
const successMessageEl = document.getElementById('success-message');

// Utility Functions
const showError = (message) => {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.style.display = 'block';
    setTimeout(() => {
      errorMessageEl.style.display = 'none';
    }, 5000);
  }
};

const showSuccess = (message) => {
  if (successMessageEl) {
    successMessageEl.textContent = message;
    successMessageEl.style.display = 'block';
    setTimeout(() => {
      successMessageEl.style.display = 'none';
    }, 5000);
  }
};

const validatePassword = (password) => {
  return password.length >= 8;
};

// Check Authentication State
const checkAuthState = () => {
  onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
      // User is logged in
      if (currentPage === '/login' || currentPage === '/register') {
        window.location.href = '/profile';
      }
      
      // Update profile information
      if (document.getElementById('user-email')) {
        document.getElementById('user-email').textContent = user.email;
      }
      if (document.getElementById('nav-user-email')) {
        document.getElementById('nav-user-email').textContent = user.email;
      }
      if (document.getElementById('account-created')) {
        const creationDate = new Date(user.metadata.creationTime);
        document.getElementById('account-created').textContent = creationDate.toLocaleDateString();
      }
    } else {
      // User is not logged in
      if (currentPage === '/profile') {
        window.location.href = '/login';
      }
    }
  });
};

// Initialize auth state check
checkAuthState();

// Register Functionality
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    // Validation
    if (!validatePassword(password)) {
      showError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showSuccess('Registration successful! Redirecting to profile...');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    } catch (error) {
      let errorMessage = 'Registration failed. ';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage += 'Email is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Email is invalid.';
          break;
        case 'auth/weak-password':
          errorMessage += 'Password is too weak.';
          break;
        default:
          errorMessage += error.message;
      }
      showError(errorMessage);
    }
  });
}

// Login Functionality
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    } catch (error) {
      let errorMessage = 'Login failed. ';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage += 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Email is invalid.';
          break;
        case 'auth/user-disabled':
          errorMessage += 'Account has been disabled.';
          break;
        default:
          errorMessage += error.message;
      }
      showError(errorMessage);
    }
  });
}

// Change Password Functionality
const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // Validation
    if (!validatePassword(newPassword)) {
      showError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      showError('New passwords do not match');
      return;
    }
    
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    try {
      // Reauthenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      showSuccess('Password updated successfully!');
      changePasswordForm.reset();
    } catch (error) {
      let errorMessage = 'Password update failed. ';
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage += 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          errorMessage += 'New password is too weak.';
          break;
        case 'auth/requires-recent-login':
          errorMessage += 'Please login again to change your password.';
          break;
        default:
          errorMessage += error.message;
      }
      showError(errorMessage);
    }
  });
}

// Logout Functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showSuccess('Logged out successfully. Redirecting...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      showError('Logout failed: ' + error.message);
    }
  });
}
